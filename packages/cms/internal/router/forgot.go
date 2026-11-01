package router

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/mail"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type forgotPage struct {
	hotelStatus
	Username string
	Email    string
	Sent     bool
	SignedIn bool
}

// HandleForgotView renders GET /forgot.
func (r *Router) HandleForgotView(w http.ResponseWriter, req *http.Request) {
	r.writeForgot(w, req, forgotPage{})
}

// HandleForgot handles the POST /forgot action. Unlike Holo it answers the same
// way for every name and address, so that the page does not tell a stranger
// which of them belong together, and the reset runs in the background so that
// the response time does not either.
func (r *Router) HandleForgot(w http.ResponseWriter, req *http.Request) {
	if _, ok := auth.FromContext(req.Context()); ok {
		r.writeForgot(w, req, forgotPage{})
		return
	}
	username, email := req.PostFormValue("username"), req.PostFormValue("email")
	ctx := context.WithoutCancel(req.Context())
	go func() {
		if err := r.sendReset(ctx, username, email); err != nil {
			slog.Error("cms: password reset", "err", err)
		}
	}()
	r.writeForgot(w, req, forgotPage{Username: username, Email: email, Sent: true})
}

func (r *Router) writeForgot(w http.ResponseWriter, req *http.Request, page forgotPage) {
	page.hotelStatus = r.hotelStatus(req.Context())
	_, page.SignedIn = auth.FromContext(req.Context())
	astro.WriteTemplate(w, r.deps.Resolver, "forgot.html", page)
}

// sendReset mails Holo's reminder, with the reset link where Holo put the
// password. Any name and address that do not belong together get nothing.
func (r *Router) sendReset(ctx context.Context, username, email string) error {
	reset, err := auth.CreateReset(ctx, r.deps.DB, username, email)
	if err != nil || reset == nil {
		return err
	}
	subject := settings.GetString("site.shortName") + " - Forgot password"
	body := fmt.Sprintf(`Hello %[1]s,
This is a password reminder you or someone else requested. If you did not request a password reminder, don't worry, just delete and ignore this e-mail, as no changes will be made that may affect you.

Username: %[1]s
Password: choose a new one at %[2]s/reset/%[3]s (this link works once, for %[4]d minutes)

We hope to see you soon!
`, reset.Name, settings.GetString("site.url"), reset.Token, settings.GetInt("auth.resetTokenMinutes"))
	return mail.Send(ctx, reset.Email, subject, body)
}
