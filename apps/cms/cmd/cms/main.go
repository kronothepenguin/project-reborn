package main

import (
	"html/template"
	"io/fs"
	"log"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/cms"
)

func main() {
	distFS, err := fs.Sub(cms.DistFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}

	resolver := func(name string) (*template.Template, error) {
		b, err := fs.ReadFile(distFS, name)
		if err != nil {
			return nil, err
		}

		return template.New(name).Delims("[[", "]]").Parse(string(b))
	}
	fileServer := http.FileServerFS(distFS)

	c := cms.New(
		cms.WithResolver(resolver),
		cms.WithStatic(fileServer),
	)

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    "localhost:8080",
		Handler: mux,
	}

	server.ListenAndServe()
}
