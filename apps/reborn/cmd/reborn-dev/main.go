package main

import (
	"context"
	"log"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"syscall"

	"github.com/kronothepenguin/project-reborn/apps/reborn/internal/web"
	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/reborn"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// devServer is the Astro dev server of packages/reborn, which serves every
// site's pages and files, with Vite's own paths such as /@vite/client.
const devServer = "http://localhost:22448/"

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// The pages and a proxy of the files of the dev server, for every site.
	u, err := url.Parse(devServer)
	if err != nil {
		log.Fatalln(err)
	}
	pages, files := astro.MakeServerResolver(u), httputil.NewSingleHostReverseProxy(u)

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
