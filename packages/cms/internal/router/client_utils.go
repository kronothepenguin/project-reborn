package router

import (
	"io"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/settings"
)

// clientUtilsPage is one of clientutils.php's three pages, named by Key:
// connection_failed, error or LogInPlease, or the page closed, which stands in
// for error when the client lost its connection while the game is stopped.
type clientUtilsPage struct {
	Key       string
	Name      string
	ShortName string
	Host      string
	Port      int
}

// HandleClientUtilsView renders GET /client/utils, clientutils.php, by its key.
// A guest gets the "please sign in" page whatever the key. A habbo gets "true"
// for cacheCheck and cache, the page of connection_failed or error, and an
// empty answer for any other key, as Holo gave. The client's disconnect error,
// error=disconnect, shows the page closed while the game is stopped.
func (r *Router) HandleClientUtilsView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	key := "LogInPlease"
	_, signedIn := auth.FromContext(ctx)
	if signedIn {
		key = req.URL.Query().Get("key")
	}
	switch {
	case key == "cacheCheck" || key == "cache":
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		io.WriteString(w, "true")
		return
	case key == "connection_failed", key == "error", key == "LogInPlease" && !signedIn:
	default:
		return
	}

	if key == "error" && req.URL.Query().Get("error") == "disconnect" && !r.gameStatus(ctx).Running {
		key = "closed"
	}
	q := r.deps.Queries
	info := config.Get().Server.Info
	astro.WriteTemplate(w, r.deps.Resolver, "client/utils.html", clientUtilsPage{
		Key:       key,
		Name:      settings.String(ctx, q, "site.name"),
		ShortName: settings.String(ctx, q, "site.shortName"),
		Host:      info.Host,
		Port:      info.Port,
	})
}
