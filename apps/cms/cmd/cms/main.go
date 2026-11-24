package main

import (
	"io/fs"
	"log"
	"net"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/server/api"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	distFS, err := fs.Sub(cms.DistFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}
	resolver := astro.MakeFSResolver(distFS)
	fileServer := http.FileServerFS(distFS)

	cfg := config.Get()
	db := store.FromConfig()

	c := cms.New(db,
		cms.WithResolver(resolver),
		cms.WithStatic(fileServer),
	)

	// The game runs apart: it hears of a saved look, answers who is in the hotel
	// and opens or closes its doors through its /api/. The client reads the
	// secret on each call.
	gameURL := "http://" + net.JoinHostPort(cfg.Server.API.Host, strconv.Itoa(cfg.Server.API.Port))
	game := api.New(gameURL, db)
	c.Inject(cms.Services{Habbos: game, Hotel: game, Economy: game})

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    net.JoinHostPort(cfg.CMS.Host, strconv.Itoa(cfg.CMS.Port)),
		Handler: mux,
	}

	log.Println("cms on http://" + server.Addr)
	log.Fatalln(server.ListenAndServe())
}
