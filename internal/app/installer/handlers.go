package installer

import (
	"errors"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func (i *Installer) handleIndexView(w http.ResponseWriter, r *http.Request) {
	if i.isValidSessionCookie(r) {
		i.redirectToInstall(w, r)
		return
	}

	tmpl.ExecuteTemplate(r.Context(), w, "index.page.html", map[string]any{"LoginError": i.err})
}

func (i *Installer) handleLogin(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")
	password := r.FormValue("password")

	if username != i.username || password != i.password {
		i.err = errors.New("invalid credentials")
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	i.session = generateRandomString(32)
	i.setSessionCookie(w)

	i.err = nil
	i.redirectToInstall(w, r)
}

func (i *Installer) handleInstallView(w http.ResponseWriter, r *http.Request) {
	if !i.isValidSessionCookie(r) {
		i.clearSessionCookie(w)
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	tmpl.ExecuteTemplate(r.Context(), w, "install.page.html", nil)
}

func (i *Installer) handleInstallDatabase(w http.ResponseWriter, r *http.Request) {
	if !i.isValidSessionCookie(r) {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
}

func (i *Installer) handleInstallSettings(w http.ResponseWriter, r *http.Request) {
	if !i.isValidSessionCookie(r) {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
}

func (i *Installer) handleInstallAdministrator(w http.ResponseWriter, r *http.Request) {
	if !i.isValidSessionCookie(r) {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
}
