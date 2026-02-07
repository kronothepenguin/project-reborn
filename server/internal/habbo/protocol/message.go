package protocol

import (
	"bytes"
	"fmt"
)

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
	r, _ := ReadRawString(msg.buf)
	return r
}

func (msg *Message) WriteRawString(v string) error {
	_, err := WriteRawString(msg.buf, v)
	return err
}

func (msg *Message) ReadString() (string, error) {
	return ReadString(msg.buf)
}

func (msg *Message) WriteString(v string) error {
	_, err := WriteString(msg.buf, v)
	return err
}

func (msg *Message) ReadShort() (int16, error) {
	return ReadShort(msg.buf)
}

func (msg *Message) ReadInt() (int, error) {
	return ReadInt(msg.buf)
}

func (msg *Message) WriteInt(v int) error {
	_, err := WriteInt(msg.buf, v)
	return err
}

func (msg *Message) ReadBool() (bool, error) {
	return ReadBool(msg.buf)
}

func (msg *Message) WriteBool(v bool) error {
	_, err := WriteBool(msg.buf, v)
	return err
}

func WriteArgumentsTo(m *Message, args ...Argument) error {
	for _, arg := range args {
		if _, err := arg.WriteTo(m.buf); err != nil {
			return err
		}
	}
	return nil
}
