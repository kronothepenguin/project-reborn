package installer

import (
	"math/rand"
	"net/http"
	"time"
)

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	b := make([]byte, length)
	for i := range length {
		b[i] = charset[r.Intn(len(charset))]
	}
	return string(b)
}

func (i *Installer) isValidSessionCookie(r *http.Request) bool {
	// cookie, err := r.Cookie("session")
	// if err == nil && i.session == cookie.Value {
	// 	return true
	// }
	return true
}

func (i *Installer) setSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    i.session,
		HttpOnly: true,
		MaxAge:   int(24 * time.Hour),
		SameSite: http.SameSiteStrictMode,
	})
}

func (i *Installer) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		HttpOnly: true,
		MaxAge:   -1,
		SameSite: http.SameSiteStrictMode,
	})
}

func (i *Installer) redirectToInstall(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/install", http.StatusFound)
}
