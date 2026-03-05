package main

import (
	"html/template"
	"log"
	"net/http"
	"os"

	"github.com/kronothepenguin/project-reborn/internal/app/cms"
	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func main() {
	tmplpath := "./internal/app/cms/templates"
	go watch(tmplpath)

	log.Println("CMS dev server starting...")
	log.Println("Watching:", tmplpath)

	fsys := os.DirFS(tmplpath)
	c := cms.New(func() (*template.Template, error) {
		return tmpl.ParseAllFS(fsys)
	})

	mux := http.NewServeMux()
	c.Mount(mux)

	server := http.Server{
		Addr:    "localhost:31337",
		Handler: mux,
	}
	start(&server)
}
