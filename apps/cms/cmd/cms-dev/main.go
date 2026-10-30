package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
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

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    fmt.Sprintf("localhost:%d", cfg.CMS.Port),
		Handler: mux,
	}

	log.Println("cms dev on http://" + server.Addr)
	log.Fatalln(server.ListenAndServe())
}
