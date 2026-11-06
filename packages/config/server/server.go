package server

import (
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/config/cms"
)

// Server holds the client's two connections, each a WebSocket listener of the
// game server on a host and port of its own: info for the game, mus for the
// Multiuser Xtra's messages.
type Server struct {
	Info Connection `json:"info"`
	MUS  Connection `json:"mus"`
}

type Connection struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

func DefaultInfo() Connection {
	return Connection{Host: "localhost", Port: 30000}
}

func DefaultMUS() Connection {
	return Connection{Host: "localhost", Port: 30001}
}

// ValidateHost holds a connection's host to the rule of cms.host.
func ValidateHost(value string) error {
	return cms.ValidateHost(value)
}

func ValidatePort(value int) error {
	if value < 1 || value > 65535 {
		return fmt.Errorf("must be between 1 and 65535, got %d", value)
	}
	return nil
}

func (c Connection) Validate() error {
	if err := ValidateHost(c.Host); err != nil {
		return fmt.Errorf("host: %w", err)
	}
	if err := ValidatePort(c.Port); err != nil {
		return fmt.Errorf("port: %w", err)
	}
	return nil
}

// Validate also refuses info and mus on the same port.
func (s Server) Validate() error {
	if err := s.Info.Validate(); err != nil {
		return fmt.Errorf("info.%w", err)
	}
	if err := s.MUS.Validate(); err != nil {
		return fmt.Errorf("mus.%w", err)
	}
	if s.MUS.Port == s.Info.Port {
		return fmt.Errorf("mus.port: must differ from info.port, got %d", s.MUS.Port)
	}
	return nil
}
