package main

import (
	"database/sql"
	"embed"
	"html/template"
	"log"
	"net/http"
	"os"

	"github.com/kronothepenguin/project-reborn/internal/app/cms"
	"github.com/kronothepenguin/project-reborn/internal/pkg/httpx"
	"github.com/kronothepenguin/project-reborn/internal/pkg/storage"
	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
	_ "github.com/mattn/go-sqlite3"
)

//go:embed *.sql
var seedFS embed.FS

func main() {
	log.Println("Starting database connection...")
	db, err := sql.Open("sqlite3", ":memory:?_foreign_keys=on&_journal_mode=WAL&mode=memory")
	if err != nil {
		log.Fatalln(err)
	}
	defer db.Close()

	if err := storage.ExecSchema(db); err != nil {
		log.Fatalln(err)
	}
	if err := storage.ExecFS(db, seedFS); err != nil {
		log.Fatalln(err)
	}
	// TODO: exec seed.sql

	tmplpath := "./internal/app/cms/templates"
	tmplfs := os.DirFS(tmplpath)
	c := cms.New(func() (*template.Template, error) {
		return tmpl.ParseAllFS(tmplfs)
	}, db)

	staticpath := "./web/static"
	staticfs := os.DirFS(staticpath)
	s := http.StripPrefix("/static/", httpx.NoCache(http.FileServerFS(staticfs)))

	mux := httpx.NewServeMux()
	c.Mount(mux)
	loadData(c)

	mux.Handle("/", httpx.RootHandler(httpx.WithStatic(s)))

	with := httpx.LiveReload(httpx.WithWatchAll(tmplpath), httpx.WithWatchAll(staticpath))
	log.Println("Watching:", tmplpath, staticpath)

	server := http.Server{
		Addr:    "localhost:31337",
		Handler: with(mux),
	}

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
