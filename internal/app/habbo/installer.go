package habbo

import (
	"database/sql"
	"errors"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func shouldInstall(db *sql.DB) bool {
	_, err := db.Exec("SELECT * FROM system_versions")
	return err != nil
}

func createInstallationHandler(db *sql.DB, done chan struct{}) http.Handler {
	username := generateRandomString(8)
	password := generateRandomString(8)
	log.Printf("username: `%s`\tpassword: `%s`", username, password)

	installation := &installation{db: db, done: done, username: username, password: password}
	mux := http.NewServeMux()

	mux.HandleFunc("GET /", installation.handleIndex)
	mux.HandleFunc("POST /login", installation.handleLogin)
	mux.HandleFunc("GET /install", installation.handleInstall)
	mux.HandleFunc("POST /install/database", installation.handleInstallDatabase)
	mux.HandleFunc("POST /install/settings", installation.handleInstallSettings)
	mux.HandleFunc("POST /install/administrator", installation.handleInstallAdministrator)

	return mux
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	b := make([]byte, length)
	for i := range length {
		b[i] = charset[r.Intn(len(charset))]
	}
	return string(b)
}

type installation struct {
	db   *sql.DB
	done chan struct{}

	username string
	password string

	session string

	err error
}

func (i *installation) isValidSessionCookie(r *http.Request) bool {
	// cookie, err := r.Cookie("session")
	// if err == nil && i.session == cookie.Value {
	// 	return true
	// }
	return true
}

func (i *installation) setSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    i.session,
		HttpOnly: true,
		MaxAge:   int(24 * time.Hour),
		SameSite: http.SameSiteStrictMode,
	})
}

func (i *installation) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		HttpOnly: true,
		MaxAge:   -1,
		SameSite: http.SameSiteStrictMode,
	})
}

func (i *installation) redirectToInstall(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/install", http.StatusFound)
}

func (i *installation) handleIndex(w http.ResponseWriter, r *http.Request) {
	if i.isValidSessionCookie(r) {
		i.redirectToInstall(w, r)
		return
	}

	tmpl.Lookup("install.index.html").Execute(w, map[string]any{"LoginError": i.err})
}

func (i *installation) handleLogin(w http.ResponseWriter, r *http.Request) {
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

func (i *installation) handleInstall(w http.ResponseWriter, r *http.Request) {
	if !i.isValidSessionCookie(r) {
		i.clearSessionCookie(w)
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	tmpl.Lookup("install.install.html").Execute(w, nil)
}

func (i *installation) handleInstallDatabase(w http.ResponseWriter, r *http.Request) {
	if !i.isValidSessionCookie(r) {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
}

func (i *installation) handleInstallSettings(w http.ResponseWriter, r *http.Request) {
	if !i.isValidSessionCookie(r) {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
}

func (i *installation) handleInstallAdministrator(w http.ResponseWriter, r *http.Request) {
	if !i.isValidSessionCookie(r) {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
}
