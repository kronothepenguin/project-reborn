package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
)

func main() {
	baseURL, err := url.Parse("http://localhost:22827")
	if err != nil {
		panic(err)
	}

	resolver := astro.MakeServerResolver(baseURL)
	proxy := httputil.NewSingleHostReverseProxy(baseURL)

	c := cms.New(
		cms.WithResolver(resolver),
		cms.WithStatic(proxy),
	)

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    "localhost:17387",
		Handler: mux,
	}

	log.Println("cms dev on http://localhost:17387")
	server.ListenAndServe()
}