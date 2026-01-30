package protocol

import (
	"bytes"
	"io"
)

func readFixed(r io.Reader, size int) ([]byte, error) {
	buf := make([]byte, size)
	bytesRead := 0

again:
	n, err := r.Read(buf[bytesRead:])
	if err != nil {
		return nil, err
	}

	bytesRead += n
	if bytesRead < size {
		goto again
	}

	return buf, nil
}

func readLength(r io.Reader) (int, error) {
	buf, err := readFixed(r, 3)
	if err != nil {
		return 0, err
	}

	l3 := buf[0]
	l2 := buf[1]
	l1 := buf[2]

	length := int(l3&63)*4096 + int(l2&63)*64 + int(l1&63)
	return length, nil
}

func ReadPacket(r io.Reader) (*Packet, error) {
	length, err := readLength(r)
	if err != nil {
		return nil, err
	}

	buf, err := readFixed(r, length)
	if err != nil {
		return nil, err
	}

	b1 := buf[0]
	b2 := buf[1]
	cmd := int16(b1&63)*64 + int16(b2&63)

	msg := NewMessage()
	msg.Write(buf[2:])

	return NewPacket(cmd, msg), nil
}

func WritePacket(w io.Writer, p *Packet) error {
	var buf bytes.Buffer

	if err := buf.WriteByte(byte(p.Cmd/64) | 64); err != nil {
		return err
	}
	if err := buf.WriteByte(byte(p.Cmd&63) | 64); err != nil {
		return err
	}

	if p.Message != nil {
		if _, err := buf.Write(p.Message.Bytes()); err != nil {
			return err
		}
	}

	if err := buf.WriteByte(1); err != nil {
		return err
	}

	_, err := w.Write(buf.Bytes())
	return err
}
