package main

import (
	"context"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/installer"
	"github.com/kronothepenguin/project-reborn/packages/reborn"
	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// dist serves a program's embedded build: the resolver of its pages and its
// static files.
func dist(distFS fs.FS) (astro.Resolver, http.Handler) {
	d, err := fs.Sub(distFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}
	return astro.MakeFSResolver(d), http.FileServerFS(d)
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cmsPages, cmsFiles := dist(cms.DistFS)
	hkPages, hkFiles := dist(housekeeping.DistFS)
	inPages, inFiles := dist(installer.DistFS)

	cfg := config.Get()
	db := store.FromConfig()

	c := cms.New(db, cms.WithResolver(cmsPages), cms.WithStatic(cmsFiles))
	h := housekeeping.New(db, housekeeping.WithResolver(hkPages), housekeeping.WithStatic(hkFiles))
	i, err := installer.New(ctx, db, installer.WithResolver(inPages), installer.WithStatic(inFiles))
	if err != nil {
		log.Fatalln(err)
	}
	g := server.New(db)

	c.Inject(cms.Services{Habbos: g})
	h.Inject(housekeeping.Services{Habbos: g})

	r := reborn.New(cfg, db, c, h, i, g)
	i.Inject(installer.Services{Listener: r})
	if err := r.Run(ctx); err != nil {
		log.Fatalln(err)
	}
}
