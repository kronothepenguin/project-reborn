package habbo

import (
	"io"
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
	"github.com/kronothepenguin/project-reborn/internal/habbo/virtual"
)

type HabboContext struct {
	conn io.ReadWriteCloser

	registry protocol.Registry

	logger *slog.Logger

	crypto protocol.Crypto

	hotel *virtual.Hotel
}

func NewHabboContext(conn io.ReadWriteCloser, registry protocol.Registry) *HabboContext {
	// TODO: multi handler [stdout, file]
	logger := slog.New(slog.Default().Handler())
	return &HabboContext{
		conn:     conn,
		registry: registry,
		logger:   logger,
		hotel:    virtual.NewHotel(),
	}
}

func (ctx *HabboContext) Send(cmd string, args ...protocol.Argument) error {
	p, err := ctx.registry.Commands().Build(cmd, args...)
	if err != nil {
		return err
	}

	ctx.logger.Info(">>", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))

	return protocol.WritePacket(ctx.conn, p)
}

func (ctx *HabboContext) Logger() *slog.Logger {
	return ctx.logger
}

func (ctx *HabboContext) Crypto() *protocol.Crypto {
	return &ctx.crypto
}

func (ctx *HabboContext) Hotel() *virtual.Hotel {
	return ctx.hotel
}
