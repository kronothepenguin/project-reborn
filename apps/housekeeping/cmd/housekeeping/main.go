package main

import (
	"context"
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

	// The game runs apart and hears of a saved look through its /api/. Without
	// the secret the housekeeping runs without telling the game.
	secret, err := store.New(db).GetAPISecret(context.Background())
	if err != nil {
		log.Println("housekeeping: the game's api is off:", err)
	} else {
		gameURL := "http://" + net.JoinHostPort(cfg.Server.API.Host, strconv.Itoa(cfg.Server.API.Port))
		h.Inject(housekeeping.Services{Habbos: api.New(gameURL, secret)})
	}

	mux := http.NewServeMux()
	h.Mount(mux)

	server := http.Server{
		Addr:    net.JoinHostPort(cfg.Housekeeping.Host, strconv.Itoa(cfg.Housekeeping.Port)),
		Handler: mux,
	}

	log.Println("housekeeping on http://" + server.Addr + "/housekeeping/")
	log.Fatalln(server.ListenAndServe())
}
