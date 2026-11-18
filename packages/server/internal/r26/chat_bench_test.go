package r26

import (
	"bufio"
	"bytes"
	"maps"
	"net"
	"path/filepath"
	"strconv"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// BenchmarkChat measures the game's busiest settings reader: a habbo alone in its room says a line, and the session
// answers with the chat message, through the fake session of these tests on a database of its own.
func BenchmarkChat(b *testing.B) {
	ctx := b.Context()
	db, err := store.Open(filepath.Join(b.TempDir(), "hotel.db"))
	if err != nil {
		b.Fatal(err)
	}
	b.Cleanup(func() { db.Close() })
	list, err := store.Updates()
	if err != nil {
		b.Fatal(err)
	}
	q := store.New(db)
	now := time.Now().UTC()
	user, err := q.CreateUser(ctx, store.CreateUserParams{Email: "chatter@example.com", BornOn: time.Date(2000, 1, 2, 0, 0, 0, 0, time.UTC), CreatedIP: "127.0.0.1", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		b.Fatal(err)
	}
	if err := q.CreateWallet(ctx, store.CreateWalletParams{UserID: user.ID, UpdatedAt: now}); err != nil {
		b.Fatal(err)
	}
	avatar, err := q.CreateAvatar(ctx, store.CreateAvatarParams{UserID: user.ID, Name: "BenchChatter", Figure: "hd-180-1", Gender: "M", Motto: "Hello", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		b.Fatal(err)
	}
	if err := q.CreateSession(ctx, store.CreateSessionParams{ID: "cms-bench", UserID: user.ID, AvatarID: avatar.ID, IP: "127.0.0.1", CreatedAt: now, LastSeenAt: now, ExpiresAt: now.Add(time.Hour)}); err != nil {
		b.Fatal(err)
	}
	if err := q.CreateSSOTicket(ctx, store.CreateSSOTicketParams{ID: "bench", SessionID: "cms-bench", AvatarID: avatar.ID, IP: "127.0.0.1", CreatedAt: now}); err != nil {
		b.Fatal(err)
	}
	flat, err := q.CreateRoom(ctx, store.CreateRoomParams{AvatarID: avatar.ID, RoomCategoryID: 2, RoomModelID: 1, Name: "Bench", Door: "open", CreatedAt: now})
	if err != nil {
		b.Fatal(err)
	}

	// The version check is the login tests'; here every session passes it.
	h := maps.Clone(handlers)
	h[1170] = func(s *session, _ []byte) { s.checked = true }
	server, client := net.Pipe()
	served := make(chan struct{})
	go func() {
		defer close(served)
		defer server.Close()
		serve(db, store.NewUpdateCheck(db, list), pipeConn{server, b.Name()}, h)
	}()
	b.Cleanup(func() {
		client.Close()
		<-served
	})
	messages := make(chan int, 64)
	go func() {
		defer close(messages)
		r := bufio.NewReader(client)
		for {
			id, err := encoding.ReadB64(r, 2)
			if err != nil {
				return
			}
			if _, err := r.ReadString(1); err != nil {
				return
			}
			messages <- id
		}
	}()
	send := func(id int, body string) {
		var p bytes.Buffer
		if err := encoding.WriteB64(&p, 2+len(body), 3); err != nil {
			b.Fatal(err)
		}
		if err := encoding.WriteB64(&p, id, 2); err != nil {
			b.Fatal(err)
		}
		p.WriteString(body)
		if _, err := client.Write(p.Bytes()); err != nil {
			b.Fatal(err)
		}
	}
	until := func(want int) {
		timer := time.NewTimer(5 * time.Second)
		defer timer.Stop()
		for {
			select {
			case id, ok := <-messages:
				if !ok {
					b.Fatalf("the session ended before %d", want)
				}
				if id == want {
					return
				}
			case <-timer.C:
				b.Fatalf("no %d within 5 seconds", want)
			}
		}
	}
	str := func(s string) string {
		var w bytes.Buffer
		if err := encoding.WriteB64String(&w, s); err != nil {
			b.Fatal(err)
		}
		return w.String()
	}
	vl := func(v int) string { return string(vl64(v)) }

	until(hello)
	send(1170, "")
	send(204, str("bench"))
	until(loginOK)
	id := strconv.FormatInt(flat.ID, 10)
	send(2, "@"+vl(int(flat.ID))+vl(0))
	until(opcOK)
	send(57, id)
	until(flatLetIn)
	send(59, id)
	until(roomReady)
	for _, c := range []int{60, 61, 62, 63, 64} {
		send(c, "")
	}
	until(34)

	line := str("hello there :)")
	for b.Loop() {
		send(52, line)
		until(chatMessages[game.ChatSay])
	}
}
