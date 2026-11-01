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

func forgot(name, email string) url.Values {
	return url.Values{"username": {name}, "email": {email}}
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

	wantPage(t, serve(mux, "POST", "/forgot", nil, forgot("sECOND", "ADMIN@example.com")), http.StatusOK, "forgot.html", "Sent:true")

	message := server.Next(t)
	if message.To != "admin@example.com" {
		t.Errorf("the mail went to %q, want the account's address", message.To)
	}
	for _, want := range []string{"Subject: Holo - Forgot password", "Hello Second,", "Username: Second\r\n", "Password: choose a new one", "for 60 minutes", "We hope to see you soon!"} {
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

// Holo said whether the pair existed. Here a stranger learns nothing, and only
// the right pair gets a mail.
func TestForgotAnswersTheSameForEveryPair(t *testing.T) {
	db, mux := newSite(t)
	server := mailServer(t, func(key string, value any) { setSetting(t, db, key, value) })
	habbo(t, db, "admin@example.com", "Admin")
	habbo(t, db, "other@example.com", "Other")

	answer := func(form url.Values) string {
		rec := serve(mux, "POST", "/forgot", nil, form)
		wantPage(t, rec, http.StatusOK, "Sent:true")
		return strings.NewReplacer("Username:"+form.Get("username"), "", "Email:"+form.Get("email"), "").Replace(rec.Body.String())
	}
	want := answer(forgot("Admin", "admin@example.com"))
	for _, form := range []url.Values{
		forgot("Admin", "nobody@example.com"),
		forgot("Nobody", "admin@example.com"),
		forgot("Other", "admin@example.com"),
		forgot("", ""),
	} {
		if got := answer(form); got != want {
			t.Errorf("the answer for %v differs:\n%s\n%s", form, got, want)
		}
	}

	if message := server.Next(t); message.To != "admin@example.com" {
		t.Errorf("the mail went to %q", message.To)
	}
	select {
	case message := <-server.Messages:
		t.Errorf("a second mail went out, to %q", message.To)
	case <-time.After(200 * time.Millisecond):
	}
}

func TestForgotKeepsWhatWasTyped(t *testing.T) {
	_, mux := newSite(t)
	wantPage(t, serve(mux, "POST", "/forgot", nil, forgot("Somebody", "some@example.com")), http.StatusOK, "Username:Somebody", "Email:some@example.com")
}

func TestForgotWithoutMailStillAnswers(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")

	wantPage(t, serve(mux, "POST", "/forgot", nil, forgot("Admin", "admin@example.com")), http.StatusOK, "Sent:true")
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
			serve(mux, "POST", "/forgot", nil, forgot("Admin", "admin@example.com"))
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

// Holo's page tells a signed-in visitor to log out first, and sends nothing.
func TestForgotAsksSignedInVisitorsToLogOut(t *testing.T) {
	db, mux := newSite(t)
	server := mailServer(t, func(key string, value any) { setSetting(t, db, key, value) })
	habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")

	wantPage(t, serve(mux, "GET", "/forgot", cookie, nil), http.StatusOK, "forgot.html", "SignedIn:true")
	wantPage(t, serve(mux, "POST", "/forgot", cookie, forgot("Admin", "admin@example.com")), http.StatusOK, "forgot.html", "SignedIn:true", "Sent:false")

	select {
	case message := <-server.Messages:
		t.Errorf("a mail went out, to %q", message.To)
	case <-time.After(200 * time.Millisecond):
	}
}

func TestResetSendsSignedInVisitorsToMe(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")

	wantRedirect(t, serve(mux, "GET", "/reset/token", cookie, nil), "/me")
	wantRedirect(t, serve(mux, "POST", "/reset/token", cookie, newPassword("brand-new-1")), "/me")
}
