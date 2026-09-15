package main

import (
	"context"
	"io/fs"
	"log"
	"log/slog"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/apps/cms/internal/config"
	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	distFS, err := fs.Sub(cms.DistFS, "dist")
	if err != nil {
		return err
	}

	db, err := store.Open(cfg.DBPath)
	if err != nil {
		return err
	}
	defer db.Close()

	app := cms.New(
		cms.WithResolver(astro.MakeFSResolver(distFS)),
		cms.WithStatic(http.FileServerFS(distFS)),
		cms.WithStore(db),
		cms.WithBaseURL(cfg.BaseURL),
		cms.WithLinks(cms.Links{Help: cfg.HelpURL, Terms: cfg.TermsURL, Privacy: cfg.PrivacyURL}),
		cms.WithLoginPolicy(cfg.FailureMax, cfg.FailureWindow, cfg.LockDuration),
	)

	mux := http.NewServeMux()
	app.Mount(mux)

	ctx, stop := context.WithCancel(context.Background())
	defer stop()
	go purgeSessions(ctx, app, cfg.PurgeInterval)

	server := &http.Server{
		Addr:    cfg.Addr,
		Handler: mux,
	}
	slog.Info("cms: listening", "addr", cfg.Addr, "db", cfg.DBPath)
	return server.ListenAndServe()
}

// purgeSessions runs CMS.Purge on the configured interval until ctx ends.
func purgeSessions(ctx context.Context, app *cms.CMS, interval time.Duration) {
	ticks := time.Tick(interval)
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticks:
			removed, err := app.Purge(ctx)
			if err != nil {
				slog.Warn("cms: session purge failed", "error", err)
				continue
			}
			if removed > 0 {
				slog.Info("cms: purged sessions", "removed", removed)
			}
		}
	}
}
