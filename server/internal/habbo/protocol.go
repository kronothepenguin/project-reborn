package habbo

import (
	"bytes"
	"io"
)

type Message struct {
	buf bytes.Buffer
}

func NewMessage() *Message {
	return &Message{}
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
		// TODO: error
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

type Packet struct {
	Cmd     int16
	Message *Message
}

func NewPacket(cmd int16, msg *Message) *Packet {
	return &Packet{
		Cmd:     cmd,
		Message: msg,
	}
}

// TODO: better have own types like HabboReader
//
//	this allows keep an internal buffer for every connection
//	this way we can keep reading up until a full packet is found
func Read(r io.Reader) (*Packet, error) {
	buf := make([]byte, 1024)
	total := 0

again:
	n, err := r.Read(buf[total:])
	if err == io.EOF {
		return nil, err
	}

	total += n
	if total < 5 {
		goto again
	}

	data := buf[:total]

	// TODO: make sure these three bytes have 64 bit enabled for security
	l3 := data[0]
	l2 := data[1]
	l1 := data[3]
	length := int(l3&63)*4096 + int(l2&63)*64 + int(l1&63)

	// TODO: better keep reading until length is reached
	//       once length is reached, check if more data is buffered for the next packet
	if total < length+3 {
		goto again
	}

	b1 := data[4]
	b2 := data[5]
	cmd := int16(b1&63)*64 + int16(b2&63)

	msg := data[5 : length+3]
	message := NewMessage()
	message.buf.Write(msg)

	return NewPacket(cmd, message), nil
}

func Write(w io.Writer, p *Packet) error {
	var buf bytes.Buffer

	if err := buf.WriteByte(byte(p.Cmd/64) | 64); err != nil {
		return err
	}
	if err := buf.WriteByte(byte(p.Cmd&63) | 64); err != nil {
		return err
	}

	if _, err := buf.Write(p.Message.buf.Bytes()); err != nil {
		return err
	}

	if err := buf.WriteByte(1); err != nil {
		return err
	}

	_, err := w.Write(buf.Bytes())
	return err
}
