package encoding

import (
	"fmt"
	"io"
)

const maxB64Width = 3

// ReadB64 reads a number of width characters, from 1 to 3, each 64 plus 6 bits of it, the most
// significant first. Like the client, it keeps only the low 6 bits of each character. Message and
// command ids, short values and string lengths take 2 characters, the length of a client's packet
// takes 3, and a byte, which the client reads with GetByteFrom, takes 1.
func ReadB64(r io.Reader, width int) (int, error) {
	if err := checkWidth(width); err != nil {
		return 0, err
	}
	v := 0
	for i := range width {
		c, err := readByte(r)
		if err != nil {
			if i > 0 {
				err = unexpectedEOF(err)
			}
			return 0, err
		}
		v = v<<6 | int(c&63)
	}
	return v, nil
}

// WriteB64 writes v as a number of width characters, from 1 to 3. Since the client reads 6 bits
// from each character, v must be from 0 to 64 to the power of width, less one.
func WriteB64(w io.Writer, v, width int) error {
	if err := checkWidth(width); err != nil {
		return err
	}
	if v < 0 || v >= 1<<(6*width) {
		return fmt.Errorf("%w: %d in B64 of %d characters", ErrUnencodable, v, width)
	}
	var b [maxB64Width]byte
	for i := width - 1; i >= 0; i-- {
		b[i] = 64 | byte(v&63)
		v >>= 6
	}
	_, err := w.Write(b[:width])
	return err
}

func checkWidth(width int) error {
	if width < 1 || width > maxB64Width {
		return fmt.Errorf("encoding: B64 of %d characters, not 1 to %d", width, maxB64Width)
	}
	return nil
}

// ReadBool reads a boolean as the client's GetBoolFrom does: one character, true when its low 6
// bits are not 0.
func ReadBool(r io.Reader) (bool, error) {
	c, err := readByte(r)
	if err != nil {
		return false, err
	}
	return c&63 != 0, nil
}

// WriteBool writes v as the client's sendNew writes a #boolean: "A" for true and "@" for false.
func WriteBool(w io.Writer, v bool) error {
	c := byte('@')
	if v {
		c = 'A'
	}
	_, err := w.Write([]byte{c})
	return err
}
