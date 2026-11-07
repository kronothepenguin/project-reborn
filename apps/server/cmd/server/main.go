package main

import (
	"log"
	"net/http"

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

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    "localhost:15445",
		Handler: mux,
	}

	log.Println("server on http://" + server.Addr)
	log.Fatalln(server.ListenAndServe())
}
