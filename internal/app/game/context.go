package game

import (
	"io"
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/app/game/protocol"
	"github.com/kronothepenguin/project-reborn/internal/pkg/virtual"
)

type HabboContext struct {
	conn io.ReadWriteCloser

	registry protocol.Registry

	logger *slog.Logger

	crypto protocol.Crypto

	hotel *virtual.Hotel
	habbo *virtual.Habbo
}

func NewHabboContext(conn io.ReadWriteCloser, registry protocol.Registry, hotel *virtual.Hotel) *HabboContext {
	// TODO: multi handler [stdout, file]
	logger := slog.New(slog.Default().Handler())
	return &HabboContext{
		conn:     conn,
		registry: registry,
		logger:   logger,
		hotel:    hotel,
	}
}

func (ctx *HabboContext) Send(cmd string, args ...io.WriterTo) error {
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

func (ctx *HabboContext) Habbo() *virtual.Habbo {
	return ctx.habbo
}

func (ctx *HabboContext) SetHabbo(habbo *virtual.Habbo) {
	ctx.habbo = habbo
}
