package protocol

import (
	"io"
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/pkg/virtual"
)

type Session struct {
	conn     io.ReadWriteCloser
	commands CommandRegistry

	Logger *slog.Logger
	Crypto Crypto
	Hotel  *virtual.Hotel
	Habbo  *virtual.Habbo
}

func NewSession(conn io.ReadWriteCloser, commands CommandRegistry, hotel *virtual.Hotel, logger *slog.Logger) *Session {
	return &Session{
		conn:     conn,
		commands: commands,
		Logger:   logger,
		Hotel:    hotel,
	}
}

func (s *Session) SetCommands(commands CommandRegistry) {
	s.commands = commands
}

func (s *Session) Send(cmd string, args ...io.WriterTo) error {
	p, err := s.commands.Build(cmd, args...)
	if err != nil {
		return err
	}

	s.Logger.Info(">>", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))

	return WritePacket(s.conn, p)
}

func (s *Session) ReadPacket() (*Packet, error) {
	p, err := ReadPacket(s.conn, &s.Crypto)
	if err != nil {
		return nil, err
	}
	p.Session = s
	return p, nil
}

func (s *Session) Close() error {
	return s.conn.Close()
}
