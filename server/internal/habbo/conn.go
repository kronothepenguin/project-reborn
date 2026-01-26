package habbo

import (
	"io"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

type Connection struct {
	conn io.ReadWriteCloser

	// listeners map[int16]
}

func NewHabboConnection(conn io.ReadWriteCloser) *Connection {
	return &Connection{
		conn: conn,
	}
}

func (c *Connection) Connection() io.ReadWriteCloser {
	return c.conn
}

func (c *Connection) Read() (*protocol.Packet, error) {
	return protocol.ReadPacket(c.conn)
}

func (c *Connection) Write(p *protocol.Packet) error {
	return protocol.WritePacket(c.conn, p)
}
