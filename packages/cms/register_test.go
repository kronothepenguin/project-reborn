package cms

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const newFigure = "hd-180-1.ch-215-82.lg-270-82"

func registration() url.Values {
	return url.Values{
		"name":            {"Newbie"},
		"password":        {"secret123"},
		"passwordConfirm": {"secret123"},
		"day":             {"1"},
		"month":           {"5"},
		"year":            {"1990"},
		"email":           {"new@example.com"},
		"emailConfirm":    {"new@example.com"},
		"terms":           {"on"},
		"figure":          {newFigure},
		"gender":          {"F"},
	}
}

func count(t *testing.T, db *sql.DB, query string, args ...any) int {
	t.Helper()
	var n int
	if err := db.QueryRowContext(t.Context(), query, args...).Scan(&n); err != nil {
		t.Fatalf("%s: %v", query, err)
	}
	return n
}

func setSetting(t *testing.T, db *sql.DB, key string, value any) {
	t.Helper()
	if err := settings.Set(t.Context(), db, 0, key, value); err != nil {
		t.Fatalf("set %s: %v", key, err)
	}
}

func TestRegisterCreatesTheAccountAndSignsIn(t *testing.T) {
	db, mux := newSite(t)

	rec := serve(mux, "POST", "/register", nil, registration())
	wantRedirect(t, rec, "/me")
	cookie := sessionCookie(rec)
	if cookie == nil {
		t.Fatal("no session cookie")
	}
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "me.html", "Habbo:Newbie", "Figure:"+newFigure)

	q := store.New(db)
	user, err := q.GetUserByEmail(t.Context(), "new@example.com")
	if err != nil {
		t.Fatalf("GetUserByEmail: %v", err)
	}
	want := time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC)
	if !user.BornOn.Equal(want) || user.Newsletter || user.CreatedIP != "192.0.2.1" {
		t.Errorf("user = %+v, want born on %v, no newsletter and the visitor's IP", user, want)
	}
	avatar, err := q.GetAvatarByName(t.Context(), "Newbie")
	if err != nil {
		t.Fatalf("GetAvatarByName: %v", err)
	}
	if avatar.UserID != user.ID || avatar.Figure != newFigure || avatar.Gender != "F" {
		t.Errorf("avatar = %+v, want the registered look", avatar)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM wallets WHERE avatar_id = ? AND credits = 500`, avatar.ID); n != 1 {
		t.Errorf("%d wallets with the start credits, want 1", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM wallet_transactions WHERE avatar_id = ? AND credits = 500 AND reason = 'registration' AND detail = 'Welcome to Holo Hotel!'`, avatar.ID); n != 1 {
		t.Errorf("%d welcome ledger rows, want 1", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM homes JOIN profiles ON homes.profile_id = profiles.id WHERE avatar_id = ?`, avatar.ID); n != 1 {
		t.Errorf("%d homes, want 1", n)
	}
}

func TestRegisterStoresTheNewsletterChoice(t *testing.T) {
	db, mux := newSite(t)
	form := registration()
	form.Set("newsletter", "on")

	wantRedirect(t, serve(mux, "POST", "/register", nil, form), "/me")
	if n := count(t, db, `SELECT COUNT(*) FROM users WHERE newsletter`); n != 1 {
		t.Errorf("%d users with the newsletter, want 1", n)
	}
}

func TestRegisterWithoutStartCreditsWritesNoLedgerRow(t *testing.T) {
	db, mux := newSite(t)
	setSetting(t, db, "registration.startCredits", 0)

	wantRedirect(t, serve(mux, "POST", "/register", nil, registration()), "/me")
	if n := count(t, db, `SELECT COUNT(*) FROM wallets WHERE credits = 0`); n != 1 {
		t.Errorf("%d empty wallets, want 1", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM wallet_transactions`); n != 0 {
		t.Errorf("%d ledger rows, want none", n)
	}
}

