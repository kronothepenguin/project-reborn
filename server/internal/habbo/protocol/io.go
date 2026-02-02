package protocol

import (
	"bytes"
	"io"
	"log/slog"
)

func readLength(r io.Reader, c *Crypto, buf *bytes.Buffer) (int, error) {
	_, err := io.CopyN(buf, r, 3)
	if err != nil {
		return 0, err
	}

	b := buf.Next(3)
	if c.decoder != nil {
		b = c.Decode(b)
	}

	l3 := b[0]
	l2 := b[1]
	l1 := b[2]

	length := int(l3&63)*4096 + int(l2&63)*64 + int(l1&63)
	return length, nil
}

func readPacket(r io.Reader, c *Crypto, buf *bytes.Buffer, length int) (cmd int16, msg *Message, err error) {
	_, err = io.CopyN(buf, r, int64(length))
	if err != nil {
		return
	}

	b := buf.Next(length)
	if c.decoder != nil {
		b = c.Decode(b)
	}

	b1 := b[0]
	b2 := b[1]
	cmd = int16(b1&63)*64 + int16(b2&63)

	msg = NewMessage()
	_, err = msg.buf.Write(b[2:])

	if err != nil {
		msg.Dispose()
		msg = nil
	}

	return
}

func ReadPacket(r io.Reader, c *Crypto) (*Packet, error) {
	buf := getBuf()
	defer putBuf(buf)

	length, err := readLength(r, c, buf)
	if err != nil {
		return nil, err
	}
	slog.Debug("ReadPacket", slog.Int("length", length))

	cmd, msg, err := readPacket(r, c, buf, length)
	if err != nil {
		return nil, err
	}

	return NewPacket(cmd, msg), nil
}

func writeCommand(w io.ByteWriter, cmd int16) error {
	if err := w.WriteByte(byte(cmd/64) | 64); err != nil {
		return err
	}
	if err := w.WriteByte(byte(cmd&63) | 64); err != nil {
		return err
	}
	return nil
}

func writeMessage(w io.Writer, msg *Message) error {
	if msg == nil {
		return nil
	}

	if _, err := w.Write(msg.buf.Bytes()); err != nil {
		return err
	}
	return nil
}

func WritePacket(w io.Writer, p *Packet) error {
	buf := getBuf()
	defer putBuf(buf)

	if err := writeCommand(buf, p.Command); err != nil {
		return err
	}

	if err := writeMessage(buf, p.Message); err != nil {
		return err
	}

	if err := buf.WriteByte(1); err != nil {
		return err
	}

	_, err := w.Write(buf.Bytes())
	return err
}
