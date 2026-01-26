package protocol

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