func TestRegisterWithoutAFigureUsesTheDefaults(t *testing.T) {
	db, mux := newSite(t)
	setSetting(t, db, "registration.defaultFigure", "hd-205-6")
	setSetting(t, db, "registration.defaultGender", "F")
	form := registration()
	form.Del("figure")
	form.Del("gender")

	wantRedirect(t, serve(mux, "POST", "/register", nil, form), "/me")
	if n := count(t, db, `SELECT COUNT(*) FROM avatars WHERE figure = 'hd-205-6' AND gender = 'F'`); n != 1 {
		t.Errorf("%d habbos with the default look, want 1", n)
	}
}

func TestRegisterRejections(t *testing.T) {
	for _, c := range []struct {
		name   string
		change func(url.Values)
		want   string
	}{
		{"no name", func(f url.Values) { f.Del("name") }, "Please enter a username."},
		{"blank name", func(f url.Values) { f.Set("name", "   ") }, "Please enter a username."},
		{"long name", func(f url.Values) { f.Set("name", strings.Repeat("a", 25)) }, "The name you have chosen is too long."},
		{"invalid name", func(f url.Values) { f.Set("name", "two words") }, "Your username is invalid or contains invalid characters."},
		{"moderator name", func(f url.Values) { f.Set("name", "mod-Newbie") }, "This name is not allowed."},
		{"passwords differ", func(f url.Values) { f.Set("passwordConfirm", "other1234") }, "The passwords do not match. Please try again."},
		{"short password", func(f url.Values) { f.Set("password", "short"); f.Set("passwordConfirm", "short") }, "Your password must be 6 to 25 characters long."},
		{"no birth date", func(f url.Values) { f.Del("day"); f.Del("month"); f.Del("year") }, "Please supply a valid date of birth."},
		{"impossible birth date", func(f url.Values) { f.Set("day", "31"); f.Set("month", "2") }, "Please supply a valid date of birth."},
		{"month out of range", func(f url.Values) { f.Set("month", "13") }, "Please supply a valid date of birth."},
		{"birth date before 1900", func(f url.Values) { f.Set("year", "1899") }, "Please supply a valid date of birth."},
		{"birth date in the future", func(f url.Values) { f.Set("year", "3000") }, "Please supply a valid date of birth."},
		{"malformed email", func(f url.Values) { f.Set("email", "new"); f.Set("emailConfirm", "new") }, "Please supply a valid e-mail address."},
		{"emails differ", func(f url.Values) { f.Set("emailConfirm", "other@example.com") }, "The e-mail addresses don&#39;t match."},
		{"terms not accepted", func(f url.Values) { f.Del("terms") }, "Please read and accept the Terms of Service to register."},
		{"malformed figure", func(f url.Values) { f.Set("figure", "not a figure") }, "An unknown error occurred."},
		{"unknown gender", func(f url.Values) { f.Set("gender", "U") }, "An unknown error occurred."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			form := registration()
			c.change(form)

			rec := serve(mux, "POST", "/register", nil, form)
			wantPage(t, rec, http.StatusUnprocessableEntity, "register.html", c.want)
			if sessionCookie(rec) != nil {
				t.Error("a rejected registration set a cookie")
			}
			if n := count(t, db, `SELECT COUNT(*) FROM users`); n != 0 {
				t.Errorf("%d users after a rejected registration", n)
			}
		})
	}
}

func TestRegisterShowsEveryProblemAtOnce(t *testing.T) {
	_, mux := newSite(t)
	form := registration()
	form.Set("name", "two words")
	form.Del("terms")
	form.Set("emailConfirm", "other@example.com")

	wantPage(t, serve(mux, "POST", "/register", nil, form), http.StatusUnprocessableEntity,
		"Your username is invalid", "Please read and accept", "The e-mail addresses don&#39;t match.")
}

func TestRegisterKeepsWhatWasEntered(t *testing.T) {
	_, mux := newSite(t)
	form := registration()
	form.Del("terms")
	form.Set("newsletter", "on")
	form.Set("editorState", "hr-1-2")

	rec := serve(mux, "POST", "/register", nil, form)
	wantPage(t, rec, http.StatusUnprocessableEntity, "Habbo:Newbie", "Email:new@example.com", "Newsletter:true",
		"Figure:"+newFigure, "Gender:F", "EditorState:hr-1-2", "{Value:5 Label:May Selected:true}", "{Value:1990 Label:1990 Selected:true}")
	if strings.Contains(rec.Body.String(), "secret123") {
		t.Error("the page repeats the password")
	}
}

