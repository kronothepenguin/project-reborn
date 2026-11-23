package router

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

type adminPage struct {
	Name         string
	Email        string
	BornOn       string
	PasswordHelp string
	Error        string
}

// HandleAdminView renders GET /installer/admin.
func (r *Router) HandleAdminView(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, "admin")
	if !ok {
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "admin.html", adminPage{PasswordHelp: passwordHelp(req.Context(), installation)})
}

// HandleAdminCreate handles POST /installer/admin: it creates the
// administrator, then sends the browser to the site at /.
func (r *Router) HandleAdminCreate(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, "admin")
	if !ok {
		return
	}
	page := adminPage{
		Name:         strings.TrimSpace(req.PostFormValue("name")),
		Email:        strings.TrimSpace(req.PostFormValue("email")),
		BornOn:       strings.TrimSpace(req.PostFormValue("bornOn")),
		PasswordHelp: passwordHelp(req.Context(), installation),
	}
	password := req.PostFormValue("password")
	if password != req.PostFormValue("passwordConfirm") {
		page.Error = "The passwords do not match."
		r.invalid(w, "admin.html", page)
		return
	}
	bornOn, err := time.Parse(time.DateOnly, page.BornOn)
	if err != nil {
		page.Error = "Enter the birth date."
		r.invalid(w, "admin.html", page)
		return
	}

	err = r.deps.Setup.CreateAdministrator(req.Context(), setup.Administrator{
		Name:     page.Name,
		Email:    page.Email,
		BornOn:   bornOn,
		Password: password,
		IP:       auth.ClientIP(req),
	})
	switch {
	case err == nil:
		http.Redirect(w, req, "/", http.StatusSeeOther)
		return
	case errors.Is(err, setup.ErrInstalled):
		http.Redirect(w, req, "/installer/", http.StatusSeeOther)
		return
	case errors.Is(err, auth.ErrHabboName):
		page.Error = "Habbo names are 1 to 24 letters, digits or - = ? ! @ : . ,"
	case errors.Is(err, auth.ErrEmail):
		page.Error = "Enter a valid email address."
	case errors.Is(err, auth.ErrBornOn):
		page.Error = "The birth date must be a past date from 1920 on."
	case errors.Is(err, auth.ErrPasswordLength):
		page.Error = "Passwords are " + page.PasswordHelp + "."
	case store.IsConflict(err):
		page.Error = "That habbo name or email address is taken."
	default:
		r.fail(w, err)
		return
	}
	r.invalid(w, "admin.html", page)
}

func passwordHelp(ctx context.Context, installation setup.Installation) string {
	q := store.New(installation.DB)
	return fmt.Sprintf("%d to %d characters", settings.Int(ctx, q, "auth.passwordMinLength"), settings.Int(ctx, q, "auth.passwordMaxLength"))
}
