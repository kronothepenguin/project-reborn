package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
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

// devServer is the Astro dev server of packages/reborn, which serves every
// site's pages. The base address ends in / so that JoinPath keeps the leading
// slash.
const devServer = "http://localhost:22448/"

// dev serves a site from the dev server under path: the resolver of its pages
// and a proxy of its static files.
func dev(path string) (astro.Resolver, http.Handler) {
	u, err := url.Parse(devServer)
	if err != nil {
		log.Fatalln(err)
	}
	u = u.JoinPath(path)
	return astro.MakeServerResolver(u), httputil.NewSingleHostReverseProxy(u)
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// The CMS's files are at the dev server's root, with Vite's own paths
	// such as /@vite/client.
	cmsPages, cmsFiles := dev("/")
	hkPages, hkFiles := dev("housekeeping")
	inPages, inFiles := dev("installer")

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