func TestRegisterRefusesTakenValues(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "taken@example.com", "Taken")

	form := registration()
	form.Set("name", "TAKEN")
	wantPage(t, serve(mux, "POST", "/register", nil, form), http.StatusUnprocessableEntity,
		"This username is in use. Please choose another name.")

	form = registration()
	form.Set("email", "TAKEN@example.com")
	form.Set("emailConfirm", "TAKEN@example.com")
	wantPage(t, serve(mux, "POST", "/register", nil, form), http.StatusUnprocessableEntity,
		"Please sign in and add a habbo there.")

	if n := count(t, db, `SELECT COUNT(*) FROM users`); n != 1 {
		t.Errorf("%d users, want only the first", n)
	}
}

func TestRegisterSameNameAtOnce(t *testing.T) {
	db, mux := newSite(t)

	recs := make([]*httptest.ResponseRecorder, 4)
	var wg sync.WaitGroup
	for i := range recs {
		wg.Go(func() {
			form := registration()
			form.Set("email", "new"+string(rune('a'+i))+"@example.com")
			form.Set("emailConfirm", form.Get("email"))
			recs[i] = serve(mux, "POST", "/register", nil, form)
		})
	}
	wg.Wait()

	created := 0
	for _, rec := range recs {
		switch rec.Code {
		case http.StatusSeeOther:
			created++
		case http.StatusUnprocessableEntity:
			wantPage(t, rec, http.StatusUnprocessableEntity, "This username is in use.")
		default:
			t.Errorf("got %d: %s", rec.Code, rec.Body)
		}
	}
	if created != 1 || count(t, db, `SELECT COUNT(*) FROM users`) != 1 {
		t.Errorf("%d registrations went through and %d users exist, want 1 of each", created, count(t, db, `SELECT COUNT(*) FROM users`))
	}
}

func TestRegisterLimitsAnIP(t *testing.T) {
	db, mux := newSite(t)
	setSetting(t, db, "registration.maxPerIp", 2)
	register := func(name, ip string) *httptest.ResponseRecorder {
		form := registration()
		form.Set("name", name)
		form.Set("email", name+"@example.com")
		form.Set("emailConfirm", name+"@example.com")
		r := httptest.NewRequest("POST", "/register", strings.NewReader(form.Encode()))
		r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		r.RemoteAddr = ip + ":1234"
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, r)
		return rec
	}

	wantRedirect(t, register("first", "192.0.2.7"), "/me")
	wantRedirect(t, register("second", "192.0.2.7"), "/me")
	wantPage(t, register("third", "192.0.2.7"), http.StatusUnprocessableEntity, "Too many habbos were registered")
	wantRedirect(t, register("other", "192.0.2.8"), "/me")

	_, err := db.ExecContext(t.Context(), `UPDATE users SET created_at = ?`, time.Now().UTC().Add(-25*time.Hour))
	if err != nil {
		t.Fatalf("age the users: %v", err)
	}
	wantRedirect(t, register("later", "192.0.2.7"), "/me")
}

func TestRegisterFromABannedIPShowsTheBan(t *testing.T) {
	db, mux := newSite(t)
	_, err := db.ExecContext(t.Context(), `INSERT INTO bans (ip, reason, created_at) VALUES (?, ?, ?)`,
		"192.0.2.1", "Scamming", time.Now().UTC().Add(-time.Minute))
	if err != nil {
		t.Fatalf("insert ban: %v", err)
	}

	rec := serve(mux, "POST", "/register", nil, registration())
	wantPage(t, rec, http.StatusUnprocessableEntity, "index.html", "You have been banned!")
	if sessionCookie(rec) != nil {
		t.Error("a banned visitor got a session")
	}
}

