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
	baseURL, err := url.Parse("http://localhost:22177/housekeeping")
	if err != nil {
		panic(err)
	}
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

	server := http.Server{
		Addr:    net.JoinHostPort(cfg.Housekeeping.Host, strconv.Itoa(cfg.Housekeeping.Port)),
		Handler: mux,
	}

	log.Println("housekeeping dev on http://" + server.Addr + "/housekeeping/")
	log.Fatalln(server.ListenAndServe())
}
