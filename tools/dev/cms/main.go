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
	tmplfs := os.DirFS(tmplpath)
	c := cms.New(func() (*template.Template, error) {
		return tmpl.ParseAllFS(tmplfs)
	})

	staticpath := "./web/static"
	staticfs := os.DirFS(staticpath)
	s := http.StripPrefix("/static/", httpx.NoCache(http.FileServerFS(staticfs)))

	mux := http.NewServeMux()
	c.Mount(mux)
	loadData(c)
	mux.Handle("/", httpx.RootHandler(httpx.WithStatic(s)))

	with := httpx.LiveReload(httpx.WithWatchAll(tmplpath), httpx.WithWatchAll(staticpath))

	server := http.Server{
		Addr:    "localhost:31337",
		Handler: with(mux),
	}

	log.Println("Watching:", tmplpath)
	log.Printf("Starting HTTP server at http://%s\n", server.Addr)
	if err := httpx.ListenAndServeWithGracefulShutdown(&server); err != nil {
		log.Fatalln(err)
	}
}

func loadData(c *cms.CMS) {
	c.Set("SiteName", "Reborn")
	c.Set("AvatarName", "Avatar")
	c.Set("OnlineCount", 0)
	c.Set("ServerStatus", "online")
}
