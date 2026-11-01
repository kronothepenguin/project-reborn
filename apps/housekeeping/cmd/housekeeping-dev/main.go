package main

import (
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	astroURL, err := url.Parse("http://localhost:22177")
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
