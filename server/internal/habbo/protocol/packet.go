package protocol

type Packet struct {
	Command int16
	Message *Message
	Context Context
}

func NewPacket(cmd int16, msg *Message) *Packet {
	return &Packet{
		Command: cmd,
		Message: msg,
	}
}
