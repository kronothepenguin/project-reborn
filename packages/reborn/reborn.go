// Package reborn runs the whole hotel in one process: the site and
// housekeeping on one mux, and the game server's two listeners, on one
// database handle.
package reborn

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/installer"
	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// ErrNotInstalled is returned by Run when nobody holds
// housekeeping.accessGroups in the database.
var ErrNotInstalled = errors.New("reborn: the hotel is not installed: run the installer first")

// Reborn holds the programs its runner builds, on the database the runner
// opened.
type Reborn struct {
	cfg          *config.Config
	db           *sql.DB
	cms          *cms.CMS
	housekeeping *housekeeping.Housekeeping
	installer    *installer.Installer
	game         *server.Server
}

func New(cfg *config.Config, db *sql.DB, c *cms.CMS, h *housekeeping.Housekeeping, i *installer.Installer, g *server.Server) *Reborn {
	return &Reborn{cfg: cfg, db: db, cms: c, housekeeping: h, installer: i, game: g}
}

// Run serves the installed hotel until ctx ends: the CMS at / and housekeeping
// at /housekeeping/ on the address of the reborn section, and the game on
// server.info and server.mus. The installer stays unmounted until reborn
// installs a new hotel.
func (r *Reborn) Run(ctx context.Context) error {
	holders, err := store.New(r.db).ListAttributeHolders(ctx, string(auth.HousekeepingAccessGroups))
	if err != nil {
		return fmt.Errorf("reborn: %w", err)
	}
	if len(holders) == 0 {
		return fmt.Errorf("%w: nobody holds %s", ErrNotInstalled, auth.HousekeepingAccessGroups)
	}

	mux := http.NewServeMux()
	r.cms.Mount(mux)
	r.housekeeping.Mount(mux)

	if err := r.game.StartInfo(); err != nil {
		return err
	}
	if err := r.game.StartMus(); err != nil {
		return err
	}

	addr := net.JoinHostPort(r.cfg.Reborn.Host, strconv.Itoa(r.cfg.Reborn.Port))
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
