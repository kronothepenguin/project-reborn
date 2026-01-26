package habbo

import (
	"net"

	"github.com/kronothepenguin/project-reborn/internal/habbo/transport"
)

type Server struct {
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) StartTCP() {
	tcp := transport.NewTCPServer(":1234")
	tcp.Start()
	go tcp.Loop(s.handleTCP)
}

func (s *Server) handleTCP(conn net.Conn) {
	defer conn.Close()

	c := NewHabboConnection(conn)
	for {
		p, err := c.Read()
		if err != nil {
			break
		}

		// TODO: table
		switch p.Cmd {
		}
	}
}
