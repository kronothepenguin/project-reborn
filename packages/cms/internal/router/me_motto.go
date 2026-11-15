package router

import (
	"encoding/json/v2"
	"net/http"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	// maxMottoLength is the limit of Holo's inline editor. Its profile form
	// allows fewer characters, as maxProfileMottoLength says.
	maxMottoLength = 38
	maxMottoBody   = 4096
)

type mottoBody struct {
	Motto string `json:"motto"`
}

// HandleMeMotto handles POST /me/motto: it saves a motto and answers with the
// habbo's motto, which stays the old one when the new one is too long.
func (r *Router) HandleMeMotto(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	var body mottoBody
	if err := json.UnmarshalRead(http.MaxBytesReader(w, req.Body, maxMottoBody), &body); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	session, _ := auth.FromContext(ctx)
	if utf8.RuneCountInString(body.Motto) > maxMottoLength {
		avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
		if err != nil {
			r.fail(w, err)
			return
		}
		body.Motto = avatar.Motto
	} else {
		err := r.deps.Queries.UpdateAvatarMotto(ctx, store.UpdateAvatarMottoParams{ID: session.AvatarID, Motto: body.Motto, UpdatedAt: time.Now().UTC()})
		if err != nil {
			r.fail(w, err)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.MarshalWrite(w, body); err != nil {
		r.fail(w, err)
	}
}
