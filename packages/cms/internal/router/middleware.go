package router

import (
	"net/http"
	"net/url"
)

// OriginCheck guards public unsafe routes against cross-site form posts. When
// the Origin header (fallback Referer) is present and its scheme and host do
// not match the public base URL, the request is rejected with 403. Absent
// headers pass so non-browser clients keep working (research R6).
func (r *Router) OriginCheck(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		source := req.Header.Get("Origin")
		if source == "" {
			source = req.Header.Get("Referer")
		}
		if source != "" && !r.sameOrigin(source) {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, req)
	})
}

// sameOrigin reports whether raw's scheme and host match the public base URL.
// A missing base URL fails closed.
func (r *Router) sameOrigin(raw string) bool {
	parsed, err := url.Parse(raw)
	if err != nil || r.deps.BaseURL == nil {
		return false
	}
	return parsed.Scheme == r.deps.BaseURL.Scheme && parsed.Host == r.deps.BaseURL.Host
}
