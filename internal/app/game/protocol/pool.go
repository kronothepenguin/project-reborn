package protocol

import (
	"bytes"
	"sync"
)

const maxCap = 4 * 1024

var bufPool sync.Pool = sync.Pool{
	New: func() any {
		return new(bytes.Buffer)
	},
}

func getBuf() *bytes.Buffer {
	return bufPool.Get().(*bytes.Buffer)
}

func putBuf(buf *bytes.Buffer) {
	if buf.Cap() < maxCap {
		buf.Reset()
		bufPool.Put(buf)
	}
}
