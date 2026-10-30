package router

import (
	"errors"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
)

type resetPage struct {
	hotelStatus
	Error   string
	Invalid bool
	Done    bool
}

// HandleResetView renders GET /reset/{token}.
func (r *Router) HandleResetView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "reset/token.html", resetPage{})
}

// HandleReset handles the POST /reset/{token} action.
func (r *Router) HandleReset(w http.ResponseWriter, req *http.Request) {
	password := req.PostFormValue("password")
	if password != req.PostFormValue("passwordConfirm") {
		r.invalid(w, "reset/token.html", resetPage{Error: "The passwords do not match. Please try again."})
		return
	}

	err := auth.ResetPassword(req.Context(), r.deps.DB, req.PathValue("token"), password)
	switch {
	case err == nil:
		astro.WriteTemplate(w, r.deps.Resolver, "reset/token.html", resetPage{Done: true})
	case errors.Is(err, auth.ErrPasswordLength):
		r.invalid(w, "reset/token.html", resetPage{Error: passwordLengthMessage()})
	case errors.Is(err, auth.ErrInvalidReset):
		r.invalid(w, "reset/token.html", resetPage{Invalid: true})
	default:
		r.fail(w, err)
	}
}
