package cms

import (
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/mail/mailtest"
)

var resetLink = regexp.MustCompile(`http://localhost:17387/reset/([A-Za-z0-9_-]+)`)

func mailServer(t *testing.T, set func(key string, value any)) *mailtest.Server {
	t.Helper()
	server := mailtest.Start(t)
	set("mail.host", server.Host)
	set("mail.port", server.Port)
	set("mail.from", "hotel@example.com")
	return server
}

func newPassword(password string) url.Values {
	return url.Values{"password": {password}, "passwordConfirm": {password}}
}

func TestForgotMailsAWorkingLink(t *testing.T) {
	db, mux := newSite(t)
	server := mailServer(t, func(key string, value any) { setSetting(t, db, key, value) })
	userID := habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")
	secondHabbo(t, db, userID, "Second")

	wantPage(t, serve(mux, "POST", "/forgot", nil, url.Values{"email": {"ADMIN@example.com"}}), http.StatusOK, "forgot.html", "Sent:true")

	message := server.Next(t)
	if message.To != "admin@example.com" {
		t.Errorf("the mail went to %q, want the account's address", message.To)
	}
	for _, want := range []string{"Subject: Holo - Forgot password", "Your habbos: Admin, Second", "for 60 minutes"} {
		if !strings.Contains(message.Data, want) {
			t.Errorf("the mail does not contain %q:\n%s", want, message.Data)
		}
	}
	link := resetLink.FindStringSubmatch(message.Data)
	if link == nil {
		t.Fatalf("no reset link in the mail:\n%s", message.Data)
	}
	path := "/reset/" + link[1]

	wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusOK, "reset/token.html", "Done:false")
	wantPage(t, serve(mux, "POST", path, nil, newPassword("brand-new-1")), http.StatusOK, "reset/token.html", "Done:true")

	wantRedirect(t, serve(mux, "GET", "/me", cookie, nil), "/")
	wantPage(t, serve(mux, "POST", "/", nil, credentials("Admin", "secret123")), http.StatusUnprocessableEntity, "Invalid username or password.")
	wantRedirect(t, serve(mux, "POST", "/", nil, credentials("Admin", "brand-new-1")), "/me")

	wantPage(t, serve(mux, "POST", path, nil, newPassword("another-one-2")), http.StatusUnprocessableEntity, "Invalid:true")
}

func TestForgotAnswersTheSameForAnUnknownAddress(t *testing.T) {
	db, mux := newSite(t)
	server := mailServer(t, func(key string, value any) { setSetting(t, db, key, value) })
	habbo(t, db, "admin@example.com", "Admin")

	known := serve(mux, "POST", "/forgot", nil, url.Values{"email": {"admin@example.com"}})
	unknown := serve(mux, "POST", "/forgot", nil, url.Values{"email": {"nobody@example.com"}})
	if known.Code != unknown.Code {
		t.Errorf("status %d for a known address and %d for an unknown one", known.Code, unknown.Code)
	}
	if got, want := strings.ReplaceAll(unknown.Body.String(), "nobody@", "admin@"), known.Body.String(); got != want {
		t.Errorf("the answers differ:\n%s\n%s", got, want)
	}

	server.Next(t)
	select {
	case message := <-server.Messages:
		t.Errorf("a second mail went out, to %q", message.To)
	case <-time.After(200 * time.Millisecond):
	}
}

func TestForgotWithoutMailStillAnswers(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")

	wantPage(t, serve(mux, "POST", "/forgot", nil, url.Values{"email": {"admin@example.com"}}), http.StatusOK, "Sent:true")
}

func TestForgotPageStartsEmpty(t *testing.T) {
	_, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/forgot", nil, nil), http.StatusOK, "forgot.html", "Sent:false")
}

func TestResetRejections(t *testing.T) {
	for _, c := range []struct {
		name string
		form url.Values
		want string
	}{
		{"passwords differ", url.Values{"password": {"brand-new-1"}, "passwordConfirm": {"brand-new-2"}}, "The passwords do not match. Please try again."},
		{"short password", newPassword("short"), "Your password must be 6 to 25 characters long."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			server := mailServer(t, func(key string, value any) { setSetting(t, db, key, value) })
			habbo(t, db, "admin@example.com", "Admin")
			serve(mux, "POST", "/forgot", nil, url.Values{"email": {"admin@example.com"}})
			path := "/reset/" + resetLink.FindStringSubmatch(server.Next(t).Data)[1]

			wantPage(t, serve(mux, "POST", path, nil, c.form), http.StatusUnprocessableEntity, "reset/token.html", c.want)

			wantRedirect(t, serve(mux, "POST", "/", nil, credentials("Admin", "secret123")), "/me")
			wantPage(t, serve(mux, "POST", path, nil, newPassword("brand-new-1")), http.StatusOK, "Done:true")
		})
	}
}

func TestResetWithABadLink(t *testing.T) {
	_, mux := newSite(t)
	wantPage(t, serve(mux, "POST", "/reset/not-a-token", nil, newPassword("brand-new-1")), http.StatusUnprocessableEntity, "Invalid:true")
}

func TestForgotAndResetSendSignedInVisitorsToMe(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")

	wantRedirect(t, serve(mux, "GET", "/forgot", cookie, nil), "/me")
	wantRedirect(t, serve(mux, "POST", "/forgot", cookie, url.Values{"email": {"admin@example.com"}}), "/me")
	wantRedirect(t, serve(mux, "GET", "/reset/token", cookie, nil), "/me")
	wantRedirect(t, serve(mux, "POST", "/reset/token", cookie, newPassword("brand-new-1")), "/me")
}
