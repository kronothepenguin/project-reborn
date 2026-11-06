package router

import (
	"fmt"
	"net/http"
)

// HandleIndexView renders GET /{$}.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintln(w, "Hello from Go")
}
