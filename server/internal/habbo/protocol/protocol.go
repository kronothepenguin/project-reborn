package protocol

import (
	"io"
	"log/slog"
)

type RawString string

func (s RawString) WriteTo(m *Message) error {
	return m.WriteRawString(string(s))
}

type String string

func (s String) WriteTo(m *Message) error {
	return m.WriteString(string(s))
}

type Int int

func (i Int) WriteTo(m *Message) error {
	return m.WriteInt(int(i))
}

type Bool bool

func (b Bool) WriteTo(m *Message) error {
	return m.WriteBool(bool(b))
}

type Argument interface {
	WriteTo(*Message) error
}

func WriteArgumentsTo(m *Message, args ...Argument) error {
	for _, arg := range args {
		if err := arg.WriteTo(m); err != nil {
			return err
		}
	}
	return nil
}

type Connection interface {
	io.ReadWriteCloser

	Send(cmd string, args ...Argument) error
}

type Context interface {
	Connection() io.ReadWriteCloser

	Send(cmd string, args ...Argument) error

	Logger() *slog.Logger
}

type Listener func(Context, *Packet) error

type Registry interface {
	RegisterCommand(cmd string, opcode int16)
	UnregisterCommand(cmd string)

	RegisterListener(msg int16, fn Listener)
	UnregisterListener(msg int16)
}
