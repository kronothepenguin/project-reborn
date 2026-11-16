// Package reborn runs the whole hotel in one process: the site and
// housekeeping on one mux, and the game server's two listeners, on one
// database handle.
package reborn

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"net"
	"net/http"
	"os"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// ErrNotInstalled is returned by Run in a folder with no config.json, or whose
// database has nobody holding housekeeping.accessGroups.
var ErrNotInstalled = errors.New("reborn: the hotel is not installed: run the installer first")

// Site is how one program's pages are served: its resolver and its static
// files, which differ between production and development.
type Site struct {
	Resolver astro.Resolver
	Static   http.Handler
}

type Reborn struct {
	cms          Site
	housekeeping Site
	installer    Site
}

type Option func(*Reborn)

func WithCMS(s Site) Option {
	return func(r *Reborn) { r.cms = s }
}

func WithHousekeeping(s Site) Option {
	return func(r *Reborn) { r.housekeeping = s }
}

// WithInstaller holds the installer's site, which Run serves on a hotel that
// is not installed yet.
func WithInstaller(s Site) Option {
	return func(r *Reborn) { r.installer = s }
}

func New(opts ...Option) *Reborn {
	r := &Reborn{}
	for _, opt := range opts {
		opt(r)
	}
	return r
}

// Run serves the installed hotel of the working directory until ctx ends: the
// CMS at / and housekeeping at /housekeeping/ on the address of the reborn
// section, and the game on server.info and server.mus. The CMS is built first,
// so that its automatic updates run before the game reads the database.
func (r *Reborn) Run(ctx context.Context) error {
	if _, err := os.Stat(config.Filename); errors.Is(err, fs.ErrNotExist) {
		return fmt.Errorf("%w: no %s", ErrNotInstalled, config.Filename)
	} else if err != nil {
		return fmt.Errorf("reborn: %w", err)
	}
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	db, err := store.Open(cfg.Store.Path)
	if err != nil {
		return err
	}
	defer db.Close()
	holders, err := store.New(db).ListAttributeHolders(ctx, string(auth.HousekeepingAccessGroups))
	if err != nil {
		return fmt.Errorf("reborn: %w", err)
	}
	if len(holders) == 0 {
		return fmt.Errorf("%w: nobody holds %s", ErrNotInstalled, auth.HousekeepingAccessGroups)
	}

	c := cms.New(db, cms.WithResolver(r.cms.Resolver), cms.WithStatic(r.cms.Static))
	h := housekeeping.New(db, housekeeping.WithResolver(r.housekeeping.Resolver), housekeeping.WithStatic(r.housekeeping.Static))
	game := server.New(db)

	mux := http.NewServeMux()
	c.Mount(mux)
	h.Mount(mux)

	if err := game.StartInfo(); err != nil {
		return err
	}
	if err := game.StartMus(); err != nil {
		return err
	}

	addr := net.JoinHostPort(cfg.Reborn.Host, strconv.Itoa(cfg.Reborn.Port))
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("reborn: %w", err)
	}
	srv := &http.Server{Handler: mux}
	served := make(chan error, 1)
	go func() { served <- srv.Serve(l) }()
	slog.Info("reborn on http://" + addr)

	select {
	case err := <-served:
		return fmt.Errorf("reborn: %w", err)
	case <-ctx.Done():
		return srv.Shutdown(context.WithoutCancel(ctx))
	}
}
