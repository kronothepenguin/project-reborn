package encoding

import (
	"fmt"
	"io"
	"math"
)

const maxVL64 = 6

// ReadVL64 reads a number as the client's GetIntFrom does. The low 6 bits of the first character
// hold the number of characters in bits 3 to 5, the sign in bit 2 and the lowest 2 bits of the
// absolute value; each next character holds 6 more bits of it, the least significant first. A
// count of 0, which GetIntFrom reads without consuming, a count of 7, which it cannot read, and a
// value beyond the 32 bits of a Lingo integer are malformed.
func ReadVL64(r io.Reader) (int32, error) {
	first, err := readByte(r)
	if err != nil {
		return 0, err
	}
	count := int(first>>3) & 7
	if count < 1 || count > maxVL64 {
		return 0, fmt.Errorf("%w: VL64 of %d characters", ErrMalformed, count)
	}
	v := int64(first & 3)
	for i := range count - 1 {
		c, err := readByte(r)
		if err != nil {
			return 0, unexpectedEOF(err)
		}
		v |= int64(c&63) << (6*i + 2)
	}
	if first&4 != 0 {
		v = -v
	}
	if v < math.MinInt32 || v > math.MaxInt32 {
		return 0, fmt.Errorf("%w: VL64 %d beyond 32 bits", ErrMalformed, v)
	}
	return int32(v), nil
}

// WriteVL64 writes v as the client's sendNew writes an #integer, in 1 to 6 characters.
func WriteVL64(w io.Writer, v int32) error {
	var b [maxVL64]byte
	abs := int64(v)
	var sign byte
	if abs < 0 {
		abs, sign = -abs, 4
	}
	b[0] = 64 | sign | byte(abs&3)
	n := 1
	for abs >>= 2; abs != 0; abs >>= 6 {
		b[n] = 64 | byte(abs&63)
		n++
	}
	b[0] |= byte(n) << 3
	_, err := w.Write(b[:n])
	return err
}
