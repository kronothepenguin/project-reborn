package transport

import "io"

type Transport interface {
	Init()
	Dispose()

	Handle(io.ReadWriter)
}
