package tmpl

import (
	"context"
	"net/http"
)

func WithTemplates(resolve Resolver) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t, err := resolve()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			ctx := context.WithValue(r.Context(), key, t)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
