package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

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
	run(ctx, server, r)
}

// run serves the installer until the administrator exists, then the site and
// housekeeping with the game, until ctx ends: the open requests finish, the
// game logs every player out, and the database closes.
func run(ctx context.Context, server *web.Server, r *reborn.Reborn) {
	if !r.Installed() {
		mux := http.NewServeMux()
		r.MountInstaller(mux)
		if err := server.Serve(mux); err != nil {
			log.Fatalln(err)
		}
		slog.Info("reborn installs a new hotel under /installer/")
		if err := r.WaitForInstall(ctx); err != nil {
			shutdown(server)
			return // Ctrl-C before the installation ended
		}
	}

	mux := http.NewServeMux()
	r.Mount(mux)
	if err := server.Serve(mux); err != nil {
		log.Fatalln(err)
	}
	if err := r.Start(ctx); err != nil {
		log.Fatalln(err)
	}
	<-ctx.Done()
	shutdown(server)
	if err := r.Stop(context.Background()); err != nil {
		slog.Error(err.Error())
	}
}

// shutdown lets the open requests finish, for up to ten seconds.
func shutdown(server *web.Server) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		slog.Error("reborn: " + err.Error())
	}
}
