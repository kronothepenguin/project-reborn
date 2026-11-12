package housekeeping

import (
	"fmt"
	"html"
	"net/http"
	"net/url"
	"slices"
	"strconv"
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
		"groups":       {"Key:groups.price Label:Group Price", "Kind:number Value:20"},
		"forum":        {"Manage Content Options", "Key:features.forum Label:Forum Enabled", "Button:Save Settings"},
		"club":         {"Key:club.price1Month Label:1 Month Price", "Kind:number Value:20"},
		"creditsPage":  {"Manage Content Options", "Key:creditsPage.box1Body Label:Credits Content Box 1", "Button:Save Settings"},
		"help":         {"Key:help.messageMaxLength Label:Question Length", "Kind:number Value:65535", "Button:Save Settings"},
		"recycler":     {"Menu:Recycler Options Title:Recycler Options Button:Save Settings", "Key:recycler.enabled Label:Enable recycler", "OnLabel:Enabled OffLabel:Disabled", "Key:recycler.minOwnedMinutes Label:Minimum owned time", "Kind:number Value:43200", "Key:recycler.sessionMinutes Label:Session length", "Kind:number Value:60", "Key:recycler.timeoutMinutes Label:Session expire length", "Kind:number Value:10080"},
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
		{"features", "features.tagFight", "0", func() any { return settings.GetBool("features.tagFight") }, false},
		{"staffPage", "features.staffPage", "0", func() any { return settings.GetBool("features.staffPage") }, false},
		{"staffPage", "staffPage.box1Body", "[b]Line one[/b]\r\nLine two", func() any { return settings.GetString("staffPage.box1Body") }, "[b]Line one[/b]\nLine two"},
		{"staffPage", "staffPage.box2Color", "white", func() any { return settings.GetString("staffPage.box2Color") }, "white"},
		{"features", "features.groupPurchase", "0", func() any { return settings.GetBool("features.groupPurchase") }, false},
		{"groups", "groups.maxMembers", "250", func() any { return settings.GetInt("groups.maxMembers") }, 250},
		{"forum", "features.forum", "0", func() any { return settings.GetBool("features.forum") }, false},
		{"forum", "features.smilies", "0", func() any { return settings.GetBool("features.smilies") }, false},
		{"forum", "forum.spamSeconds", "0", func() any { return settings.GetInt("forum.spamSeconds") }, 0},
		{"club", "club.price6Months", "75", func() any { return settings.GetInt("club.price6Months") }, 75},
		{"club", "club.daysPerMonth", "30", func() any { return settings.GetInt("club.daysPerMonth") }, 30},
		{"features", "club.maxMonths", "0", func() any { return settings.GetInt("club.maxMonths") }, 0},
		{"creditsPage", "creditsPage.box2Heading", "Earn credits!", func() any { return settings.GetString("creditsPage.box2Heading") }, "Earn credits!"},
		{"creditsPage", "creditsPage.box2Body", "You need [b]credits[/b]:\r\n* Ask a staff member", func() any { return settings.GetString("creditsPage.box2Body") }, "You need [b]credits[/b]:\n* Ask a staff member"},
		{"homes", "homes.wardrobeSlots", "10", func() any { return settings.GetInt("homes.wardrobeSlots") }, 10},
		{"help", "help.messageMaxLength", "2000", func() any { return settings.GetInt("help.messageMaxLength") }, 2000},
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
		{"a colour outside the list", "staffPage", url.Values{"staffPage.box1Heading": {"Help"}, "staffPage.box1Color": {"orange"}}, "Staff Content Box 1 Color must be one of its choices."},
		{"a blank heading", "staffPage", url.Values{"staffPage.box1Body": {"Text"}, "staffPage.box2Heading": {""}}, blank},
		{"a group name too long to allow", "groups", url.Values{"groups.price": {"30"}, "groups.nameMaxLength": {"101"}}, "groups.nameMaxLength: must be between 1 and 100"},
		{"a spam check too long", "forum", url.Values{"features.forum": {"1"}, "forum.spamSeconds": {"3601"}}, "forum.spamSeconds: must be between 0 and 3600"},
		{"a month longer than 31 days", "club", url.Values{"club.price1Month": {"25"}, "club.daysPerMonth": {"32"}}, "club.daysPerMonth: must be between 1 and 31"},
		{"a month limit below none", "features", url.Values{"features.tagFight": {"0"}, "club.maxMonths": {"-1"}}, "club.maxMonths: must be between 0 and 120"},
		{"a blank credits heading", "creditsPage", url.Values{"creditsPage.box1Body": {"Text"}, "creditsPage.box2Heading": {""}}, blank},
		{"too many wardrobe slots", "homes", url.Values{"homes.maxTags": {"30"}, "homes.wardrobeSlots": {"21"}}, "homes.wardrobeSlots: must be between 1 and 20"},
		{"a question past the forum's limit", "help", url.Values{"help.messageMaxLength": {"65536"}}, "help.messageMaxLength: must be between 1 and 65535"},
		{"a question of no characters", "help", url.Values{"help.messageMaxLength": {"0"}}, "help.messageMaxLength: must be between 1 and 65535"},
		{"a recycler time-out before the session's end", "recycler", url.Values{"recycler.sessionMinutes": {"120"}, "recycler.timeoutMinutes": {"100"}}, "recycler.timeoutMinutes: must be longer than recycler.sessionMinutes"},
		{"a recycler session of no minutes", "recycler", url.Values{"recycler.sessionMinutes": {"0"}}, "recycler.sessionMinutes: must be between 1 and 525600"},
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

// The two staff boxes take the BBCode editor (0092), and no other field does.
func TestTheStaffBoxesTakeTheBBCodeEditor(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	body := serve(mux, "GET", "/housekeeping/settings?section=staffPage", cookie, nil).Body.String()
	at := strings.Index(body, " Section:{ID:staffPage ")
	if at < 0 {
		t.Fatalf("the page is not the staff module's form: %s", body)
	}
	form := body[at:]
	for _, key := range []string{"staffPage.box1Body", "staffPage.box1Color", "staffPage.box1Heading", "staffPage.box2Body", "staffPage.box2Color", "staffPage.box2Heading", "features.staffPage"} {
		start := strings.Index(form, "{Key:"+key+" ")
		mark := strings.Index(form[max(start, 0):], "BBCode:")
		if start < 0 || mark < 0 {
			t.Errorf("no %s with its mark: %s", key, form)
			continue
		}
		want := "BBCode:" + strconv.FormatBool(key == "staffPage.box1Body" || key == "staffPage.box2Body")
		if got := form[start+mark:]; !strings.HasPrefix(got, want) {
			t.Errorf("%s has %.12s, want %s", key, got, want)
		}
	}
}

func TestTheStaffModuleHasHolosFieldsInHolosOrder(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	body := serve(mux, "GET", "/housekeeping/settings?section=staffPage", cookie, nil).Body.String()
	// The menu lists every section with its fields, so the form is read from its
	// own part of the page.
	at := strings.Index(body, " Section:{ID:staffPage ")
	if at < 0 {
		t.Fatalf("the page is not the staff module's form: %s", body)
	}
	form := body[at:]
	order := []string{
		"Key:staffPage.box1Body Label:Staff Content Box 1 ",
		"Key:staffPage.box1Color Label:Staff Content Box 1 Color ",
		"Key:staffPage.box1Heading Label:Staff Content Box 1 Heading ",
		"Key:staffPage.box2Body Label:Staff Content Box 2 ",
		"Key:staffPage.box2Color Label:Staff Content Box 2 Color ",
		"Key:staffPage.box2Heading Label:Staff Content Box 2 Heading ",
		"Key:features.staffPage Label:Staff Module Enabled ",
	}
	last := -1
	for _, text := range order {
		at := strings.Index(form, text)
		if at <= last {
			t.Errorf("%q is missing or out of Holo's order: %s", text, form)
		}
		last = at
	}
	for _, text := range []string{
		"Kind:longtext Value:You can find the staff members all over the hotel",
		"Kind:choice Value:green",
		"{Value:white Label:White (no Header) Selected:false} {Value:green Label:Green Selected:true}",
		"Kind:text Value:Need our help?",
		"Kind:text Value:Joining the Team",
		"Menu:Staff Module",
	} {
		if !strings.Contains(form, html.EscapeString(text)) {
			t.Errorf("the form lacks %q", text)
		}
	}
	if longs, choices := strings.Count(form, "Kind:longtext"), strings.Count(form, "Kind:choice"); longs != 2 || choices != 2 {
		t.Errorf("the form has %d multi-line fields and %d lists, want 2 of each", longs, choices)
	}
}

// Holo's content tool kept the board's two switches in its Discussion Board
// Module, and the group switch in General Options.
func TestTheDiscussionBoardModuleHasHolosFields(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	body := serve(mux, "GET", "/housekeeping/settings?section=forum", cookie, nil).Body.String()
	at := strings.Index(body, " Section:{ID:forum ")
	if at < 0 {
		t.Fatalf("the page is not the board's form: %s", body)
	}
	form := body[at:]
	last := -1
	for _, text := range []string{
		"Menu:Discussion Board Module ",
		"Key:features.forum Label:Forum Enabled ",
		"Key:features.smilies Label:Smilies Enabled ",
		"Key:forum.spamSeconds Label:Spam Check ",
	} {
		at := strings.Index(form, text)
		if at <= last {
			t.Errorf("%q is missing or out of Holo's order: %s", text, form)
		}
		last = at
	}
	if !strings.Contains(form, "Kind:number Value:30") {
		t.Errorf("the spam check is not 30 seconds: %s", form)
	}
	if field := fieldOf(form, "features.forum"); !strings.Contains(field, "Kind:toggle ") || !strings.Contains(field, " On:true ") {
		t.Errorf("the board is not on, as Holo's install left it: %s", field)
	}

	general := serve(mux, "GET", "/housekeeping/settings?section=features", cookie, nil).Body.String()
	general = general[strings.Index(general, " Section:{ID:features "):]
	if strings.Contains(general, "Key:features.smilies") {
		t.Error("Smilies Enabled is still in the general options")
	}
	if !strings.Contains(general, "Key:features.groupPurchase Label:Group Purchasing Enabled ") {
		t.Errorf("the general options lack Group Purchasing Enabled: %s", general)
	}
	if field := fieldOf(general, "features.groupPurchase"); !strings.Contains(field, " On:true ") {
		t.Errorf("buying groups is not on, as Holo's install left it: %s", field)
	}
}

// fieldOf is the printed field of key in form.
func fieldOf(form, key string) string {
	start := strings.Index(form, "{Key:"+key+" ")
	if start < 0 {
		return ""
	}
	return form[start : start+strings.Index(form[start:], "}")]
}

func TestTheGroupsFormHoldsHolosNumbers(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	body := serve(mux, "GET", "/housekeeping/settings?section=groups", cookie, nil).Body.String()
	form := body[strings.Index(body, " Section:{ID:groups "):]
	for key, value := range map[string]string{
		"groups.price":                "20",
		"groups.maxOwned":             "3",
		"groups.maxMemberships":       "10",
		"groups.maxMembers":           "500",
		"groups.nameMaxLength":        "25",
		"groups.descriptionMaxLength": "200",
	} {
		if field := fieldOf(form, key); !strings.Contains(field, "Kind:number Value:"+value+" ") {
			t.Errorf("%s does not hold %s: %q", key, value, field)
		}
	}
}

// Holo's content tool sorted a category by title, so the credits page opens on
// Holo's misspelt Credit Content Box 2 Heading.
func TestTheCreditsPageHasHolosFieldsInHolosOrder(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)

	body := serve(mux, "GET", "/housekeeping/settings?section=creditsPage", cookie, nil).Body.String()
	_, form, ok := strings.Cut(body, " Section:{ID:creditsPage ")
	if !ok {
		t.Fatalf("the page is not the credits page's form: %s", body)
	}
	last := -1
	for _, text := range []string{
		"Menu:Credits Page Title:Manage Content Options ",
		"{Key:creditsPage.box2Heading Label:Credit Content Box 2 Heading Help:The title (heading) of Credit Content Box 2. ",
		"{Key:creditsPage.box1Body Label:Credits Content Box 1 Help:The text within a content box on the credits page. BBCode is allowed here. ",
		"{Key:creditsPage.box1Heading Label:Credits Content Box 1 Heading Help:The title (heading) of Credit Content Box 1. ",
		"{Key:creditsPage.box2Body Label:Credits Content Box 2 Help:The text within a content box on the credits page. BBCode is allowed here. ",
	} {
		at := strings.Index(form, text)
		if at <= last {
			t.Errorf("%q is missing or out of Holo's order: %s", text, form)
		}
		last = at
	}
	for key, want := range map[string]string{
		"creditsPage.box2Heading": " Kind:text Value:Get credits! ",
		"creditsPage.box1Body":    " Kind:longtext Value:" + html.EscapeString("Credits are the hotel's currency. "),
		"creditsPage.box1Heading": " Kind:text Value:What are credits? ",
		"creditsPage.box2Body":    " Kind:longtext Value:To buy furniture or play games, you need [b]credits[/b]. ",
	} {
		field := fieldOf(form, key)
		if !strings.Contains(field, want) {
			t.Errorf("%s = %q, want %q in it", key, field, want)
		}
		if bbcode := strings.HasSuffix(key, "Body"); !strings.HasSuffix(field, " BBCode:"+strconv.FormatBool(bbcode)) {
			t.Errorf("%s does not take BBCode:%t: %q", key, bbcode, field)
		}
	}
}

