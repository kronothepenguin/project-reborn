package main

import (
	"io/fs"
	"log"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
)

func main() {
	distFS, err := fs.Sub(cms.DistFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}

	resolver := astro.MakeFSResolver(distFS)
	fileServer := http.FileServerFS(distFS)

	c := cms.New(
		cms.WithResolver(resolver),
		cms.WithStatic(fileServer),
	)

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    "localhost:17387",
		Handler: mux,
	}

	log.Println("cms on http://localhost:17387")
	server.ListenAndServe()
}