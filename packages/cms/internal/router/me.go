package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type mePage struct {
	hotelStatus
	Name       string
	Figure     string
	ImagingURL string
}

// HandleMeView renders GET /me, which auth.RequireSession guards.
func (r *Router) HandleMeView(w http.ResponseWriter, req *http.Request) {
	session, _ := auth.FromContext(req.Context())
	avatar, err := r.deps.Queries.GetAvatar(req.Context(), session.AvatarID)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "me.html", mePage{
		Name:       avatar.Name,
		Figure:     avatar.Figure,
		ImagingURL: settings.GetString("imaging.avatarUrl"),
	})
}
