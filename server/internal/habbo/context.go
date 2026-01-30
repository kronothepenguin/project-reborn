package habbo

import (
	"io"
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

type HabboContext struct {
	conn io.ReadWriteCloser

	registry protocol.Registry

	logger *slog.Logger
}

func NewHabboContext(conn io.ReadWriteCloser, registry protocol.Registry) *HabboContext {
	// TODO: multi handler [stdout, file]
	logger := slog.New(slog.Default().Handler())
	return &HabboContext{
		conn:     conn,
		registry: registry,
		logger:   logger,
	}
}

func (ctx *HabboContext) Send(cmd string, args ...protocol.Argument) error {
	p, err := ctx.registry.Commands().Build(cmd, args...)
	if err != nil {
		return err
	}

	return protocol.WritePacket(ctx.conn, p)
}

func (ctx *HabboContext) Logger() *slog.Logger {
	return ctx.logger
}