func TestRegisterPageStartsOnTheLookOfTheLandingWidget(t *testing.T) {
	_, mux := newSite(t)

	wantPage(t, serve(mux, "GET", "/register?gender=f&figure="+newFigure, nil, nil), http.StatusOK,
		"register.html", "Figure:"+newFigure, "Gender:F")

	rec := serve(mux, "GET", "/register?gender=f&figure=not+a+figure", nil, nil)
	wantPage(t, rec, http.StatusOK, "register.html", "Figure: Gender: ")
}

func TestRegisterPageHasTheShortNameForItsTitle(t *testing.T) {
	_, mux := newSite(t)
	form := registration()
	form.Del("terms")

	wantPage(t, serve(mux, "GET", "/register", nil, nil), http.StatusOK, "ShortName:Holo")
	wantPage(t, serve(mux, "POST", "/register", nil, form), http.StatusUnprocessableEntity, "ShortName:Holo")
}

func TestRegisterPageOffersTheDates(t *testing.T) {
	_, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/register", nil, nil), http.StatusOK,
		"{Value:31 Label:31 Selected:false}", "{Value:12 Label:December Selected:false}", "{Value:1900 Label:1900 Selected:false}")
}

func TestRegisterSendsSignedInVisitorsToMe(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")

	wantRedirect(t, serve(mux, "GET", "/register", cookie, nil), "/me")
	wantRedirect(t, serve(mux, "POST", "/register", cookie, registration()), "/me")
	if n := count(t, db, `SELECT COUNT(*) FROM users`); n != 1 {
		t.Errorf("%d users, want no new one", n)
	}
}

func TestCheckName(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "taken@example.com", "Taken")
	check := func(body string) *httptest.ResponseRecorder {
		r := httptest.NewRequest("POST", "/register/check-name", strings.NewReader(body))
		r.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, r)
		return rec
	}

	for body, want := range map[string]string{
		`{"name":"Free-1"}`:                    `{"error":""}`,
		`{"name":"  Free-1 "}`:                 `{"error":""}`,
		`{"name":"tAkEn"}`:                     `{"error":"This username is in use. Please choose another name."}`,
		`{"name":""}`:                          `{"error":"Please enter a username."}`,
		`{"name":"two words"}`:                 `{"error":"Your username is invalid or contains invalid characters."}`,
		`{"name":"aaaaaaaaaaaaaaaaaaaaaaaaa"}`: `{"error":"The name you have chosen is too long."}`,
		`{"name":"MOD-Bob"}`:                   `{"error":"This name is not allowed."}`,
	} {
		rec := check(body)
		if rec.Code != http.StatusOK || rec.Body.String() != want {
			t.Errorf("check %s = %d %s, want %s", body, rec.Code, rec.Body, want)
		}
		if got := rec.Header().Get("Content-Type"); got != "application/json" {
			t.Errorf("check %s has Content-Type %q", body, got)
		}
	}

	for name, body := range map[string]string{
		"not JSON": `name=Free`,
		"too long": `{"name":"` + strings.Repeat("a", 2048) + `"}`,
	} {
		if rec := check(body); rec.Code != http.StatusBadRequest {
			t.Errorf("%s: got %d, want 400", name, rec.Code)
		}
	}
}

// referred registers the referrer through the site, so that it has a wallet, and
// returns a form that registers a new user through its link.
func referred(t *testing.T, mux *http.ServeMux) url.Values {
	t.Helper()
	form := registration()
	form.Set("name", "Referrer")
	form.Set("email", "referrer@example.com")
	form.Set("emailConfirm", "referrer@example.com")
	wantRedirect(t, serve(mux, "POST", "/register", nil, form), "/me")

	form = registration()
	form.Set("refer", "Referrer")
	return form
}

func referrerCredits(t *testing.T, db *sql.DB) int {
	t.Helper()
	return count(t, db, `SELECT credits FROM wallets JOIN avatars ON wallets.avatar_id = avatars.id WHERE avatars.name = 'Referrer'`)
}

