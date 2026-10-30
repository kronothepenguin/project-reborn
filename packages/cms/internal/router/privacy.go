package router

import "net/http"

// HandlePrivacyView renders GET /privacy.
func (r *Router) HandlePrivacyView(w http.ResponseWriter, req *http.Request) {
	r.writeLegalPage(w, "privacy.html")
}
