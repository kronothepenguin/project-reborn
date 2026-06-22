package httpx

import "net/http"

type Middleware func(http.Handler) http.Handler

func Chain(middlewares ...Middleware) Middleware {
	return func(next http.Handler) http.Handler {
		h := next
		for _, m := range middlewares {
			h = m(h)
		}
		return h
	}
}

func With(handler http.Handler, middlewares ...Middleware) http.Handler {
	return Chain(middlewares...)(handler)
}

func MaxBytes(n int64) Middleware {
	return func(next http.Handler) http.Handler {
		return http.MaxBytesHandler(next, n)
	}
}
