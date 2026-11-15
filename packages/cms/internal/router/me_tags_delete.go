package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleMeTagsDelete handles POST /me/tags/{tag}/delete.
func (r *Router) HandleMeTagsDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	profile, err := r.deps.Queries.GetAvatarProfile(ctx, session.AvatarID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if _, err := r.deps.Queries.DeleteProfileTag(ctx, store.DeleteProfileTagParams{ProfileID: profile.ID, Tag: req.PathValue("tag")}); err != nil {
		r.fail(w, err)
		return
	}
	r.answerTags(w, req, profile.ID, "")
}
