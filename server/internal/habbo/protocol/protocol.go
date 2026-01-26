package protocol

import "io"

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

type Context interface {
	Connection() io.ReadWriteCloser

	Send(cmd string, args ...Argument) error
}

type Listener func(Context, *Packet) error

type Registry interface {
	RegisterListener(msg int16, fn Listener)
	UnregisterListener(msg int16)

	RegisterCommand(cmd string, opcode int16)
	UnregisterCommand(cmd string)
}
