package housekeeping

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const (
	notSaved = "Settings not saved."
	blank    = "Please do not leave any fields blank. Settings not saved."
)

func siteForm() url.Values {
	return url.Values{
		"site.name":      {"Reborn Hotel"},
		"site.shortName": {"Reborn"},
		"site.url":       {"https://hotel.example.com"},
	}
}

func TestSettingsTakeTheirAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Helper", auth.HousekeepingAccess)

	wantPage(t, serve(mux, "GET", "/housekeeping/settings", cookie, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", "/housekeeping/settings/site", cookie, siteForm()), http.StatusForbidden, "access-denied.html")

	if got := settings.GetString("site.name"); got != "Holo Hotel" {
		t.Errorf("site.name = %q", got)
	}
	if got := len(staffLogs(t, db)); got != 0 {
		t.Errorf("got %d staff log rows", got)
	}
}

func TestEverySectionHasAForm(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	for section, texts := range map[string][]string{
		"site":         {"Project Reborn Configuration", "Key:site.name Label:Sitename", "Button:Save Configuration"},
		"maintenance":  {"Turn your site on/off", "Key:site.maintenance Label:Close Site", "OnLabel:Site Closed OffLabel:Site Open", "Button:Apply"},
		"auth":         {"Key:auth.sessionIdleMinutes", "Kind:number Value:30"},
		"registration": {"Key:registration.startCredits", "Value:500"},
		"referral":     {"Key:referral.enabled", "OnLabel:Enabled OffLabel:Disabled"},
		"mail":         {"Key:mail.password", "Kind:password"},
		"imaging":      {"Key:imaging.avatarUrl"},
		"features":     {"Manage Content Options", "Key:features.landingPromo", "Button:Save Settings"},
	} {
		t.Run(section, func(t *testing.T) {
			wantPage(t, serve(mux, "GET", "/housekeeping/settings?section="+section, cookie, nil), http.StatusOK, append(texts, "settings.html")...)
		})
	}
}

// The fallback of a key as its label is for a setting declared on another branch,
// so that a merge does not leave it without a form. It should not last.
func TestEverySettingHasARealLabel(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	var pages strings.Builder
	for _, section := range []string{"site", "maintenance", "auth", "registration", "referral", "mail", "imaging", "features"} {
		pages.WriteString(serve(mux, "GET", "/housekeeping/settings?section="+section, cookie, nil).Body.String())
	}
	for _, setting := range settings.Declared() {
		if setting.Key == "housekeeping.note" {
			continue
		}
		if !strings.Contains(pages.String(), "Key:"+setting.Key+" ") {
			t.Errorf("%s has no form", setting.Key)
		}
		if strings.Contains(pages.String(), "Label:"+setting.Key+" ") {
			t.Errorf("%s has its key as its label", setting.Key)
		}
	}
}

func TestSettingsOpenOnTheFirstForm(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	for _, path := range []string{"/housekeeping/settings", "/housekeeping/settings?section=nonsense"} {
		wantPage(t, serve(mux, "GET", path, cookie, nil), http.StatusOK, "Key:site.name Label:Sitename")
	}
}

func TestAnUnknownSectionIsNotFound(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	wantPage(t, serve(mux, "POST", "/housekeeping/settings/nonsense", cookie, siteForm()), http.StatusNotFound)
}

func TestNoFormOffersWhatHasNoPlaceThere(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	body := serve(mux, "GET", "/housekeeping/settings", cookie, nil).Body.String()
	for _, key := range []string{"housekeeping.note", "cms.port", "housekeeping.port", "store.path", "proxy.enabled"} {
		if strings.Contains(body, "Key:"+key) {
			t.Errorf("a form offers %s", key)
		}
	}
}

func TestSavingWritesAndLogs(t *testing.T) {
	db, mux := newSite(t)
	adminID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	rec := serve(mux, "POST", "/housekeeping/settings/site", cookie, siteForm())
	wantRedirect(t, rec, "/housekeeping/settings?saved=1&section=site")

	for key, want := range map[string]string{"site.name": "Reborn Hotel", "site.shortName": "Reborn", "site.url": "https://hotel.example.com"} {
		if got := settings.GetString(key); got != want {
			t.Errorf("%s = %q, want %q", key, got, want)
		}
		row, ok := settingRow(t, db, key)
		if !ok || row.UpdatedByUserID.Int64 != adminID {
			t.Errorf("the row of %s = %+v, %t, want one by the user", key, row, ok)
		}
	}

	logs := staffLogs(t, db)
	if len(logs) != 1 {
		t.Fatalf("got %d staff log rows, want one for the save: %+v", len(logs), logs)
	}
	if got := logs[0]; got.Action != "settings.update" || got.Detail != "site.name, site.shortName, site.url" || got.UserID.Int64 != adminID {
		t.Errorf("the staff log row = %+v", got)
	}

	wantPage(t, serve(mux, "GET", rec.Header().Get("Location"), cookie, nil), http.StatusOK, "Settings saved successfully.", "Value:Reborn Hotel")
}

func TestAPlainPageHasNoMessage(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	body := serve(mux, "GET", "/housekeeping/settings", cookie, nil).Body.String()
	if strings.Contains(body, "Settings saved successfully.") {
		t.Errorf("the page says it saved: %s", body)
	}
}

func TestEveryKindOfFieldSaves(t *testing.T) {
	for _, c := range []struct {
		section string
		key     string
		typed   string
		get     func() any
		want    any
	}{
		{"auth", "auth.loginMaxFailures", "9", func() any { return settings.GetInt("auth.loginMaxFailures") }, 9},
		{"auth", "auth.secureCookies", "0", func() any { return settings.GetBool("auth.secureCookies") }, false},
		{"referral", "referral.enabled", "0", func() any { return settings.GetBool("referral.enabled") }, false},
		{"maintenance", "site.maintenance", "1", func() any { return settings.GetBool("site.maintenance") }, true},
		{"mail", "mail.host", "smtp.example.com", func() any { return settings.GetString("mail.host") }, "smtp.example.com"},
		{"registration", "registration.defaultGender", "F", func() any { return settings.GetString("registration.defaultGender") }, "F"},
		{"imaging", "imaging.avatarUrl", "https://imager.example/avatar", func() any { return settings.GetString("imaging.avatarUrl") }, "https://imager.example/avatar"},
		{"features", "features.landingPromo", "0", func() any { return settings.GetBool("features.landingPromo") }, false},
	} {
		t.Run(c.key, func(t *testing.T) {
			db, mux := newSite(t)
			_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
			rec := serve(mux, "POST", "/housekeeping/settings/"+c.section, cookie, url.Values{c.key: {c.typed}})
			wantRedirect(t, rec, "/housekeeping/settings?saved=1&section="+c.section)
			if got := c.get(); got != c.want {
				t.Errorf("%s = %v, want %v", c.key, got, c.want)
			}
		})
	}
}

func TestAValueBackAtItsDefaultDeletesTheRow(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	serve(mux, "POST", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"1"}})
	if _, ok := settingRow(t, db, "site.maintenance"); !ok {
		t.Fatal("no row for a value that is not the default")
	}
	serve(mux, "POST", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"0"}})
	if row, ok := settingRow(t, db, "site.maintenance"); ok {
		t.Errorf("the row is still there: %+v", row)
	}
	if settings.GetBool("site.maintenance") {
		t.Error("maintenance is still on")
	}
	if got := len(staffLogs(t, db)); got != 2 {
		t.Errorf("got %d staff log rows, want 2", got)
	}
}

