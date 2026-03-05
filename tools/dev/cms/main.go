package main

import (
	"html/template"
	"log"
	"net/http"
	"os"

	"github.com/kronothepenguin/project-reborn/internal/app/cms"
	"github.com/kronothepenguin/project-reborn/internal/pkg/httpx"
	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func main() {
	log.Println("CMS dev server starting...")

	tmplpath := "./internal/app/cms/templates"
	fsys := os.DirFS(tmplpath)
	mux := http.NewServeMux()

	c := cms.New(func() (*template.Template, error) {
		return tmpl.ParseAllFS(fsys)
	})
	c.Mount(mux)

	with := httpx.WithLiveReload(httpx.WithWatchAll(tmplpath))

	server := http.Server{
		Addr:    "localhost:31337",
		Handler: with(mux),
	}

	log.Println("Watching:", tmplpath)
	log.Printf("Starting HTTP server at http://%s\n", server.Addr)
	httpx.ListenAndServeWithGracefulShutdown(&server)
}
