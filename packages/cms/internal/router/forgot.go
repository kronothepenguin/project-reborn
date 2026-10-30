package router

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/mail"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type forgotPage struct {
	hotelStatus
	Email string
	Sent  bool
}

// HandleForgotView renders GET /forgot.
func (r *Router) HandleForgotView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "forgot.html", forgotPage{})
}

// HandleForgot handles the POST /forgot action. It answers the same way for
// every address, and the reset runs in the background so that the response time
// does not reveal whether an address has an account either.
func (r *Router) HandleForgot(w http.ResponseWriter, req *http.Request) {
	email := strings.TrimSpace(req.PostFormValue("email"))
	ctx := context.WithoutCancel(req.Context())
	go func() {
		if err := r.sendReset(ctx, email); err != nil {
			slog.Error("cms: password reset", "err", err)
		}
	}()
	astro.WriteTemplate(w, r.deps.Resolver, "forgot.html", forgotPage{Email: email, Sent: true})
}

// sendReset mails the reset link and the account's habbos, since a habbo name is
// what signs in. An unknown address gets nothing.
func (r *Router) sendReset(ctx context.Context, email string) error {
	token, err := auth.CreateReset(ctx, r.deps.DB, email)
	if err != nil || token == "" {
		return err
	}
	user, err := r.deps.Queries.GetUserByEmail(ctx, email)
	if err != nil {
		return err
	}
	avatars, err := r.deps.Queries.ListUserAvatars(ctx, user.ID)
	if err != nil {
		return err
	}
	names := make([]string, len(avatars))
	for i, avatar := range avatars {
		names[i] = avatar.Name
	}

	subject := settings.GetString("site.shortName") + " - Forgot password"
	body := fmt.Sprintf(`Hello,

This is a password reset you or someone else requested. If you did not request it, don't worry, just delete and ignore this e-mail, as no changes will be made that may affect you.

Your habbos: %s

Choose a new password here. The link works once, for %d minutes:
%s/reset/%s

We hope to see you soon!
`, strings.Join(names, ", "), settings.GetInt("auth.resetTokenMinutes"), settings.GetString("site.url"), token)
	return mail.Send(ctx, user.Email, subject, body)
}
