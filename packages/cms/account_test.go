package cms

import (
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"
)

func TestAccountSendsGuestsHome(t *testing.T) {
	_, mux := newSite(t)
	wantRedirect(t, serve(mux, "GET", "/account", nil, nil), "/")
	wantRedirect(t, serve(mux, "GET", "/account/looks", nil, nil), "/")
	wantRedirect(t, serve(mux, "POST", "/account/looks", nil, url.Values{"figure": {newFigure}, "gender": {"F"}}), "/")
}

func TestAccountOpensOnLooks(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	wantRedirect(t, serve(mux, "GET", "/account", cookie, nil), "/account/looks")
}

func TestLooksShowsTheHabbo(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK, "account/looks.html", "Figure:"+newFigure, "Gender:F", "ClubDays:0")
}

func TestLooksChanges(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)

	form := url.Values{"figure": {"hd-205-6"}, "gender": {"M"}}
	wantPage(t, serve(mux, "POST", "/account/looks", cookie, form), http.StatusOK, "Result:Account settings updated successfully.", "Failed:false", "Figure:hd-205-6", "Gender:M")
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Figure:hd-205-6")
}

func TestLooksRefusesABadLook(t *testing.T) {
	for _, c := range []struct {
		name string
		form url.Values
		want string
	}{
		{"no gender", url.Values{"figure": {"hd-205-6"}}, "Result:An error occurred. Please try again."},
		{"unknown gender", url.Values{"figure": {"hd-205-6"}, "gender": {"U"}}, "Result:An error occurred. Please try again."},
		{"no figure", url.Values{"gender": {"M"}}, "Result:An error occurred trying to process your request."},
		{"malformed figure", url.Values{"figure": {"not a figure"}, "gender": {"M"}}, "Result:An error occurred trying to process your request."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			cookie, _, _ := member(t, db, mux)

			wantPage(t, serve(mux, "POST", "/account/looks", cookie, c.form), http.StatusUnprocessableEntity, c.want, "Failed:true", "Figure:"+newFigure)
		})
	}
}

// details is what the email and password forms ask for: registration() was born
// on 1 May 1990 with secret123.
func details() url.Values {
	return url.Values{"password": {"secret123"}, "day": {"1"}, "month": {"5"}, "year": {"1990"}}
}

func TestAccountPagesSendGuestsHome(t *testing.T) {
	_, mux := newSite(t)
	for _, path := range []string{"/account/profile", "/account/email", "/account/password", "/account/referral"} {
		wantRedirect(t, serve(mux, "GET", path, nil, nil), "/")
	}
	for _, path := range []string{"/account/profile", "/account/email", "/account/password"} {
		wantRedirect(t, serve(mux, "POST", path, nil, details()), "/")
	}
}

func TestProfileSavesTheMotto(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)

	wantPage(t, serve(mux, "GET", "/account/profile", cookie, nil), http.StatusOK, "account/profile.html", "Motto:}")
	form := url.Values{"motto": {strings.Repeat("a", 32)}}
	wantPage(t, serve(mux, "POST", "/account/profile", cookie, form), http.StatusOK, "Result:Changes saved successfully.", "Failed:false")
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Motto:"+strings.Repeat("a", 32))
}

// The form allows 32 characters while the editor on /me allows 38, as in Holo.
func TestProfileRefusesALongMotto(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	long := strings.Repeat("a", 33)

	wantPage(t, serve(mux, "POST", "/account/profile", cookie, url.Values{"motto": {long}}), http.StatusUnprocessableEntity,
		"Result:Sorry, but the motto you have chosen is too long!", "Failed:true", "Motto:"+long)
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Motto: ")
}

func TestEmailChanges(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)

	form := details()
	form.Set("email", "changed@example.com")
	form.Set("newsletter", "on")
	wantPage(t, serve(mux, "POST", "/account/email", cookie, form), http.StatusOK,
		"Result:Your e-mail address has been changed to changed@example.com", "Failed:false")
	if n := count(t, db, `SELECT COUNT(*) FROM users WHERE email = 'changed@example.com' AND newsletter`); n != 1 {
		t.Errorf("%d users with the new address and the newsletter, want 1", n)
	}
}

