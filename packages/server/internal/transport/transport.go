// Package transport carries a game client's bytes over TCP or a WebSocket. The protocol sees both
// as the same Conn and frames its packets itself, so a read or a WebSocket frame need not be one
// packet.
package transport

import "io"

// Conn is a client's connection as a stream of bytes. Its methods may be called from several
// goroutines at once.
type Conn interface {
	io.Reader // receive
	io.Writer // send
	io.Closer
	RemoteAddr() string
}

// Handler serves one connection, which is closed once the handler returns.
type Handler func(Conn)

func serve(c Conn, h Handler) {
	defer c.Close()
	h(c)
}
