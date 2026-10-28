package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer"
)

func main() {
	baseURL, err := url.Parse("http://localhost:25050")
	if err != nil {
		panic(err)
	}

	resolver := astro.MakeServerResolver(baseURL)
	proxy := httputil.NewSingleHostReverseProxy(baseURL)

	i, err := installer.New(context.Background(),
		installer.WithResolver(resolver),
		installer.WithStatic(proxy),
	)
	if err != nil {
		log.Fatalln(err)
	}

	mux := http.NewServeMux()
	i.Mount(mux)

	server := http.Server{
		Addr:    "localhost:17306",
		Handler: http.NewCrossOriginProtection().Handler(mux),
	}

	log.Println("installer dev on http://localhost:17306")
	log.Fatalln(server.ListenAndServe())
}
