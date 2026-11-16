package server

import (
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/config/cms"
)

// Server holds the game server's listeners, each on a host and port of its own:
// the client's two WebSocket connections, info for the game and mus for the
// Multiuser Xtra's messages, and api, the HTTP listener of /api/ that the game
// opens when it runs apart from the site.
type Server struct {
	Info Connection `json:"info"`
	MUS  Connection `json:"mus"`
	API  Connection `json:"api"`
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

func DefaultAPI() Connection {
	return Connection{Host: "localhost", Port: 15445}
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

// Validate also refuses two listeners on the same port.
func (s Server) Validate() error {
	if err := s.Info.Validate(); err != nil {
		return fmt.Errorf("info.%w", err)
	}
	if err := s.MUS.Validate(); err != nil {
		return fmt.Errorf("mus.%w", err)
	}
	if err := s.API.Validate(); err != nil {
		return fmt.Errorf("api.%w", err)
	}
	if s.MUS.Port == s.Info.Port {
		return fmt.Errorf("mus.port: must differ from info.port, got %d", s.MUS.Port)
	}
	if s.API.Port == s.Info.Port || s.API.Port == s.MUS.Port {
		return fmt.Errorf("api.port: must differ from info.port and mus.port, got %d", s.API.Port)
	}
	return nil
}