func TestSavingTheSameValuesChangesNothing(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	form := url.Values{"site.name": {"Holo Hotel"}, "site.shortName": {"Holo"}, "site.url": {"http://localhost:17387"}}

	wantRedirect(t, serve(mux, "POST", "/housekeeping/settings/site", cookie, form), "/housekeeping/settings?saved=1&section=site")
	if rows, err := store.New(db).ListSettings(t.Context()); err != nil || len(rows) != 0 {
		t.Errorf("rows = %+v, %v, want none", rows, err)
	}
	if got := len(staffLogs(t, db)); got != 0 {
		t.Errorf("got %d staff log rows", got)
	}
}

func TestARefusedFormSavesNothing(t *testing.T) {
	for _, c := range []struct {
		name    string
		section string
		form    url.Values
		want    string
	}{
		{"a blank name", "site", url.Values{"site.name": {""}, "site.shortName": {"Reborn"}}, blank},
		{"a blank short name", "site", url.Values{"site.name": {"Reborn"}, "site.shortName": {""}}, blank},
		{"a blank address", "site", url.Values{"site.name": {"Reborn"}, "site.url": {""}}, blank},
		{"a bad value after good ones", "site", url.Values{"site.name": {"Reborn"}, "site.shortName": {"R"}, "site.url": {"https://hotel.example.com/cms"}}, "site.url: must be an http or https origin"},
		{"a name too long", "site", url.Values{"site.name": {strings.Repeat("x", 31)}, "site.shortName": {"R"}}, "site.name: must be 1 to 30 characters"},
		{"not a number", "auth", url.Values{"auth.rememberDays": {"7"}, "auth.loginMaxFailures": {"many"}}, "Failed Sign-ins must be a number."},
		{"out of range", "auth", url.Values{"auth.rememberDays": {"7"}, "auth.loginMaxFailures": {"0"}}, "auth.loginMaxFailures: must be between 1 and 100"},
		{"a broken rule", "auth", url.Values{"auth.passwordMinLength": {"30"}, "auth.rememberDays": {"7"}}, "auth.passwordMaxLength: must be at least"},
		{"not an address", "mail", url.Values{"mail.host": {"smtp.example.com"}, "mail.from": {"nobody"}}, "mail.from: must be an email address"},
		{"a gender outside the list", "registration", url.Values{"registration.startCredits": {"900"}, "registration.defaultGender": {"U"}}, "registration.defaultGender: must be one of"},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

			rec := serve(mux, "POST", "/housekeeping/settings/"+c.section, cookie, c.form)
			wantPage(t, rec, http.StatusUnprocessableEntity, "settings.html", c.want, notSaved)

			rows, err := store.New(db).ListSettings(t.Context())
			if err != nil || len(rows) != 0 {
				t.Errorf("rows = %+v, %v, want none", rows, err)
			}
			if got := len(staffLogs(t, db)); got != 0 {
				t.Errorf("got %d staff log rows", got)
			}
		})
	}
}

