package router

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const detailsMismatch = "The given information doesn't match what we have on record"

type emailPage struct {
	accountPage
	birthDate
	Email      string
	Newsletter bool
}

// detailsMatch reports whether the form holds the user's password and birth
// date, which Holo asks before an email or a password change.
func (r *Router) detailsMatch(req *http.Request, userID int64) (bool, error) {
	ctx := req.Context()
	user, err := r.deps.Queries.GetUser(ctx, userID)
	if err != nil {
		return false, err
	}
	day, dayErr := strconv.Atoi(req.PostFormValue("day"))
	month, monthErr := strconv.Atoi(req.PostFormValue("month"))
	year, yearErr := strconv.Atoi(req.PostFormValue("year"))
	if dayErr != nil || monthErr != nil || yearErr != nil {
		return false, nil
	}
	if day != user.BornOn.Day() || month != int(user.BornOn.Month()) || year != user.BornOn.Year() {
		return false, nil
	}
	return auth.CheckPassword(ctx, r.deps.DB, userID, req.PostFormValue("password"))
}

func (r *Router) newEmailPage(ctx context.Context) (emailPage, error) {
	session, _ := auth.FromContext(ctx)
	account, err := r.newAccountPage(ctx)
	if err != nil {
		return emailPage{}, err
	}
	user, err := r.deps.Queries.GetUser(ctx, session.UserID)
	if err != nil {
		return emailPage{}, err
	}
	return emailPage{accountPage: account, birthDate: newBirthDate(0, 0, 0), Email: user.Email, Newsletter: user.Newsletter}, nil
}

// HandleAccountEmailView renders GET /account/email.
func (r *Router) HandleAccountEmailView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newEmailPage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/email.html", false, page)
}

// HandleAccountEmail handles the POST /account/email action.
func (r *Router) HandleAccountEmail(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	email, newsletter := req.PostFormValue("email"), req.PostFormValue("newsletter") != ""

	result, failed, err := r.changeEmail(req, session.UserID, email, newsletter)
	if err != nil {
		r.fail(w, err)
		return
	}
	page, err := r.newEmailPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Email, page.Newsletter, page.Result, page.Failed = email, newsletter, result, failed
	r.answer(w, "account/email.html", failed, page)
}

func (r *Router) changeEmail(req *http.Request, userID int64, email string, newsletter bool) (result string, failed bool, err error) {
	match, err := r.detailsMatch(req, userID)
	if err != nil {
		return "", false, err
	}
	if !match {
		return detailsMismatch, true, nil
	}
	if auth.ValidateEmail(email) != nil {
		return "Invalid e-mail address", true, nil
	}
	err = r.deps.Queries.UpdateUserEmail(req.Context(), store.UpdateUserEmailParams{
		ID:         userID,
		Email:      email,
		Newsletter: newsletter,
		UpdatedAt:  time.Now().UTC(),
	})
	if store.IsConflict(err) {
		return "This e-mail address already has an account.", true, nil
	}
	if err != nil {
		return "", false, err
	}
	return "Your e-mail address has been changed to " + email, false, nil
}