// Holo wrote the club's prices, its days and the wardrobe's slots in its code,
// and kept the month limit among the General Options of its content tool.
func TestTheClubSettingsHoldHolosNumbers(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	formOf := func(section string) string {
		body := serve(mux, "GET", "/housekeeping/settings?section="+section, cookie, nil).Body.String()
		_, form, ok := strings.Cut(body, " Section:{ID:"+section+" ")
		if !ok {
			t.Fatalf("the page is not the form of %s: %s", section, body)
		}
		return form
	}

	club := formOf("club")
	last := -1
	for _, c := range []struct{ key, label, value string }{
		{"club.price1Month", "1 Month Price", "20"},
		{"club.price3Months", "3 Months Price", "50"},
		{"club.price6Months", "6 Months Price", "80"},
		{"club.daysPerMonth", "Days Per Month", "31"},
	} {
		at := strings.Index(club, "{Key:"+c.key+" Label:"+c.label+" ")
		if at <= last {
			t.Errorf("%s is missing or out of order: %s", c.label, club)
		}
		last = at
		if field := fieldOf(club, c.key); !strings.Contains(field, " Kind:number Value:"+c.value+" ") {
			t.Errorf("%s does not hold %s: %q", c.key, c.value, field)
		}
	}

	general := formOf("features")
	help := html.EscapeString("This will limit the allowed amount of subscribed Club months per user at once to this number. Set to '0' to have no limit.")
	if field := fieldOf(general, "club.maxMonths"); !strings.Contains(field, " Label:HC Months Limit Help:"+help+" Kind:number Value:6 ") {
		t.Errorf("the general options lack Holo's HC Months Limit of 6: %q", field)
	}
	if strings.Index(general, "{Key:features.groupPurchase ") > strings.Index(general, "{Key:club.maxMonths ") {
		t.Errorf("HC Months Limit is not after Group Purchasing Enabled, as Holo sorted them: %s", general)
	}

	if field := fieldOf(formOf("homes"), "homes.wardrobeSlots"); !strings.Contains(field, " Label:Wardrobe Slots ") || !strings.Contains(field, " Kind:number Value:5 ") {
		t.Errorf("the Homes form lacks Holo's 5 wardrobe slots: %q", field)
	}
}