func TestARefusedFormKeepsWhatWasTyped(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	form := url.Values{"site.name": {"Reborn"}, "site.shortName": {""}, "site.url": {"https://typed.example.com"}}
	wantPage(t, serve(mux, "POST", "/housekeeping/settings/site", cookie, form), http.StatusUnprocessableEntity,
		"Value:Reborn", "Value:https://typed.example.com")
}

// Holo built its queries from whatever keys were posted. Here a form reads only
// its own fields.
func TestAFormCannotReachOtherKeys(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	form := siteForm()
	for _, key := range []string{"site.maintenance", "auth.secureCookies", "housekeeping.note", "cms.refresh", "mail.password", "cms.port", "nonsense"} {
		form.Set(key, "1")
	}

	wantRedirect(t, serve(mux, "POST", "/housekeeping/settings/site", cookie, form), "/housekeeping/settings?saved=1&section=site")

	rows, err := store.New(db).ListSettings(t.Context())
	if err != nil {
		t.Fatalf("ListSettings: %v", err)
	}
	if len(rows) != 3 {
		t.Errorf("rows = %+v, want the three of the form", rows)
	}
	if settings.GetBool("site.maintenance") {
		t.Error("a post to the site form closed the site")
	}
}

// settings.Set checks the rule between the password limits on each key, so which
// limit has to be written first depends on where they are going.
func TestThePasswordLimitsMoveTogether(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	limits := func(low, high int) url.Values {
		return url.Values{"auth.passwordMinLength": {fmt.Sprint(low)}, "auth.passwordMaxLength": {fmt.Sprint(high)}}
	}
	for _, c := range [][2]int{{30, 40}, {8, 12}, {6, 25}} {
		rec := serve(mux, "POST", "/housekeeping/settings/auth", cookie, limits(c[0], c[1]))
		wantRedirect(t, rec, "/housekeeping/settings?saved=1&section=auth")
		low, high := settings.GetInt("auth.passwordMinLength"), settings.GetInt("auth.passwordMaxLength")
		if low != c[0] || high != c[1] {
			t.Errorf("the limits are %d and %d, want %d and %d", low, high, c[0], c[1])
		}
	}
}

