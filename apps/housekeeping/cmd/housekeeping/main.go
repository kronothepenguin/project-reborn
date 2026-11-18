package main

import (
	"io/fs"
	"log"
	"net"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/server/api"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	distFS, err := fs.Sub(housekeeping.DistFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}
	resolver := astro.MakeFSResolver(distFS)
	fileServer := http.FileServerFS(distFS)

	cfg := config.Get()
	db := store.FromConfig()

	h := housekeeping.New(db,
		housekeeping.WithResolver(resolver),
		housekeeping.WithStatic(fileServer),
	)

	// The game runs apart: it hears of a saved look, answers who is in the hotel
	// and opens or closes its doors through its /api/. The client reads the
	// secret on each call.
	gameURL := "http://" + net.JoinHostPort(cfg.Server.API.Host, strconv.Itoa(cfg.Server.API.Port))
	game := api.New(gameURL, db)
	h.Inject(housekeeping.Services{Habbos: game, Hotel: game})

	mux := http.NewServeMux()
	h.Mount(mux)

	server := http.Server{
		Addr:    net.JoinHostPort(cfg.Housekeeping.Host, strconv.Itoa(cfg.Housekeeping.Port)),
		Handler: mux,
	}

	log.Println("housekeeping on http://" + server.Addr + "/housekeeping/")
	log.Fatalln(server.ListenAndServe())
}
