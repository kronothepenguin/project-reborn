// Package auth provides HTTP session-based authentication for applications
// that verify account credentials themselves. It owns the server-side session
// lifecycle after a successful login: creation, validation on every request,
// credential rotation on privilege changes, revocation, listing, housekeeping,
// audit events, and cross-site request forgery protection.
//
// Every operation is a package-level function. Required dependencies are
// parameters — the persistence roles the operation actually uses — and
// optional configuration are Option values with secure defaults. The library
// ships no persistence implementation; applications implement the Creator,
// Validator, Toucher, Revoker, AccountRevoker, Lister, and Purger interfaces
// (a concrete store usually implements all seven).
//
//	// The application verified credentials; now establish a session:
//	a, err := auth.Create(w, r, user.ID, store, store)
//	if err != nil {
//		// fail closed: no session was stored
//	}
//
//	// Configure protected routes once and reuse the middleware:
//	protect := auth.Protect(store, store, auth.WithIdleTimeout(20*time.Minute))
//	mux.Handle("POST /admin", protect(adminHandler))
//
//	// Inside a handler or template:
//	a, _ := auth.FromContext(r.Context())
//	token := a.CSRF                    // render into state-changing forms
//	account := a.Session.AccountID
//
//	// Logout, privilege change, and scheduled housekeeping:
//	_ = auth.Logout(w, r, store)
//	a, _ = auth.PasswordChanged(w, r, a, store, store, store)
//	n, _ := auth.Purge(ctx, store)     // caller owns the schedule
//
// Only credential digests ever reach a store; the raw credential lives solely
// in the session cookie and in the redacting Auth value. No password, secret,
// or raw credential is ever logged or placed in an audit Event.
package auth
