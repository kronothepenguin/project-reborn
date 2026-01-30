package habbo

import (
	"io"
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol/registry"
)

type HabboContext struct {
	conn io.ReadWriteCloser

	registry *registry.Registry

	logger *slog.Logger
}

func NewHabboContext(conn io.ReadWriteCloser, registry *registry.Registry) *HabboContext {
	logger := slog.New(slog.Default().Handler())
	return &HabboContext{
		conn:     conn,
		registry: registry,
		logger:   logger,
	}
}

func (ctx *HabboContext) Connection() io.ReadWriteCloser {
	return ctx.conn
}

func (ctx *HabboContext) Send(cmd string, args ...protocol.Argument) error {
	return ctx.registry.Commands.Dispatch(ctx.conn, cmd, args...)
}

func (ctx *HabboContext) Logger() *slog.Logger {
	return ctx.logger
}