// The Help form holds the longest question of a help request (decision 0109),
// after the Club form, as Groups and Club hold their numbers.
func TestTheHelpFormHoldsTheQuestionLength(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	body := serve(mux, "GET", "/housekeeping/settings?section=help", cookie, nil).Body.String()
	_, form, ok := strings.Cut(body, " Section:{ID:help ")
	if !ok {
		t.Fatalf("the page is not the Help form: %s", body)
	}
	if !strings.HasPrefix(form, "Menu:Help Title:Help Button:Save Settings ") {
		t.Errorf("the Help form is not named Help: %s", form)
	}
	help := html.EscapeString("The most characters in the question of a help request.")
	if field := fieldOf(form, "help.messageMaxLength"); !strings.Contains(field, " Label:Question Length Help:"+help+" Kind:number Value:65535 ") {
		t.Errorf("the Help form lacks Question Length of 65535: %q", field)
	}

	ids := []string{}
	for _, part := range strings.Split(body, "{ID:")[1:] {
		id, _, _ := strings.Cut(part, " ")
		ids = append(ids, id)
	}
	club, helpAt := slices.Index(ids, "club"), slices.Index(ids, "help")
	if club < 0 || helpAt != club+1 {
		t.Errorf("Help does not follow Club in the menu: %v", ids)
	}
}

