package main

import (
	"context"
	"log"

	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	db := store.FromConfig()

	c := server.New(db, server.WithAPI())
	if err := c.Start(context.Background()); err != nil {
		log.Fatalln(err)
	}

	// The listeners serve in the background, and the /api/ opens and closes the doors.
	select {}
}
