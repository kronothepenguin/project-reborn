package transport

import (
	"log/slog"
	"net"
)

type tcpConn struct {
	net.Conn
}

func (c *tcpConn) RemoteAddr() string {
	return c.Conn.RemoteAddr().String()
}

type TCP struct {
	address  string
	listener net.Listener
	handler  Handler
}

func NewTCP(address string) *TCP {
	return &TCP{address: address}
}

func (t *TCP) Handle(handler Handler) {
	t.handler = handler
}

func (t *TCP) Listen() error {
	ln, err := net.Listen("tcp", t.address)
	if err != nil {
		return err
	}

	t.listener = ln

	for {
		conn, err := ln.Accept()
		if err != nil {
			slog.Error("tcp accept", slog.Any("error", err))
			return err
		}

		go t.handler(&tcpConn{conn})
	}
}

func (t *TCP) Close() error {
	if t.listener != nil {
		return t.listener.Close()
	}
	return nil
}
