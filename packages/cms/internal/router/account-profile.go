package router

import (
	"context"
	"net/http"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// maxProfileMottoLength is the limit of Holo's profile form, which is shorter
// than that of its inline editor, maxMottoLength.
const maxProfileMottoLength = 32

type profilePage struct {
	accountPage
	Motto string
}

func (r *Router) newProfilePage(ctx context.Context) (profilePage, error) {
	session, _ := auth.FromContext(ctx)
	account, err := r.newAccountPage(ctx)
	if err != nil {
		return profilePage{}, err
	}
	avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		return profilePage{}, err
	}
	return profilePage{accountPage: account, Motto: avatar.Motto}, nil
}

// HandleAccountProfileView renders GET /account/profile.
func (r *Router) HandleAccountProfileView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newProfilePage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/profile.html", false, page)
}

// HandleAccountProfile handles the POST /account/profile action.
func (r *Router) HandleAccountProfile(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	motto := req.PostFormValue("motto")
	failed := utf8.RuneCountInString(motto) > maxProfileMottoLength
	if !failed {
		err := r.deps.Queries.UpdateAvatarMotto(ctx, store.UpdateAvatarMottoParams{ID: session.AvatarID, Motto: motto, UpdatedAt: time.Now().UTC()})
		if err != nil {
			r.fail(w, err)
			return
		}
	}

	page, err := r.newProfilePage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Motto, page.Failed, page.Result = motto, failed, "Changes saved successfully."
	if failed {
		page.Result = "Sorry, but the motto you have chosen is too long!"
	}
	r.answer(w, "account/profile.html", failed, page)
}
