package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type mePage struct {
	community
	Figure     string
	ImagingURL string
}

// HandleMeView renders GET /me, which auth.RequireSession guards.
func (r *Router) HandleMeView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	layout, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "me.html", mePage{
		community:  layout,
		Figure:     avatar.Figure,
		ImagingURL: settings.GetString("imaging.avatarUrl"),
	})
}
