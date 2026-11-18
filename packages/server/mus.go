package server

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/transport"
)

// serveMus serves a client of the mus connection until the server frames MUS: it logs the connect, the size of each
// message and the close, and never answers. The transport hides the WebSocket's frames, so each size is what one read
// brings: never more than one message, and a large message may come in several reads. When closing ends, the hotel
// closes, and so does the connection.
func serveMus(closing context.Context, c transport.Conn) {
	addr := c.RemoteAddr()
	slog.Info("mus " + addr + " connected")
	stop := context.AfterFunc(closing, func() { c.Close() })
	defer stop()
	buf := make([]byte, 64<<10)
	for {
		n, err := c.Read(buf)
		if n > 0 {
			slog.Info(fmt.Sprintf("mus %s received %s", addr, size(n)))
		}
		if errors.Is(err, io.EOF) || closing.Err() != nil {
			slog.Info("mus " + addr + " closed")
			return
		}
		if err != nil {
			slog.Warn(fmt.Sprintf("mus %s closed: %v", addr, err))
			return
		}
	}
}

func size(n int) string {
	if n == 1 {
		return "1 byte"
	}
	return strconv.Itoa(n) + " bytes"
}
