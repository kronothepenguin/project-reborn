package protocol

import (
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/virtual"
)

type Context interface {
	Send(cmd string, args ...Argument) error

	Logger() *slog.Logger

	Crypto() *Crypto

	Hotel() *virtual.Hotel

	Habbo() *virtual.Habbo
	SetHabbo(*virtual.Habbo)
}
