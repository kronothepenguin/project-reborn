package main

import (
	"context"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db := store.FromConfig()
	defer db.Close()

	c := server.New(db, server.WithAPI())
	if err := c.Start(ctx); err != nil {
		log.Fatalln(err)
	}

	// The listeners serve in the background, and the /api/ opens and closes
	// the doors, until Ctrl-C or SIGTERM: then every player is logged out.
	<-ctx.Done()
	if err := c.Stop(context.Background()); err != nil {
		slog.Error(err.Error())
	}
}
