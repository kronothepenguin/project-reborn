package habbo

import (
	"io"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol/registry"
)

type HabboContext struct {
	conn io.ReadWriteCloser

	registry *registry.Registry
}

func NewHabboContext(conn io.ReadWriteCloser, registry *registry.Registry) *HabboContext {
	return &HabboContext{
		conn:     conn,
		registry: registry,
	}
}

func (ctx *HabboContext) Connection() io.ReadWriteCloser {
	return ctx.conn
}

func (ctx *HabboContext) Send(cmd string, args ...protocol.Argument) error {
	return ctx.registry.Commands.Dispatch(ctx.conn, cmd, args...)
}
