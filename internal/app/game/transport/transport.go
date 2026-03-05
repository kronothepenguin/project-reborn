package transport

import "io"

type Handler func(Connection)

type Transport interface {
	Handle(handler Handler)
}

type Connection interface {
	io.ReadWriteCloser
	RemoteAddr() string
}
