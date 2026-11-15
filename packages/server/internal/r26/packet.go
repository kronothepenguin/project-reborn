package r26

import (
	"bytes"
	"errors"
	"fmt"
	"io"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
)

// readPacket reads a packet as the client's send writes one: 3 B64 characters of length, then 2 of the command id and
// the body, which the length counts. It returns io.EOF when r is empty, io.ErrUnexpectedEOF when r ends inside the
// packet, and an error wrapping encoding.ErrMalformed for a length too short to hold the id.
func readPacket(r io.Reader) (id int, body []byte, err error) {
	n, err := encoding.ReadB64(r, 3)
	if err != nil {
		return 0, nil, err
	}
	if n < 2 {
		return 0, nil, fmt.Errorf("%w: a packet length of %d, too short for its id", encoding.ErrMalformed, n)
	}
	if id, err = encoding.ReadB64(r, 2); err != nil {
		return 0, nil, cutShort(err)
	}
	body = make([]byte, n-2)
	if _, err := io.ReadFull(r, body); err != nil {
		return 0, nil, cutShort(err)
	}
	return id, body, nil
}

// cutShort is the error of a read that ends inside a packet.
func cutShort(err error) error {
	if errors.Is(err, io.EOF) {
		return io.ErrUnexpectedEOF
	}
	return err
}

// encodePacket frames a message as the client's msghandler reads one: 2 B64 characters of the message id, the body,
// and the character 1, which ends it. The client ends a message at its first character 1, so a body that holds one
// is refused with an error wrapping encoding.ErrUnencodable.
func encodePacket(id int, body []byte) ([]byte, error) {
	if bytes.IndexByte(body, 1) >= 0 {
		return nil, fmt.Errorf("%w: a message body that holds the character 1, which ends a message", encoding.ErrUnencodable)
	}
	var b bytes.Buffer
	b.Grow(2 + len(body) + 1)
	if err := encoding.WriteB64(&b, id, 2); err != nil {
		return nil, err
	}
	b.Write(body)
	b.WriteByte(1)
	return b.Bytes(), nil
}
