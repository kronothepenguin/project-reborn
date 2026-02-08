package protocol

import (
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/virtual"
)

type LoggerProvider interface {
	Logger() *slog.Logger
}

type HotelProvider interface {
	Hotel() *virtual.Hotel
}

type HabboContainer interface {
	Habbo() *virtual.Habbo
	SetHabbo(*virtual.Habbo)
}

type Context interface {
	virtual.Connection

	LoggerProvider
	HotelProvider

	HabboContainer
}
