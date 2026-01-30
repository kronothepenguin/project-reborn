package protocol

import (
	"log/slog"
)

type Context interface {
	Send(cmd string, args ...Argument) error

	Logger() *slog.Logger

	// TODO: virtual hotel
}
