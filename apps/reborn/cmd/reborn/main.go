package main

import (
	"context"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/kronothepenguin/project-reborn/apps/reborn/internal/web"
	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/reborn"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// The pages and files of reborn's dist, for every site.
	dist, err := fs.Sub(reborn.DistFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}
	pages, files := astro.MakeFSResolver(dist), http.FileServerFS(dist)

	cfg := config.Get()
	db := store.FromConfig()
	defer db.Close()
	server := web.New(cfg.Reborn.Host, cfg.Reborn.Port)
	r, err := reborn.New(db, server, reborn.WithResolver(pages), reborn.WithStatic(files))
	if err != nil {
		log.Fatalln(err)
	}
	web.Run(ctx, server, r)
}
