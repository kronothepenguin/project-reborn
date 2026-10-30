package router

import (
	"context"
	"encoding/json/v2"
	"errors"
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const maxCheckNameBody = 1024

type checkNameRequest struct {
	Name string `json:"name"`
}

type checkNameResponse struct {
	Error string `json:"error"`
}

// HandleRegisterCheckName handles POST /register/check-name: it answers what is
// wrong with a name, and an empty error when the name can be registered.
func (r *Router) HandleRegisterCheckName(w http.ResponseWriter, req *http.Request) {
	var body checkNameRequest
	if err := json.UnmarshalRead(http.MaxBytesReader(w, req.Body, maxCheckNameBody), &body); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	problem, err := r.nameProblem(req.Context(), strings.TrimSpace(body.Name))
	if err != nil {
		r.fail(w, err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.MarshalWrite(w, checkNameResponse{Error: problem}); err != nil {
		r.fail(w, err)
	}
}

// nameProblem says, with Holo's texts, what is wrong with a new habbo's name.
func (r *Router) nameProblem(ctx context.Context, name string) (string, error) {
	switch err := auth.ValidateHabboName(name); {
	case errors.Is(err, auth.ErrHabboNameEmpty):
		return "Please enter a username.", nil
	case errors.Is(err, auth.ErrHabboNameTooLong):
		return "The name you have chosen is too long.", nil
	case errors.Is(err, auth.ErrHabboNameReserved):
		return "This name is not allowed.", nil
	case err != nil:
		return "Your username is invalid or contains invalid characters.", nil
	}
	switch _, err := r.deps.Queries.GetAvatarByName(ctx, name); {
	case err == nil:
		return "This username is in use. Please choose another name.", nil
	case store.IsNotFound(err):
		return "", nil
	default:
		return "", err
	}
}
