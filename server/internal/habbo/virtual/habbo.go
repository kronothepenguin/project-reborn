package virtual

import "io"

type Habbo interface {
	Connection() io.ReadWriteCloser
}
