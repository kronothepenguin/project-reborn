// Package r26 speaks the protocol of the R26 client on its info connection: it frames the client's packets, sends
// HELLO, and runs the handler that each packet's id names. The ids and their names come from the client's scripts, one
// file per cast, as plans/server/reference/r26 maps them.
package r26

import (
	"bufio"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"strconv"
	"sync/atomic"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/server/transport"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// handler handles one packet of a session, given its body.
type handler func(s *session, body []byte)

// handlers holds the handler of each command id the server handles, from every cast. Every other id is logged as
// unhandled.
var handlers = join(entryInitHandlers, clubHandlers, sharedHandlers, navigatorHandlers, kioskRoomHandlers, roomHandlers)

// join puts the handlers of every cast in one map. A command has one handler, even when several casts send it, as
// hh_entry_init and hh_tutorial both send 228, so a repeated id is a mistake of the server, caught as it starts.
func join(casts ...map[int]handler) map[int]handler {
	all := make(map[int]handler)
	for _, cast := range casts {
		for id, h := range cast {
			if _, ok := all[id]; ok {
				panic(fmt.Sprintf("r26: command %d has two handlers", id))
			}
			all[id] = h
		}
	}
	return all
}

// Serve speaks R26 with a client of the info connection. It sends HELLO, then reads the client's packets one after
// another and runs the handler of each one's id, in the connection's own goroutine, so that no session waits on
// another. A packet that nothing handles is logged with its id, its name when r26 knows it and its size, never its
// body, and the session goes on. Serve returns when the client leaves or sends bytes that are not a packet, and the
// transport then closes the connection. The habbo the session logged in, if any, is logged out first.
func Serve(db *sql.DB, c transport.Conn) {
	serve(db, c, handlers)
}

// session is one client of the info connection. Its handlers run one after another in the session's goroutine, so
// only ended, lastPong and the outbox are shared: Notify runs in the goroutine of the session that sends the event.
type session struct {
	conn transport.Conn
	addr string
	db   *sql.DB
	// checked is set once a VERSIONCHECK passes, and machineID by UNIQUEID, for the login.
	checked   bool
	machineID string
	// habbo is the avatar id of the habbo the session logged in, 0 before.
	habbo int64
	// ended is set once the session ends, after which a message sent goes nowhere and a read or a write that fails is
	// not an error.
	ended atomic.Bool
	// outbox holds the messages waiting for write, in order (plans/server decision 0073). A nil message ends the
	// writing once the messages before it are written.
	outbox chan []byte
	// lastPong is when the client last answered a PING, in Unix nanoseconds, or when the session started.
	lastPong atomic.Int64
}

func serve(db *sql.DB, c transport.Conn, handlers map[int]handler) {
	s := &session{conn: c, addr: c.RemoteAddr(), db: db, outbox: make(chan []byte, settings.GetIntOr("game.outboxSize", 500))}
	s.lastPong.Store(time.Now().UnixNano())
	written := make(chan struct{})
	go s.write(written)
	done := make(chan struct{})
	go s.keepAlive(done)
	// The ping loop runs until the writer is done, so that its timeout still ends a session whose last messages wait
	// on a client that stopped reading.
	defer func() {
		s.end()
		s.logout()
		<-written
		close(done)
	}()
	s.reply(hello, nil)
	r := bufio.NewReader(c)
	for {
		b, err := r.Peek(1)
		if errors.Is(err, io.EOF) {
			return
		}
		if err != nil {
			s.closed(err)
			return
		}
		// Whenever the client disconnects, it first writes one byte 0 where a packet would start.
		if b[0] == 0 {
			return
		}
		id, body, err := readPacket(r)
		if err != nil {
			s.closed(err)
			return
		}
		if h, ok := handlers[id]; ok {
			h(s, body)
			// A handler that closed the session leaves the commands the client sent in the same frame unread.
			if s.ended.Load() {
				return
			}
			continue
		}
		slog.Info(fmt.Sprintf("r26 %s unhandled %s, %s", s.addr, command(id), size(len(body))))
	}
}

// send queues a message for the client (plans/server decision 0073), and fails only for a message the protocol cannot
// carry. Once the session has ended, a message goes nowhere. A client whose outbox is full has stopped reading, and its
// session ends at once.
func (s *session) send(id int, body []byte) error {
	b, err := encodePacket(id, body)
	if err != nil {
		return err
	}
	if s.ended.Load() {
		return nil
	}
	select {
	case s.outbox <- b:
	default:
		if !s.ended.Swap(true) {
			slog.Warn(fmt.Sprintf("r26 %s closed: %d messages waiting", s.addr, cap(s.outbox)))
		}
		s.conn.Close()
	}
	return nil
}

// write writes the outbox in order until a nil message or a write that fails, then closes the connection. It runs in
// a goroutine of its own, so that a client that stops reading holds up nobody who sends to it.
func (s *session) write(written chan<- struct{}) {
	defer close(written)
	defer s.conn.Close()
	for {
		b := <-s.outbox
		if b == nil {
			return
		}
		if _, err := s.conn.Write(b); err != nil {
			s.closed(err)
			s.ended.Store(true)
			return
		}
	}
}

// end ends the session from the server's side: the connection closes once the messages sent before are written. With
// a full outbox, the client has stopped reading, and the connection closes at once; the writer then fails on what
// waits and stops.
func (s *session) end() {
	if s.ended.Swap(true) {
		return
	}
	select {
	case s.outbox <- nil:
	default:
		s.conn.Close()
	}
}

// abort ends the session at once, without writing what waits: the client stopped answering.
func (s *session) abort() {
	s.ended.Store(true)
	s.conn.Close()
	select {
	case s.outbox <- nil:
	default:
	}
}

func (s *session) closed(err error) {
	if s.ended.Load() {
		return
	}
	slog.Warn(fmt.Sprintf("r26 %s closed: %v", s.addr, err))
}

// Notify turns a rule's event into its message (plans/server decision 0039).
func (s *session) Notify(event any) {
	switch e := event.(type) {
	case game.ConcurrentLogin:
		s.reply(hotelLogout, vl64(logoutConcurrent))
		s.end()
	case game.RoomEntered:
		s.sendEntered(e.Visitor)
	case game.RoomLeft:
		s.reply(roomLogout, []byte(strconv.Itoa(e.Index)))
	case game.DoorbellRang:
		s.reply(doorbellRinging, []byte(e.Name))
	case game.DoorbellAnswered:
		if e.LetIn {
			s.reply(flatLetIn, str(e.Name))
		} else {
			s.reply(flatNotAllowedToEnter, str(e.Name))
		}
	case game.LetIn:
		s.reply(flatLetIn, str(""))
	case game.TurnedAway:
		s.reply(flatNotAllowedToEnter, str(""))
	case game.Kicked:
		s.reply(clc, nil)
	}
}

// keepAlive sends PING every game.pingSeconds, and closes the session once it has gone game.pongTimeoutSeconds
// without a PONG (plans/server decision 0042). It reads both again each time it wakes, and wakes for the next PING or
// for the timeout, whichever comes first, so a silent client is closed when its time is up, not at the next PING.
func (s *session) keepAlive(done <-chan struct{}) {
	next := time.Now().Add(seconds("game.pingSeconds", 30))
	for {
		lastPong := time.Unix(0, s.lastPong.Load())
		deadline := lastPong.Add(seconds("game.pongTimeoutSeconds", 90))
		now := time.Now()
		if !now.Before(deadline) {
			slog.Info(fmt.Sprintf("r26 %s closed: no PONG for %s", s.addr, now.Sub(lastPong).Round(time.Second)))
			s.abort()
			return
		}
		if !now.Before(next) {
			if err := s.send(ping, nil); err != nil {
				return
			}
			next = now.Add(seconds("game.pingSeconds", 30))
		}
		wake := next
		if deadline.Before(wake) {
			wake = deadline
		}
		select {
		case <-done:
			return
		case <-time.After(time.Until(wake)):
		}
	}
}

// seconds reads a setting of seconds, or fallback, its default, when the settings are not loaded.
func seconds(key string, fallback int) time.Duration {
	return time.Duration(settings.GetIntOr(key, fallback)) * time.Second
}

func (s *session) logout() {
	if s.habbo == 0 {
		return
	}
	if err := game.Logout(context.Background(), s.db, s, s.habbo); err != nil {
		slog.Error(fmt.Sprintf("r26 %s: %v", s.addr, err))
	}
}

// command names a command in the log: by its name and id when r26 knows it, by its id otherwise.
func command(id int) string {
	for _, names := range []map[int]string{entryInitCommands, navigatorCommands, kioskRoomCommands, roomCommands} {
		if name, ok := names[id]; ok {
			return name + " (" + strconv.Itoa(id) + ")"
		}
	}
	return strconv.Itoa(id)
}

func size(n int) string {
	if n == 1 {
		return "1 byte"
	}
	return strconv.Itoa(n) + " bytes"
}
