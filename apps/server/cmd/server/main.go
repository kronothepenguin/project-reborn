package main

import (
	"log"

	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	db := store.FromConfig()

	c := server.New(db)
	if err := c.StartInfo(); err != nil {
		log.Fatalln(err)
	}
	if err := c.StartMus(); err != nil {
		log.Fatalln(err)
	}

	// Both listeners serve in the background.
	select {}
}
