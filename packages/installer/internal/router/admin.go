package router

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual"
)

type adminPage struct {
	Name         string
	Email        string
	BornOn       string
	PasswordHelp string
	Error        string
}

// HandleAdminView renders GET /admin.
func (r *Router) HandleAdminView(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, true)
	if !ok {
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "admin.html", adminPage{PasswordHelp: passwordHelp(installation.Settings)})
}

// HandleAdminCreate handles POST /admin: it creates the administrator.
func (r *Router) HandleAdminCreate(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, true)
	if !ok {
		return
	}
	page := adminPage{
		Name:         strings.TrimSpace(req.PostFormValue("name")),
		Email:        strings.TrimSpace(req.PostFormValue("email")),
		BornOn:       strings.TrimSpace(req.PostFormValue("bornOn")),
		PasswordHelp: passwordHelp(installation.Settings),
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
		IP:       clientIP(req),
	})
	switch {
	case err == nil:
		http.Redirect(w, req, "/done", http.StatusSeeOther)
		return
	case errors.Is(err, setup.ErrInstalled):
		http.Redirect(w, req, "/", http.StatusSeeOther)
		return
	case errors.Is(err, setup.ErrHabboName):
		page.Error = "Habbo names are 1 to 24 letters, digits or - = ? ! @ : . ,"
	case errors.Is(err, setup.ErrEmail):
		page.Error = "Enter a valid email address."
	case errors.Is(err, setup.ErrBornOn):
		page.Error = "The birth date must be a past date after 1900."
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

func passwordHelp(s *virtual.Settings) string {
	return fmt.Sprintf("%d to %d characters", s.GetInt("auth.passwordMinLength"), s.GetInt("auth.passwordMaxLength"))
}
