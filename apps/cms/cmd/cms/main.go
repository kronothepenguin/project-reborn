package main

import (
	"fmt"
	"io/fs"
	"log"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	distFS, err := fs.Sub(cms.DistFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}
	resolver := astro.MakeFSResolver(distFS)
	fileServer := http.FileServerFS(distFS)

	cfg := config.Get()
	db := store.FromConfig()

	c := cms.New(db,
		cms.WithResolver(resolver),
		cms.WithStatic(fileServer),
	)

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    fmt.Sprintf("localhost:%d", cfg.CMS.Port),
		Handler: mux,
	}

	log.Println("cms on http://" + server.Addr)
	log.Fatalln(server.ListenAndServe())
}