func TestTheGameFormHoldsTheClientsSettings(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	body := serve(mux, "GET", "/housekeeping/settings?section=game", cookie, nil).Body.String()
	_, form, ok := strings.Cut(body, " Section:{ID:game ")
	if !ok {
		t.Fatalf("the page is not the Game form: %s", body)
	}
	for key, want := range map[string]string{
		"game.clientVersion":        " Label:Client Version ",
		"game.coppa":                " Kind:number Value:0 ",
		"game.dateFormat":           " Kind:text Value:dd-mm-yyyy ",
		"game.trackingHeader":       " Kind:text Value: ",
		"game.pingSeconds":          " Kind:number Value:30 ",
		"game.pongTimeoutSeconds":   " Kind:number Value:90 ",
		"game.maxRoomsPerHabbo":     " Kind:number Value:50 ",
		"game.maxFavouriteRooms":    " Kind:number Value:30 ",
		"game.categoryMaxRooms":     " Kind:number Value:30 ",
		"game.searchMaxRooms":       " Kind:number Value:30 ",
		"game.roomBanMinutes":       " Kind:number Value:15 ",
		"game.chatHistoryDays":      " Kind:number Value:30 ",
		"game.loadingAdImage":       " Kind:text Value: ",
		"game.roomAdLink":           " Kind:text Value: ",
		"game.outboxSize":           " Kind:number Value:500 ",
		"game.chatRange":            " Kind:number Value:5 ",
		"game.chatMaxLength":        " Kind:number Value:100 ",
		"game.maxIgnoredHabbos":     " Kind:number Value:100 ",
		"game.roomEventTypes":       " Kind:number Value:11 ",
		"game.maxSpectators":        " Kind:number Value:50 ",
		"game.maxRoomFurni":         " Kind:number Value:500 ",
		"game.maxStackHeight":       " Kind:number Value:20 ",
		"game.presentNoteMaxLength": " Kind:number Value:200 ",
		"game.postItMaxLength":      " Kind:number Value:684 ",
		"game.maxTradeFurni":        " Kind:number Value:65 ",
	} {
		if field := fieldOf(form, key); !strings.Contains(field, want) {
			t.Errorf("%s lacks %q: %q", key, want, field)
		}
	}
	for key, on := range map[string]bool{"game.vouchers": false, "game.profileEditing": true, "game.tutorial": false} {
		if field := fieldOf(form, key); !strings.Contains(field, "Kind:toggle ") || !strings.Contains(field, fmt.Sprintf(" On:%t ", on)) {
			t.Errorf("%s is not a toggle that is %t: %q", key, on, field)
		}
	}

	ids := []string{}
	for _, part := range strings.Split(body, "{ID:")[1:] {
		id, _, _ := strings.Cut(part, " ")
		ids = append(ids, id)
	}
	help, game := slices.Index(ids, "help"), slices.Index(ids, "game")
	if help < 0 || game != help+1 {
		t.Errorf("Game does not follow Help in the menu: %v", ids)
	}
}

