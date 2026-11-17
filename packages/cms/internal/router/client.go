package router

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// clientParam is one of the sw1 to sw9 that Holo's client.php gave Adobe's
// plugin, and that the page now gives LibreShockwave's player.
type clientParam struct {
	Name  string
	Value string
}

// clientPage is client.php with templates/client: the top bar, the loader and
// the client, which LibreShockwave's player runs in place of Adobe's plugin.
type clientPage struct {
	Name        string
	ShortName   string
	OnlineCount int
	// WideBody is header.php's class="wide", which follows the setting alone.
	WideBody bool
	Width    int
	Height   int
	Loader   bool
	Movie    string
	Params   []clientParam
}

// HandleClientView renders GET /client, client.php. A guest goes to Holo's
// "please sign in" page. The address's wide=true makes the client wide, and any
// other wide makes it narrow; without one the wide-screen setting decides. A
// roomId with forwardId=2 opens the client in that room when it exists, with
// forward.type=2, a habbo's room, which the client needs and Holo never sent.
// The client's addresses start with the address the browser used.
func (r *Router) HandleClientView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	if _, ok := auth.FromContext(ctx); !ok {
		http.Redirect(w, req, "/client/utils?key=LogInPlease", http.StatusSeeOther)
		return
	}
	q := r.deps.Queries
	query := req.URL.Query()

	wideSetting := settings.Bool(ctx, q, "features.clientWideScreen")
	_, wideAsked := query["wide"]
	width := 720
	if (!wideAsked && wideSetting) || query.Get("wide") == "true" {
		width = 960
	}

	forward := ""
	if query.Has("roomId") && query.Get("forwardId") == "2" {
		if id, err := strconv.ParseInt(query.Get("roomId"), 10, 64); err == nil {
			_, err := q.GetRoom(ctx, id)
			switch {
			case err == nil:
				forward = strconv.FormatInt(id, 10)
			case !store.IsNotFound(err):
				r.fail(w, err)
				return
			}
		}
	}

	ticket, err := auth.SSOTicket(req, r.deps.DB)
	if err != nil {
		r.fail(w, err)
		return
	}

	cfg := config.Get().Server
	visitor := auth.ClientIP(req)
	host := cfg.Info.Host
	// client.php's $ip: a visitor on the game's own machine connects to it there.
	if visitor == "127.0.0.1" {
		host = "127.0.0.1"
	}
	path := hotelURL(req) + "/"

	params := []clientParam{
		{"sw6", "client.connection.failed.url=" + path + "client/utils?key=connection_failed;external.variables.txt=" + path + "dcr/external_variables.txt"},
		{"sw8", "use.sso.ticket=1;sso.ticket=" + ticket},
		{"sw2", fmt.Sprintf("connection.info.host=%s;connection.info.port=%d", host, cfg.Info.Port)},
		{"sw4", "site.url=" + path + ";url.prefix=" + path},
		{"sw3", fmt.Sprintf("connection.mus.host=%s;connection.mus.port=%d", cfg.MUS.Host, cfg.MUS.Port)},
		{"sw1", "client.allow.cross.domain=1;client.notify.cross.domain=0"},
		{"sw7", "external.texts.txt=" + path + "dcr/external_texts.txt;user_isp=" + visitor},
	}
	if forward != "" {
		params = append(params, clientParam{"sw9", "forward.id=" + forward + ";forward.type=2;processlog.enabled=1"})
	}
	params = append(params, clientParam{"sw5", "client.reload.url=" + path + "client?x=reauthenticate;client.fatal.error.url=" + path + "client/utils?key=error"})

	astro.WriteTemplate(w, r.deps.Resolver, "client.html", clientPage{
		Name:        settings.String(ctx, q, "site.name"),
		ShortName:   settings.String(ctx, q, "site.shortName"),
		OnlineCount: r.hotelStatus(ctx).OnlineCount,
		WideBody:    wideSetting,
		Width:       width,
		Height:      540,
		Loader:      settings.Bool(ctx, q, "features.clientLoader"),
		Movie:       path + "dcr/habbo.dcr",
		Params:      params,
	})
}
