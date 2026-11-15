package router

import (
	"fmt"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// iot/go.php's answers to a help request, and the two lengths of 0109. Holo's
// "untill" is spelled correctly, as on every page of the public site.
const (
	helpBlank        = "Please do not leave any fields blank"
	helpSubjectLong  = "Your subject may not be longer than 50 characters."
	helpQuestionLong = "Your question may not be longer than %d characters."
	helpWaiting      = "Unable to submit support request: you still have a pending support request. Please try again later."
	helpSent         = "Ticket submitted. We will get back to you shortly, please be patient as this might take a while. Note that you cannot send any more support requests until this support ticket is picked up."
	helpSubjectMax   = 50
)

// helpPage is go.php's Help Tool window: the form, under an answer that keeps
// it, or an answer alone, which go.php closed with Close.
type helpPage struct {
	ShortName string
	Result    string
	Form      bool
}

// HandleHelpView handles GET /help, iot/go.php's form. As in go.php, a waiting
// request only answers once the form is sent.
func (r *Router) HandleHelpView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "help.html", helpPage{ShortName: settings.GetString("site.shortName"), Form: true})
}

// HandleHelpSend handles POST /help: the active habbo's help request, unless go.php
// or 0109 refuses it. A refused form comes back empty, as go.php's did.
func (r *Router) HandleHelpSend(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	view := helpPage{ShortName: settings.GetString("site.shortName"), Result: helpSent}
	subject, message := req.PostFormValue("subject"), req.PostFormValue("message")
	if refusal := helpRefusal(subject, message); refusal != "" {
		view.Result, view.Form = refusal, true
		w.WriteHeader(http.StatusUnprocessableEntity)
		astro.WriteTemplate(w, r.deps.Resolver, "help.html", view)
		return
	}

	waiting := false
	err := r.inTx(ctx, func(q *store.Queries) error {
		n, err := q.CountWaitingHelpTickets(ctx, session.AvatarID)
		if err != nil || n > 0 {
			waiting = n > 0
			return err
		}
		return q.CreateHelpTicket(ctx, store.CreateHelpTicketParams{
			AvatarID:  session.AvatarID,
			Subject:   subject,
			Message:   message,
			IP:        auth.ClientIP(req),
			CreatedAt: time.Now().UTC(),
		})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	if waiting {
		view.Result = helpWaiting
		w.WriteHeader(http.StatusUnprocessableEntity)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "help.html", view)
}

// helpRefusal is the answer that refuses a request's subject and question, or
// empty. Spaces alone are blank, as in the forum's posts, and 0 is not, where
// PHP's empty read it so.
func helpRefusal(subject, message string) string {
	limit := settings.GetInt("help.messageMaxLength")
	switch {
	case strings.TrimSpace(subject) == "" || strings.TrimSpace(message) == "":
		return helpBlank
	case utf8.RuneCountInString(subject) > helpSubjectMax:
		return helpSubjectLong
	case utf8.RuneCountInString(message) > limit:
		return fmt.Sprintf(helpQuestionLong, limit)
	}
	return ""
}