// HoloCMS's Recycler Options is a settings form, after Game (plans/server decision 0119): it saves the recycler's
// settings and writes the staff log as every form does.
func TestRecyclerOptionsSavesTheRecyclersSettings(t *testing.T) {
	db, mux := newSite(t)
	adminID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	body := serve(mux, "GET", "/housekeeping/settings?section=recycler", cookie, nil).Body.String()
	ids := []string{}
	for _, part := range strings.Split(body, "{ID:")[1:] {
		id, _, _ := strings.Cut(part, " ")
		ids = append(ids, id)
	}
	if game, recycler := slices.Index(ids, "game"), slices.Index(ids, "recycler"); game < 0 || recycler != game+1 {
		t.Errorf("Recycler Options does not follow Game in the menu: %v", ids)
	}

	form := url.Values{"recycler.enabled": {"0"}, "recycler.minOwnedMinutes": {"0"}, "recycler.sessionMinutes": {"30"}, "recycler.timeoutMinutes": {"1440"}}
	wantRedirect(t, serve(mux, "POST", "/housekeeping/settings/recycler", cookie, form), "/housekeeping/settings?saved=1&section=recycler")
	if settings.GetBool("recycler.enabled") || settings.GetInt("recycler.minOwnedMinutes") != 0 || settings.GetInt("recycler.sessionMinutes") != 30 || settings.GetInt("recycler.timeoutMinutes") != 1440 {
		t.Errorf("the recycler's settings are %t, %d, %d and %d; want off, 0, 30 and 1440", settings.GetBool("recycler.enabled"),
			settings.GetInt("recycler.minOwnedMinutes"), settings.GetInt("recycler.sessionMinutes"), settings.GetInt("recycler.timeoutMinutes"))
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "settings.update" || logs[0].UserID.Int64 != adminID ||
		logs[0].Detail != "recycler.enabled, recycler.minOwnedMinutes, recycler.sessionMinutes, recycler.timeoutMinutes" {
		t.Errorf("the staff log = %+v, want one row for the recycler's four settings", logs)
	}

	_, plain := staff(t, db, "Clerk", auth.HousekeepingAccess)
	if rec := serve(mux, "POST", "/housekeeping/settings/recycler", plain, url.Values{"recycler.sessionMinutes": {"45"}}); settings.GetInt("recycler.sessionMinutes") != 30 {
		t.Errorf("staff without housekeeping.settings changed the recycler: %d, status %d", settings.GetInt("recycler.sessionMinutes"), rec.Code)
	}
}
