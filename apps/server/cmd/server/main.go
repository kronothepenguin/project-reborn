package main

import (
	"log"

	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	db := store.FromConfig()

	c := server.New(db, server.WithAPI())
	if err := c.StartInfo(); err != nil {
		log.Fatalln(err)
	}
	if err := c.StartMus(); err != nil {
		log.Fatalln(err)
	}

	// The listeners serve in the background.
	select {}
}
