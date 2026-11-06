// Package encoding reads and writes the values of the wire format that the R26 client's scripts
// speak (fuse_client/51_Connection Instance Class.ls): B64 and VL64 numbers, strings, booleans and
// the raw rest of a body. Text is UTF-8.
//
// A reader takes its value from the front of r and reads no further. It returns io.EOF when r is
// empty, io.ErrUnexpectedEOF when r ends inside the value, and an error wrapping ErrMalformed when
// the bytes are not such a value. A writer refuses, with an error wrapping ErrUnencodable, a value
// that the client would not read back as it was given.
package encoding

import (
	"errors"
	"fmt"
	"io"
)

var (
	// ErrMalformed reports bytes that are not the value being read.
	ErrMalformed = errors.New("encoding: malformed value")
	// ErrUnencodable reports a value that the form being written cannot carry.
	ErrUnencodable = errors.New("encoding: unencodable value")
)

var (
	errMalformedText   = fmt.Errorf("%w: text that is not UTF-8", ErrMalformed)
	errUnencodableText = fmt.Errorf("%w: text that is not UTF-8", ErrUnencodable)
)

func readByte(r io.Reader) (byte, error) {
	if br, ok := r.(io.ByteReader); ok {
		return br.ReadByte()
	}
	var b [1]byte
	_, err := io.ReadFull(r, b[:])
	return b[0], err
}

// unexpectedEOF is the error of a read that ends after the first byte of a value.
func unexpectedEOF(err error) error {
	if errors.Is(err, io.EOF) {
		return io.ErrUnexpectedEOF
	}
	return err
}
