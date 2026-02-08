package virtual

import "io"

type Connection interface {
	Send(cmd string, args ...io.WriterTo) error
}

type nopConnection struct{}

func (*nopConnection) Send(cmd string, args ...io.WriterTo) error { return nil }
