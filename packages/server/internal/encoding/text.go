package encoding

import (
	"fmt"
	"io"
	"strings"
	"unicode/utf8"
)

const maxB64String = 1<<12 - 1

// ReadString reads a string as the client's GetStrFrom does: the text up to the character 2 that
// ends it, which is consumed too. A string whose end is missing is cut short.
func ReadString(r io.Reader) (string, error) {
	var b strings.Builder
	for {
		c, err := readByte(r)
		if err != nil {
			if b.Len() > 0 {
				err = unexpectedEOF(err)
			}
			return "", err
		}
		if c == 2 {
			break
		}
		b.WriteByte(c)
	}
	s := b.String()
	if !utf8.ValidString(s) {
		return "", errMalformedText
	}
	return s, nil
}

// WriteString writes s and the character 2 that ends it, for the client's GetStrFrom. s must be
// UTF-8 and must not hold the character 2.
func WriteString(w io.Writer, s string) error {
	if strings.IndexByte(s, 2) >= 0 {
		return fmt.Errorf("%w: a string that holds the character 2, which ends it", ErrUnencodable)
	}
	if !utf8.ValidString(s) {
		return errUnencodableText
	}
	_, err := io.WriteString(w, s+"\x02")
	return err
}

// ReadB64String reads a string as the client's sendNew writes a #string: its length in bytes in 2
// B64 characters, then its bytes.
func ReadB64String(r io.Reader) (string, error) {
	n, err := ReadB64(r, 2)
	if err != nil {
		return "", err
	}
	b := make([]byte, n)
	if _, err := io.ReadFull(r, b); err != nil {
		return "", unexpectedEOF(err)
	}
	if !utf8.Valid(b) {
		return "", errMalformedText
	}
	return string(b), nil
}

// WriteB64String writes s as the client's sendNew writes a #string: its length in bytes in 2 B64
// characters, then its bytes. s must be UTF-8 and at most 4095 bytes long.
func WriteB64String(w io.Writer, s string) error {
	if !utf8.ValidString(s) {
		return errUnencodableText
	}
	if len(s) > maxB64String {
		return fmt.Errorf("%w: a string of %d bytes, longer than %d", ErrUnencodable, len(s), maxB64String)
	}
	if err := WriteB64(w, len(s), 2); err != nil {
		return err
	}
	_, err := io.WriteString(w, s)
	return err
}

// ReadRaw reads the rest of r as text, as a client's handler takes the rest of a message's content
// and as the server takes the body of a command that the client's send wrote as text.
func ReadRaw(r io.Reader) (string, error) {
	b, err := io.ReadAll(r)
	if err != nil {
		return "", err
	}
	if !utf8.Valid(b) {
		return "", errMalformedText
	}
	return string(b), nil
}

// WriteRaw writes s as it is, as text with no length and no end. s must be UTF-8.
func WriteRaw(w io.Writer, s string) error {
	if !utf8.ValidString(s) {
		return errUnencodableText
	}
	_, err := io.WriteString(w, s)
	return err
}
