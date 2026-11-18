package main

import (
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/server/api"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	baseURL, err := url.Parse("http://localhost:22827")
	if err != nil {
		panic(err)
	}
	resolver := astro.MakeServerResolver(baseURL)
	proxy := httputil.NewSingleHostReverseProxy(baseURL)

	cfg := config.Get()
	db := store.FromConfig()

	c := cms.New(db,
		cms.WithResolver(resolver),
		cms.WithStatic(proxy),
	)

	// The game runs apart: it hears of a saved look, answers who is in the hotel
	// and opens or closes its doors through its /api/. The client reads the
	// secret on each call.
	gameURL := "http://" + net.JoinHostPort(cfg.Server.API.Host, strconv.Itoa(cfg.Server.API.Port))
	game := api.New(gameURL, db)
	c.Inject(cms.Services{Habbos: game, Hotel: game})

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    net.JoinHostPort(cfg.CMS.Host, strconv.Itoa(cfg.CMS.Port)),
		Handler: mux,
	}

	log.Println("cms dev on http://" + server.Addr)
	log.Fatalln(server.ListenAndServe())
}
