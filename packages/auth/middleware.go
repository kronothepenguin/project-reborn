package auth

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
)

// Protect resolves its configuration once and returns reusable middleware that
// validates the request's session, rejects the request when validation fails,
// and runs the next handler with the *Auth in the request context.
//
// Because Protect cannot return an error, invalid options panic at
// construction time with an ErrConfig-wrapped error (a programmer error); all
// error-returning functions return ErrConfig instead.
func Protect(validator Validator, toucher Toucher, opts ...Option) func(http.Handler) http.Handler {
	s, err := resolve(opts...)
	if err != nil {
		panic(fmt.Errorf("auth: Protect: %w", err))
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			a, err := validate(r.Context(), r, s, validator, toucher)
			if err != nil {
				s.unauthorizedHandler.ServeHTTP(w, r)
				return
			}
			if err := checkCSRF(r, a, s); err != nil {
				s.forbiddenHandler.ServeHTTP(w, r)
				return
			}
			next.ServeHTTP(w, r.WithContext(NewContext(r.Context(), a)))
		})
	}
}

// CheckCSRF validates the synchronizer token on an unsafe method. It is a
// no-op for safe methods (GET/HEAD/OPTIONS/TRACE).
func CheckCSRF(r *http.Request, a *Auth, opts ...Option) error {
	s, err := resolve(opts...)
	if err != nil {
		return err
	}
	return checkCSRF(r, a, s)
}

// checkCSRF reads the token from the configured header first, then the
// configured form field, and compares it constant-time with the session's
// derived token.
func checkCSRF(r *http.Request, a *Auth, s settings) error {
	if isSafeMethod(r.Method) {
		return nil
	}
	if a == nil {
		return ErrCSRF
	}
	token := r.Header.Get(s.csrfHeader)
	if token == "" {
		if err := r.ParseForm(); err != nil {
			return ErrCSRF
		}
		token = r.PostFormValue(s.csrfParam)
	}
	if token == "" || subtle.ConstantTimeCompare([]byte(token), []byte(a.CSRF)) != 1 {
		return ErrCSRF
	}
	return nil
}

// isSafeMethod reports whether a method is CSRF-safe (no state change).
func isSafeMethod(method string) bool {
	switch method {
	case http.MethodGet, http.MethodHead, http.MethodOptions, http.MethodTrace:
		return true
	default:
		return false
	}
}

// authContextKey is the unexported context key for the validated request view.
type authContextKey struct{}

// NewContext returns a context carrying the validated *Auth.
func NewContext(ctx context.Context, a *Auth) context.Context {
	return context.WithValue(ctx, authContextKey{}, a)
}

// FromContext returns the *Auth stored by Protect or NewContext.
func FromContext(ctx context.Context) (*Auth, bool) {
	a, ok := ctx.Value(authContextKey{}).(*Auth)
	return a, ok
}