func TestReferralPaysTheReferrer(t *testing.T) {
	db, mux := newSite(t)
	form := referred(t, mux)
	form.Set("refer", "rEfErReR")

	wantRedirect(t, serve(mux, "POST", "/register", nil, form), "/me")

	if got := referrerCredits(t, db); got != 550 {
		t.Errorf("the referrer has %d credits, want 550", got)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM wallet_transactions WHERE credits = 50 AND reason = 'referral' AND detail = 'Newbie'`); n != 1 {
		t.Errorf("%d referral ledger rows, want 1", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM referrals
		JOIN users ON referred_user_id = users.id
		JOIN avatars ON referrer_avatar_id = avatars.id
		WHERE users.email = 'new@example.com' AND avatars.name = 'Referrer' AND rewarded_at IS NOT NULL`); n != 1 {
		t.Errorf("%d paid referrals of the new user, want 1", n)
	}
}

func TestReferralUsesTheConfiguredReward(t *testing.T) {
	db, mux := newSite(t)
	setSetting(t, db, "referral.reward", 75)

	wantRedirect(t, serve(mux, "POST", "/register", nil, referred(t, mux)), "/me")
	if got := referrerCredits(t, db); got != 575 {
		t.Errorf("the referrer has %d credits, want 575", got)
	}
}

func TestReferralWhileDisabledPaysNothing(t *testing.T) {
	db, mux := newSite(t)
	setSetting(t, db, "referral.enabled", false)

	wantRedirect(t, serve(mux, "POST", "/register", nil, referred(t, mux)), "/me")

	if got := referrerCredits(t, db); got != 500 {
		t.Errorf("the referrer has %d credits, want 500", got)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM wallet_transactions WHERE reason = 'referral'`); n != 0 {
		t.Errorf("%d referral ledger rows, want none", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM referrals WHERE rewarded_at IS NULL`); n != 1 {
		t.Errorf("%d unpaid referrals, want 1", n)
	}
}

func TestReferralOfAnUnknownHabboIsIgnored(t *testing.T) {
	db, mux := newSite(t)
	form := registration()
	form.Set("refer", "Nobody")

	wantRedirect(t, serve(mux, "POST", "/register", nil, form), "/me")
	if n := count(t, db, `SELECT COUNT(*) FROM referrals`); n != 0 {
		t.Errorf("%d referrals, want none", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM users`); n != 1 {
		t.Errorf("%d users, want the registration to go on", n)
	}
}

func TestReferralComesFromTheLinkThroughTheForm(t *testing.T) {
	_, mux := newSite(t)

	wantPage(t, serve(mux, "GET", "/register?refer=Referrer", nil, nil), http.StatusOK, "Refer:Referrer")

	form := registration()
	form.Set("refer", "Referrer")
	form.Del("terms")
	wantPage(t, serve(mux, "POST", "/register", nil, form), http.StatusUnprocessableEntity, "Refer:Referrer")
}

func TestRejectedRegistrationPaysNoReferral(t *testing.T) {
	db, mux := newSite(t)
	form := referred(t, mux)
	form.Del("terms")

	wantPage(t, serve(mux, "POST", "/register", nil, form), http.StatusUnprocessableEntity, "register.html")

	if got := referrerCredits(t, db); got != 500 {
		t.Errorf("the referrer has %d credits, want 500", got)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM referrals`); n != 0 {
		t.Errorf("%d referrals, want none", n)
	}
}

func TestReferralIsPaidOnceForRegistrationsAtOnce(t *testing.T) {
	db, mux := newSite(t)
	base := referred(t, mux)

	var wg sync.WaitGroup
	for i := range 4 {
		wg.Go(func() {
			form := url.Values{}
			for key, values := range base {
				form[key] = values
			}
			form.Set("email", "new"+string(rune('a'+i))+"@example.com")
			form.Set("emailConfirm", form.Get("email"))
			serve(mux, "POST", "/register", nil, form)
		})
	}
	wg.Wait()

	if got := referrerCredits(t, db); got != 550 {
		t.Errorf("the referrer has %d credits, want one reward", got)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM referrals`); n != 1 {
		t.Errorf("%d referrals, want 1", n)
	}
}
