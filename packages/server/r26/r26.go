// Package r26 speaks the protocol of the R26 client on its info connection: it frames the client's packets, sends
// HELLO, and runs the handler that each packet's id names. The ids and their names come from the client's scripts, one
// file per cast, as plans/server/reference/r26 maps them.
package r26

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/server/transport"
)

// handler handles one packet of a session, given its body.
type handler func(s *session, body []byte)

// handlers holds the handler of each command id the server handles. Every other id is logged as unhandled.
var handlers = map[int]handler{}

// Serve speaks R26 with a client of the info connection. It sends HELLO, then reads the client's packets one after
// another and runs the handler of each one's id, in the connection's own goroutine, so that no session waits on
// another. A packet that nothing handles is logged with its id, its name when r26 knows it and its size, never its
// body, and the session goes on. Serve returns when the client leaves or sends bytes that are not a packet, and the
// transport then closes the connection.
func Serve(c transport.Conn) {
	serve(c, handlers)
}

type session struct {
	conn transport.Conn
	addr string
}

func serve(c transport.Conn, handlers map[int]handler) {
	s := &session{conn: c, addr: c.RemoteAddr()}
	if err := s.send(hello, nil); err != nil {
		s.closed(err)
		return
	}
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
			continue
		}
		slog.Info(fmt.Sprintf("r26 %s unhandled %s, %s", s.addr, command(id), size(len(body))))
	}
}

func (s *session) send(id int, body []byte) error {
	return writePacket(s.conn, id, body)
}

func (s *session) closed(err error) {
	slog.Warn(fmt.Sprintf("r26 %s closed: %v", s.addr, err))
}

// command names a command in the log: by its name and id when r26 knows it, by its id otherwise.
func command(id int) string {
	if name, ok := entryInitCommands[id]; ok {
		return name + " (" + strconv.Itoa(id) + ")"
	}
	return strconv.Itoa(id)
}

func size(n int) string {
	if n == 1 {
		return "1 byte"
	}
	return strconv.Itoa(n) + " bytes"
}
