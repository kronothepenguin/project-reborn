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
	astroURL, err := url.Parse("http://localhost:25050/")
	if err != nil {
		panic(err)
	}
	baseURL := astroURL.JoinPath("installer")

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
	mux.Handle("GET /{$}", http.RedirectHandler("/installer/", http.StatusSeeOther))

	// Vite emits its own paths, such as /@vite/client, at the root of the dev
	// server whatever the base, and Mount leaves / alone.
	mux.Handle("/", httputil.NewSingleHostReverseProxy(astroURL))

	server := http.Server{
		Addr:    "localhost:17306",
		Handler: mux,
	}

	log.Println("installer dev on http://localhost:17306/installer/")
	log.Fatalln(server.ListenAndServe())
}
