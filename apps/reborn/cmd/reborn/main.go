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
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/installer"
	"github.com/kronothepenguin/project-reborn/packages/reborn"
)

// site serves a program's embedded build.
func site(distFS fs.FS) reborn.Site {
	dist, err := fs.Sub(distFS, "dist")
	if err != nil {
		log.Fatalln(err)
	}
	return reborn.Site{
		Resolver: astro.MakeFSResolver(dist),
		Static:   http.FileServerFS(dist),
	}
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	r := reborn.New(
		reborn.WithCMS(site(cms.DistFS)),
		reborn.WithHousekeeping(site(housekeeping.DistFS)),
		reborn.WithInstaller(site(installer.DistFS)),
	)
	if err := r.Run(ctx); err != nil {
		log.Fatalln(err)
	}
}