func TestTheMailPasswordIsMasked(t *testing.T) {
	const password = "hunter2-secret"
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings, auth.HousekeepingLogs)
	mailForm := func(typed string) url.Values {
		return url.Values{"mail.password": {typed}, "mail.host": {"smtp.example.com"}}
	}

	wantRedirect(t, serve(mux, "POST", "/housekeeping/settings/mail", cookie, mailForm(password)), "/housekeeping/settings?saved=1&section=mail")
	if got := settings.GetString("mail.password"); got != password {
		t.Fatalf("mail.password = %q", got)
	}

	refused := serve(mux, "POST", "/housekeeping/settings/mail", cookie, url.Values{"mail.password": {"typed-" + password}, "mail.from": {"nobody"}})
	for name, body := range map[string]string{
		"the form":         serve(mux, "GET", "/housekeeping/settings?section=mail", cookie, nil).Body.String(),
		"the refused form": refused.Body.String(),
		"the log":          serve(mux, "GET", "/housekeeping/logs", cookie, nil).Body.String(),
		"the dashboard":    serve(mux, "GET", "/housekeeping/", cookie, nil).Body.String(),
	} {
		if strings.Contains(body, password) {
			t.Errorf("%s shows the password: %s", name, body)
		}
	}
	for _, row := range staffLogs(t, db) {
		if strings.Contains(row.Detail, password) {
			t.Errorf("the staff log holds the password: %+v", row)
		}
	}

	wantRedirect(t, serve(mux, "POST", "/housekeeping/settings/mail", cookie, mailForm("")), "/housekeeping/settings?saved=1&section=mail")
	if got := settings.GetString("mail.password"); got != password {
		t.Errorf("a blank field changed the password to %q", got)
	}

	form := mailForm("")
	form.Set("mail.password.clear", "on")
	wantRedirect(t, serve(mux, "POST", "/housekeeping/settings/mail", cookie, form), "/housekeeping/settings?saved=1&section=mail")
	if got := settings.GetString("mail.password"); got != "" {
		t.Errorf("clearing left %q", got)
	}
	if row, ok := settingRow(t, db, "mail.password"); ok {
		t.Errorf("the row is still there: %+v", row)
	}
}

func TestACrossOriginSaveChangesNothing(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	wantPage(t, record(mux, postFrom("https://evil.example.com", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"1"}})), http.StatusForbidden)
	if settings.GetBool("site.maintenance") {
		t.Error("a cross-origin post closed the site")
	}
}

// The exit criterion on one process: the settings are shared, so the CMS follows
// at once, in both directions. Alone, a CMS sees the change at its next start.
func TestMaintenanceReachesTheCMSOnASharedMux(t *testing.T) {
	db := openDB(t)
	mux := http.NewServeMux()
	cms.New(db, cms.WithResolver(printPage), cms.WithStatic(printPath("cms"))).Mount(mux)
	New(db, WithResolver(printPage), WithStatic(printPath("housekeeping"))).Mount(mux)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "index.html")

	serve(mux, "POST", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"1"}})
	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusServiceUnavailable, "maintenance.html")
	wantPage(t, serve(mux, "GET", "/register", nil, nil), http.StatusServiceUnavailable, "maintenance.html")
	wantPage(t, serve(mux, "GET", "/housekeeping/settings", cookie, nil), http.StatusOK, "settings.html")

	serve(mux, "POST", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"0"}})
	if row, ok := settingRow(t, db, "site.maintenance"); ok {
		t.Errorf("the row is still there: %+v", row)
	}
	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "index.html")
}

func TestTheChangeOutlivesARestart(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	serve(mux, "POST", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"1"}})

	restarted := http.NewServeMux()
	cms.New(db, cms.WithResolver(printPage), cms.WithStatic(printPath("cms"))).Mount(restarted)
	wantPage(t, serve(restarted, "GET", "/", nil, nil), http.StatusServiceUnavailable, "maintenance.html")
}
