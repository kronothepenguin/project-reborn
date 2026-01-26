package habbo

import (
	"bytes"
	"io"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

type HabboConnection struct {
	conn io.ReadWriteCloser
	buf  bytes.Buffer
}

func NewHabboConnection(conn io.ReadWriteCloser) *HabboConnection {
	return &HabboConnection{
		conn: conn,
	}
}

func (c *HabboConnection) Read() (*protocol.Packet, error) {
	return protocol.ReadPacket(c.conn)
}

func (c *HabboConnection) Write(p *protocol.Packet) error {
	return protocol.WritePacket(c.conn, p)
}
