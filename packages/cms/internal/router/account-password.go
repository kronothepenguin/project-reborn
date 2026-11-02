package router

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type passwordPage struct {
	accountPage
	birthDate
}

func (r *Router) newPasswordPage(ctx context.Context) (passwordPage, error) {
	account, err := r.newAccountPage(ctx)
	if err != nil {
		return passwordPage{}, err
	}
	return passwordPage{accountPage: account, birthDate: newBirthDate(0, 0, 0)}, nil
}

// HandleAccountPasswordView renders GET /account/password.
func (r *Router) HandleAccountPasswordView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newPasswordPage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/password.html", false, page)
}

// HandleAccountPassword handles the POST /account/password action. The page is
// built before the change, which ends the visitor's own session.
func (r *Router) HandleAccountPassword(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	page, err := r.newPasswordPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}

	page.Result, page.Failed, err = r.changePassword(w, req, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/password.html", page.Failed, page)
}

func (r *Router) changePassword(w http.ResponseWriter, req *http.Request, userID int64) (result string, failed bool, err error) {
	match, err := r.detailsMatch(req, userID)
	if err != nil {
		return "", false, err
	}
	if !match {
		return detailsMismatch, true, nil
	}
	password := req.PostFormValue("pass")
	if password != req.PostFormValue("confpass") {
		return "The passwords don't match", true, nil
	}
	err = auth.ChangePassword(w, req, r.deps.DB, password)
	switch {
	case errors.Is(err, auth.ErrPasswordTooShort):
		return fmt.Sprintf("Password is too short, %d characters minimum", settings.GetInt("auth.passwordMinLength")), true, nil
	case errors.Is(err, auth.ErrPasswordTooLong):
		return fmt.Sprintf("Password is too long, %d characters maximum", settings.GetInt("auth.passwordMaxLength")), true, nil
	case err != nil:
		return "", false, err
	}
	return "Your password has been changed successfully.", false, nil
}
