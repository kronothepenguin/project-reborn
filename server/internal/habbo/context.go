package habbo

import (
	"io"
	"log"
	"os"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol/registry"
)

type HabboContext struct {
	conn io.ReadWriteCloser

	registry *registry.Registry

	logger *log.Logger
}

func NewHabboContext(conn io.ReadWriteCloser, registry *registry.Registry) *HabboContext {
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lmsgprefix)
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

func (ctx *HabboContext) Logger() *log.Logger {
	return ctx.logger
}
