package virtual

import "io"

type Connection interface {
	Send(cmd string, args ...io.WriterTo) error
}
