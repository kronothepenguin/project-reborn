package main

import (
	"context"
	"io/fs"
	"log"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer"
)

func main() {
	distFS, err := fs.Sub(installer.DistFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}

	resolver := astro.MakeFSResolver(distFS)
	fileServer := http.FileServerFS(distFS)

	i, err := installer.New(context.Background(),
		installer.WithResolver(resolver),
		installer.WithStatic(fileServer),
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

	log.Println("installer on http://localhost:17306")
	log.Fatalln(server.ListenAndServe())
}
