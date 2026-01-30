package protocol

import (
	"bytes"
	"errors"
	"fmt"
)

var ErrInvalidStringLength = errors.New("invalid string length")

type Message struct {
	buf *bytes.Buffer
}

func NewMessage() *Message {
	return &Message{buf: getBuf()}
}

func (msg *Message) String() string {
	if msg.buf == nil {
		return "nil"
	}
	return fmt.Sprintf("%x", msg.buf.Bytes())
}

func (msg *Message) Dispose() {
	putBuf(msg.buf)
	msg.buf = nil
}

func (msg *Message) ReadRawString() string {
	buf := bytes.Clone(msg.buf.Bytes())
	return string(buf)
}

func (msg *Message) WriteRawString(v string) error {
	_, err := msg.buf.WriteString(v)
	return err
}

func (msg *Message) ReadString() (string, error) {
	b1, err := msg.buf.ReadByte()
	if err != nil {
		return "", err
	}
	b2, err := msg.buf.ReadByte()
	if err != nil {
		return "", err
	}
	length := uint16(b1&63)*64 + uint16(b2&63)

	b := make([]byte, length)
	n, err := msg.buf.Read(b)
	if err != nil {
		return "", err
	}

	if n != int(length) {
		return "", ErrInvalidStringLength
	}

	v := string(b)

	return v, nil
}

func (msg *Message) WriteString(v string) error {
	if _, err := msg.buf.WriteString(v); err != nil {
		return err
	}
	if err := msg.buf.WriteByte(2); err != nil {
		return err
	}
	return nil
}

func (msg *Message) ReadShort() (int16, error) {
	b1, err := msg.buf.ReadByte()
	if err != nil {
		return 0, err
	}
	b2, err := msg.buf.ReadByte()
	if err != nil {
		return 0, err
	}

	v := int16(b1&63)*64 + int16(b2&63)

	return v, nil
}

func (msg *Message) ReadInt() (int, error) {
	header, err := msg.buf.ReadByte()
	if err != nil {
		return 0, err
	}

	vv := int(header & 3)
	neg := header&4 == 4
	bbb := (header & 56) / 8

	b := make([]byte, bbb)
	n, err := msg.buf.Read(b)
	if err != nil {
		return 0, nil
	}

	if n != int(bbb) {
		// TODO: error
	}

	v := int(vv)
	if bbb > 1 {
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

func (msg *Message) WriteInt(v int) error {
	vv := byte(v & 3)
	neg := byte(0)
	if v < 0 {
		neg = 4
	}

	bbb := byte(1)
	p := v / 4
	var b []byte
	for p != 0 {
		bbb += 1
		b = append(b, byte(p&63)|64)
		p /= 64
	}

	header := vv | bbb*8 | neg
	if err := msg.buf.WriteByte(header); err != nil {
		return err
	}

	if _, err := msg.buf.Write(b); err != nil {
		return err
	}

	return nil
}

func (msg *Message) ReadBool() (bool, error) {
	b1, err := msg.buf.ReadByte()
	if err != nil {
		return false, err
	}

	v := (b1 & 63) != 0

	return v, nil
}

func (msg *Message) WriteBool(v bool) error {
	if v {
		return msg.buf.WriteByte(1 | 64)
	} else {
		return msg.buf.WriteByte(0 | 64)
	}
}
