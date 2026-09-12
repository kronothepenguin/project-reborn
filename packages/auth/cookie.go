package auth

import (
	"net/http"
	"time"
)

// maxCookieLength is the largest accepted session cookie value. Longer values
// are treated as malformed and denied.
const maxCookieLength = 128

// sessionCredential extracts exactly one well-formed session cookie value.
// Absent, duplicate, empty, or oversized cookies are rejected.
func sessionCredential(r *http.Request, s settings) (string, bool) {
	var value string
	count := 0
	for _, cookie := range r.Cookies() {
		if cookie.Name != s.cookieName {
			continue
		}
		count++
		value = cookie.Value
	}
	if count != 1 || value == "" || len(value) > maxCookieLength {
		return "", false
	}
	return value, true
}

// setSessionCookie writes the hardened session cookie. Remember-me sessions
// additionally carry Max-Age/Expires; the default cookie is browser-session.
func setSessionCookie(w http.ResponseWriter, s settings, credential string, remember bool) {
	cookie := &http.Cookie{
		Name:     s.cookieName,
		Value:    credential,
		Path:     s.cookiePath,
		Domain:   s.cookieDomain,
		HttpOnly: true,
		Secure:   s.cookieSecure,
		SameSite: s.sameSite,
	}
	if remember {
		cookie.MaxAge = int(s.rememberTimeout / time.Second)
		cookie.Expires = s.now().Add(s.rememberTimeout)
	}
	http.SetCookie(w, cookie)
}

// clearSessionCookie expires the session cookie in the browser.
func clearSessionCookie(w http.ResponseWriter, s settings) {
	http.SetCookie(w, &http.Cookie{
		Name:     s.cookieName,
		Value:    "",
		Path:     s.cookiePath,
		Domain:   s.cookieDomain,
		HttpOnly: true,
		Secure:   s.cookieSecure,
		SameSite: s.sameSite,
		MaxAge:   -1,
		Expires:  time.Unix(1, 0),
	})
}

// requestAddress returns the client network address recorded for audit.
func requestAddress(r *http.Request) string {
	return r.RemoteAddr
}
