package httpx

import (
	"net/http"
	"net/http/httptest"
)

type RootOption func(*rootHandler)

type rootHandler struct {
	staticHandler   http.Handler
	notFoundHandler http.Handler
}

func (h *rootHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	rr := httptest.NewRecorder()

	h.staticHandler.ServeHTTP(rr, r)

	if rr.Code != http.StatusNotFound {
		for key, values := range rr.Header() {
			for _, value := range values {
				w.Header().Add(key, value)
			}
		}
		w.WriteHeader(rr.Code)
		rr.Body.WriteTo(w)
		return
	}

	h.notFoundHandler.ServeHTTP(w, r)
}

func RootHandler(opts ...RootOption) http.Handler {
	rh := &rootHandler{
		staticHandler:   http.NotFoundHandler(),
		notFoundHandler: http.NotFoundHandler(),
	}

	for _, opt := range opts {
		opt(rh)
	}

	return rh
}

func WithStatic(static http.Handler) RootOption {
	return func(rh *rootHandler) {
		rh.staticHandler = static
	}
}

func WithNotFound(notFound http.Handler) RootOption {
	return func(rh *rootHandler) {
		rh.notFoundHandler = notFound
	}
}
