package httpx

import "net/http"

type ServeMux struct {
	http.ServeMux
}

func NewServeMux() *ServeMux {
	return &ServeMux{}
}

func (mux *ServeMux) HandleWith(pattern string, handler http.Handler, middlewares ...Middleware) {
	mux.Handle(pattern, With(handler, middlewares...))
}

func (mux *ServeMux) HandleFuncWith(pattern string, handler func(http.ResponseWriter, *http.Request), middlewares ...Middleware) {
	mux.Handle(pattern, With(http.HandlerFunc(handler), middlewares...))
}
