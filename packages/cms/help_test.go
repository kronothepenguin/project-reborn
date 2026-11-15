package cms

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

const (
	helpForm    = "help.html {ShortName:Reborn Result: Form:true}"
	helpSent    = "Result:Ticket submitted. We will get back to you shortly, please be patient as this might take a while. Note that you cannot send any more support requests until this support ticket is picked up. Form:false"
	helpWaiting = "Result:Unable to submit support request: you still have a pending support request. Please try again later. Form:false"
	helpBlank   = "Result:Please do not leave any fields blank Form:true"
)

func askHelp(mux *http.ServeMux, cookie *http.Cookie, subject, message string) *httptest.ResponseRecorder {
	return serve(mux, "POST", "/help", cookie, url.Values{"subject": {subject}, "message": {message}})
}

func TestTheHelpToolShowsGoPhpsFormToHabbos(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	wantPage(t, serve(mux, "GET", "/help", login(t, db, "Dora"), nil), http.StatusOK, helpForm)

	// Visitors sign in first (0108), and nothing is written for them.
	wantRedirect(t, serve(mux, "GET", "/help", nil, nil), "/")
	wantRedirect(t, askHelp(mux, nil, "Lost", "Help"), "/")
	if n := countRows(t, db, `SELECT COUNT(*) FROM help_tickets`); n != 0 {
		t.Errorf("a visitor wrote %d tickets", n)
	}

	setMaintenance(t, db, true)
	wantPage(t, serve(mux, "GET", "/help", login(t, db, "Dora"), nil), http.StatusServiceUnavailable, "maintenance.html")
}

func TestAHelpRequestWritesTheActiveHabbosTicket(t *testing.T) {
	db, mux := newSite(t)
	userID := habbo(t, db, "dora@example.com", "Dora")
	secondHabbo(t, db, userID, "DoraToo")
	wantPage(t, askHelp(mux, login(t, db, "DoraToo"), "Lost my sofa", "It went <away>.\r\nWhere is it?"), http.StatusOK, "help.html {ShortName:Reborn "+helpSent+"}")

	var avatar, post sql.NullInt64
	var subject, message, ip string
	var waiting bool
	row := db.QueryRowContext(t.Context(), `SELECT avatar_id, forum_post_id, subject, message, ip, picked_up_at IS NULL FROM help_tickets`)
	if err := row.Scan(&avatar, &post, &subject, &message, &ip, &waiting); err != nil {
		t.Fatal(err)
	}
	// The text is kept as typed: housekeeping escapes it where it shows it.
	if avatar.Int64 != avatarID(t, db, "DoraToo") || post.Valid || subject != "Lost my sofa" || message != "It went <away>.\r\nWhere is it?" || ip != "192.0.2.1" || !waiting {
		t.Errorf("the ticket = %v %v %q %q %q waiting %t", avatar, post, subject, message, ip, waiting)
	}
}

func TestAHabboWithAWaitingRequestCannotAskAgain(t *testing.T) {
	db, mux, frankPost, _ := board(t)
	eve := login(t, db, "Eve")
	wantPage(t, askHelp(mux, eve, "One", "First"), http.StatusOK, helpSent)
	// go.php asked nothing until the form was sent.
	wantPage(t, serve(mux, "GET", "/help", eve, nil), http.StatusOK, helpForm)
	wantPage(t, askHelp(mux, eve, "Two", "Second"), http.StatusUnprocessableEntity, helpWaiting)

	// A post report waits as a help request does (0090), and the rule counts
	// habbos: Frank's other habbo still asks.
	dora := login(t, db, "Dora")
	wantPage(t, reportPost(mux, dora, frankPost, "1"), http.StatusOK, reportedPost)
	wantPage(t, askHelp(mux, dora, "Three", "Third"), http.StatusUnprocessableEntity, helpWaiting)
	wantPage(t, askHelp(mux, login(t, db, "Frank"), "Four", "Fourth"), http.StatusOK, helpSent)
	wantPage(t, askHelp(mux, login(t, db, "FrankToo"), "Five", "Fifth"), http.StatusOK, helpSent)
	if n := countRows(t, db, `SELECT COUNT(*) FROM help_tickets`); n != 4 {
		t.Errorf("%d tickets, want Eve's, Dora's report, Frank's and FrankToo's", n)
	}

	// Once staff pick up her request, Eve asks again.
	if _, err := db.ExecContext(t.Context(), `UPDATE help_tickets SET picked_up_at = ? WHERE avatar_id = ?`, testNow, avatarID(t, db, "Eve")); err != nil {
		t.Fatal(err)
	}
	wantPage(t, askHelp(mux, eve, "Six", "Sixth"), http.StatusOK, helpSent)
}

func TestBlankAndLongHelpRequestsWriteNothing(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	dora := login(t, db, "Dora")
	for _, c := range []struct{ name, subject, message, want string }{
		{"no subject", "", "Help", helpBlank},
		{"no question", "Help", "", helpBlank},
		{"a subject of spaces", "   ", "Help", helpBlank},
		{"a question of spaces", "Help", " \r\n\t", helpBlank},
		{"51 characters of subject", strings.Repeat("é", 51), "Help", "Result:Your subject may not be longer than 50 characters. Form:true"},
		{"a question past the setting", "Help", strings.Repeat("x", 65536), "Result:Your question may not be longer than 65535 characters. Form:true"},
	} {
		t.Run(c.name, func(t *testing.T) {
			wantPage(t, askHelp(mux, dora, c.subject, c.message), http.StatusUnprocessableEntity, c.want)
		})
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM help_tickets`); n != 0 {
		t.Errorf("refused requests wrote %d tickets", n)
	}

	setSetting(t, db, "help.messageMaxLength", 10)
	wantPage(t, askHelp(mux, dora, "Help", strings.Repeat("x", 11)), http.StatusUnprocessableEntity, "Result:Your question may not be longer than 10 characters. Form:true")
	// The edges go through, and 0, which PHP's empty took for blank, is a subject.
	wantPage(t, askHelp(mux, dora, strings.Repeat("é", 50), strings.Repeat("x", 10)), http.StatusOK, helpSent)
	habbo(t, db, "eve@example.com", "Eve")
	wantPage(t, askHelp(mux, login(t, db, "Eve"), "0", "0"), http.StatusOK, helpSent)
}

func TestCrossSiteHelpRequestsAreRefused(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	r := httptest.NewRequest("POST", "/help", strings.NewReader("subject=Lost&message=Help"))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	r.Header.Set("Sec-Fetch-Site", "cross-site")
	r.AddCookie(login(t, db, "Dora"))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	if rec.Code != http.StatusForbidden {
		t.Errorf("a cross-site request = %d, want 403", rec.Code)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM help_tickets`); n != 0 {
		t.Errorf("%d tickets were written", n)
	}
}
