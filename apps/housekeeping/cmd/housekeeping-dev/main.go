package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/server/api"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	astroURL, err := url.Parse("http://localhost:22177/")
	if err != nil {
		panic(err)
	}
	baseURL := astroURL.JoinPath("housekeeping")
	resolver := astro.MakeServerResolver(baseURL)
	proxy := httputil.NewSingleHostReverseProxy(baseURL)

	cfg := config.Get()
	db := store.FromConfig()

	h := housekeeping.New(db,
		housekeeping.WithResolver(resolver),
		housekeeping.WithStatic(proxy),
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

	// Vite emits its own paths, such as /@vite/client, at the root of the dev
	// server whatever the base, and Mount leaves / alone.
	mux.Handle("/", httputil.NewSingleHostReverseProxy(astroURL))

	server := http.Server{
		Addr:    net.JoinHostPort(cfg.Housekeeping.Host, strconv.Itoa(cfg.Housekeeping.Port)),
		Handler: mux,
	}

	log.Println("housekeeping dev on http://" + server.Addr + "/housekeeping/")
	log.Fatalln(server.ListenAndServe())
}
