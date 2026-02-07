package protocol

import (
	"bytes"
	"errors"
	"io"
)

var ErrInvalidIntLength = errors.New("invalid int length")

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

	cmd, msg, err := readPacket(r, c, buf, length)
	if err != nil {
		return nil, err
	}

	return NewPacket(cmd, msg), nil
}

func ReadRawString(r io.Reader) (string, error) {
	b, err := io.ReadAll(r)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func ReadString(r io.Reader) (string, error) {
	buf := getBuf()
	defer putBuf(buf)

	if _, err := io.CopyN(buf, r, 2); err != nil {
		return "", err
	}

	b1, _ := buf.ReadByte()
	b2, _ := buf.ReadByte()

	length := int64(b1&63)*64 + int64(b2&63)
	if length == 0 {
		return "", nil
	}

	if _, err := io.CopyN(buf, r, length); err != nil {
		return "", err
	}

	b := bytes.Clone(buf.Bytes())
	return string(b), nil
}

func ReadShort(r io.Reader) (int16, error) {
	buf := make([]byte, 2)

	if _, err := io.ReadFull(r, buf); err != nil {
		return 0, err
	}

	v := int16(buf[0]&63)*64 + int16(buf[1]&63)
	return v, nil
}

func ReadInt(r io.Reader) (int, error) {
	// TODO: buf := make([]byte, 4)
	buf := getBuf()
	defer putBuf(buf)

	if _, err := io.CopyN(buf, r, 1); err != nil {
		return 0, err
	}

	header, _ := buf.ReadByte()

	vv := int(header & 3)
	neg := header&4 == 4
	length := int64((header & 56) / 8)

	if length <= 0 {
		return 0, ErrInvalidIntLength
	}

	if length == 1 {
		return vv, nil
	}

	if _, err := io.CopyN(buf, r, length-1); err != nil {
		return 0, err
	}

	b := buf.Bytes()
	v := vv
	if length > 1 {
		f := 4
		for _, p := range b {
			v += f * int(p&63)
			f *= 64
		}
	}
	if neg {
		v = -v
	}

	return v, nil
}

func ReadBool(r io.Reader) (bool, error) {
	buf := make([]byte, 1)

	if _, err := io.ReadFull(r, buf); err != nil {
		return false, err
	}

	v := (buf[0] & 63) != 0

	return v, nil
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

func WriteRawString(w io.Writer, v string) (int, error) {
	return io.WriteString(w, v)
}

func WriteString(w io.Writer, v string) (int, error) {
	n, err := io.WriteString(w, v)
	if err != nil {
		return n, err
	}
	m, err := w.Write([]byte{2})
	return n + m, err
}

func WriteInt(w io.Writer, v int) (int, error) {
	vv := byte(v & 3)
	neg := byte(0)
	if v < 0 {
		neg = 4
	}

	b0 := neg | vv
	b := []byte{b0}

	//bbb := byte(1)
	p := v / 4
	for p != 0 {
		//bbb += 1
		b = append(b, byte(p&63)|64)
		p /= 64
	}

	// header := vv | bbb*8 | neg
	b[0] |= 8 * byte(len(b))

	return w.Write(b)
}

func WriteBool(w io.Writer, v bool) (int, error) {
	if v {
		return w.Write([]byte{1 | 64})
	} else {
		return w.Write([]byte{0 | 64})
	}
}