func TestEmailPageShowsTheAccount(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	wantPage(t, serve(mux, "GET", "/account/email", cookie, nil), http.StatusOK, "account/email.html", "Email:new@example.com", "Newsletter:false")
}

func TestEmailRefusals(t *testing.T) {
	for _, c := range []struct {
		name   string
		change func(url.Values)
		want   string
	}{
		{"wrong password", func(f url.Values) { f.Set("password", "wrong-one") }, "The given information doesn&#39;t match what we have on record"},
		{"wrong day", func(f url.Values) { f.Set("day", "2") }, "doesn&#39;t match"},
		{"wrong month", func(f url.Values) { f.Set("month", "6") }, "doesn&#39;t match"},
		{"wrong year", func(f url.Values) { f.Set("year", "1991") }, "doesn&#39;t match"},
		{"no birth date", func(f url.Values) { f.Del("day") }, "doesn&#39;t match"},
		{"bad address", func(f url.Values) { f.Set("email", "nope") }, "Invalid e-mail address"},
		{"taken address", func(f url.Values) { f.Set("email", "TAKEN@example.com") }, "This e-mail address already has an account."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			cookie, _, _ := member(t, db, mux)
			habbo(t, db, "taken@example.com", "Taken")
			form := details()
			form.Set("email", "changed@example.com")
			c.change(form)

			wantPage(t, serve(mux, "POST", "/account/email", cookie, form), http.StatusUnprocessableEntity, c.want, "Failed:true")
			if n := count(t, db, `SELECT COUNT(*) FROM users WHERE email = 'new@example.com'`); n != 1 {
				t.Error("a refused change altered the address")
			}
		})
	}
}

func TestPasswordChanges(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)

	form := details()
	form.Set("pass", "brand-new-1")
	form.Set("confpass", "brand-new-1")
	wantPage(t, serve(mux, "POST", "/account/password", cookie, form), http.StatusOK,
		"Result:Your password has been changed successfully. You will need to login again.", "Failed:false")

	wantRedirect(t, serve(mux, "GET", "/me", cookie, nil), "/")
	wantPage(t, serve(mux, "POST", "/", nil, credentials("Newbie", "secret123")), http.StatusUnprocessableEntity, "Invalid username or password.")
	wantRedirect(t, serve(mux, "POST", "/", nil, credentials("Newbie", "brand-new-1")), "/me")
}

func TestPasswordRefusals(t *testing.T) {
	for _, c := range []struct {
		name   string
		change func(url.Values)
		want   string
	}{
		{"wrong password", func(f url.Values) { f.Set("password", "wrong-one") }, "doesn&#39;t match what we have on record"},
		{"wrong birth date", func(f url.Values) { f.Set("year", "1991") }, "doesn&#39;t match what we have on record"},
		{"different passwords", func(f url.Values) { f.Set("confpass", "other-one-2") }, "The passwords don&#39;t match"},
		{"short", func(f url.Values) { f.Set("pass", "short"); f.Set("confpass", "short") }, "Password is too short, 6 characters minimum"},
		{"long", func(f url.Values) { f.Set("pass", strings.Repeat("a", 26)); f.Set("confpass", strings.Repeat("a", 26)) }, "Password is too long, 25 characters maximum"},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			cookie, _, _ := member(t, db, mux)
			form := details()
			form.Set("pass", "brand-new-1")
			form.Set("confpass", "brand-new-1")
			c.change(form)

			wantPage(t, serve(mux, "POST", "/account/password", cookie, form), http.StatusUnprocessableEntity, c.want, "Failed:true")
			wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "me.html")
		})
	}
}

func TestReferralPage(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	setSetting(t, db, "referral.reward", 75)

	wantPage(t, serve(mux, "GET", "/account/referral", cookie, nil), http.StatusOK, "account/referral.html",
		"ReferralLink:http://localhost:17387/register?refer=Newbie", "Reward:75")
}

func TestClubMembersSeeTheirDays(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, userID := member(t, db, mux)
	now := time.Now().UTC()
	_, err := db.ExecContext(t.Context(), `INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
		userID, now.Add(-time.Hour), now.Add(10*24*time.Hour), now)
	if err != nil {
		t.Fatalf("insert subscription: %v", err)
	}
	wantPage(t, serve(mux, "GET", "/account/profile", cookie, nil), http.StatusOK, "ClubDays:10")
}
