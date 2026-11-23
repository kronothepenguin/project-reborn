package installer

import (
	"encoding/json"
	"html/template"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// jsonData stands in for the built pages: it writes the page data as JSON, so
// that a test can decode the settings step's groups.
func jsonData(name string) (*template.Template, error) {
	return template.New(name).Delims("[[", "]]").Funcs(template.FuncMap{
		"json": func(v any) (template.HTML, error) {
			data, err := json.Marshal(v)
			return template.HTML(data), err
		},
	}).Parse(`[[ json . ]]`)
}

// settingsForms builds the installer both ways, at the site step, with pages
// written as JSON.
var settingsForms = []struct {
	name  string
	build func(t *testing.T) (*Installer, *http.ServeMux)
}{
	{"alone", func(t *testing.T) (*Installer, *http.ServeMux) {
		i, mux := mounted(t, WithResolver(jsonData))
		expect(t, send(t, mux, "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"18400"}}),
			303, "/installer/site", "")
		return i, mux
	}},
	{"inside reborn", func(t *testing.T) (*Installer, *http.ServeMux) {
		i, mux := inReborn(t, &fakeListener{}, WithResolver(jsonData))
		expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"16416"}}),
			303, "/installer/site", "")
		return i, mux
	}},
}

type shownSettings struct {
	Open  []shownGroup
	More  []shownGroup
	Error string
}

type shownGroup struct {
	Title  string
	Fields []shownField
}

type shownField struct {
	Key   string
	Label string
	Help  string
	Kind  string
	Value string
	On    bool
}

// field finds the field of key on the page.
func (p shownSettings) field(t *testing.T, key string) shownField {
	t.Helper()
	for _, g := range slices.Concat(p.Open, p.More) {
		for _, f := range g.Fields {
			if f.Key == key {
				return f
			}
		}
	}
	t.Fatalf("the page shows no field %s", key)
	return shownField{}
}

// form posts every field as the page would: a switch posts 0, then 1 when
// ticked, and a password posts empty.
func (p shownSettings) form() url.Values {
	form := url.Values{}
	for _, g := range slices.Concat(p.Open, p.More) {
		for _, f := range g.Fields {
			switch f.Kind {
			case "switch":
				form.Add(f.Key, "0")
				if f.On {
					form.Add(f.Key, "1")
				}
			case "password":
				form.Set(f.Key, "")
			default:
				form.Set(f.Key, f.Value)
			}
		}
	}
	return form
}

// shown reads the settings step's page.
func shown(t *testing.T, mux http.Handler) shownSettings {
	t.Helper()
	rec := send(t, mux, "GET", "/installer/settings", nil)
	expect(t, rec, 200, "", "")
	var page shownSettings
	if err := json.Unmarshal(rec.Body.Bytes(), &page); err != nil {
		t.Fatalf("decode %s: %v", rec.Body, err)
	}
	return page
}

// changed is form with key set to value; a switch is ticked by "1" and cleared
// by "0".
func changed(form url.Values, key, value string) url.Values {
	out := url.Values{}
	for k, v := range form {
		out[k] = slices.Clone(v)
	}
	if value == "0" || value == "1" {
		if v := out[key]; len(v) > 0 && v[0] == "0" {
			out[key] = []string{"0"}
			if value == "1" {
				out.Add(key, "1")
			}
			return out
		}
	}
	out.Set(key, value)
	return out
}

func queries(i *Installer) *store.Queries {
	installation, _ := i.setup.Current()
	return store.New(installation.DB)
}

// The site step is saved: the settings step follows. It shows six groups open, each field with its current value:
// new players, password reset mail, avatar pictures, site features, prices and game ads. Every other setting is
// folded under "More settings", in housekeeping's groups.
func TestTheSettingsStepFollowsTheSiteStep(t *testing.T) {
	for _, form := range settingsForms {
		t.Run(form.name, func(t *testing.T) {
			i, mux := form.build(t)
			q := queries(i)
			for key, value := range map[string]any{"registration.defaultGender": "F", "mail.password": "hidden", "features.tagFight": false} {
				if err := settings.Set(t.Context(), q, 0, key, value); err != nil {
					t.Fatal(err)
				}
			}

			expect(t, send(t, mux, "POST", "/installer/site", siteForm), 303, "/installer/settings", "")
			page := shown(t, mux)

			open := map[string][]string{}
			var titles []string
			for _, g := range page.Open {
				titles = append(titles, g.Title)
				for _, f := range g.Fields {
					open[g.Title] = append(open[g.Title], f.Key)
				}
			}
			want := map[string][]string{
				"New players":         {"registration.defaultFigure", "registration.defaultGender", "referral.enabled", "referral.reward"},
				"Password reset mail": {"mail.host", "mail.port", "mail.username", "mail.password", "mail.from"},
				"Avatar pictures":     {"imaging.avatarUrl"},
				"Site features": {"recycler.enabled", "features.landingPromo", "features.birthdayNotifications", "features.clientWideScreen",
					"features.clientLoader", "features.tagFight", "features.groupPurchase", "features.staffPage", "features.forum", "features.smilies"},
				"Prices":   {"club.price1Month", "club.price3Months", "club.price6Months", "groups.price"},
				"Game ads": {"game.loadingAdImage", "game.loadingAdLink", "game.roomAdImage", "game.roomAdLink"},
			}
			if !slices.Equal(titles, []string{"New players", "Password reset mail", "Avatar pictures", "Site features", "Prices", "Game ads"}) {
				t.Errorf("open groups %q", titles)
			}
			for title, keys := range want {
				if !slices.Equal(open[title], keys) {
					t.Errorf("%s holds %q, want %q", title, open[title], keys)
				}
			}

			if f := page.field(t, "registration.defaultGender"); f.Kind != "text" || f.Value != "F" || f.Label != "Default Gender" || f.Help != "M or F, for a habbo registered without one." {
				t.Errorf("default gender %+v", f)
			}
			if f := page.field(t, "features.tagFight"); f.Kind != "switch" || f.On {
				t.Errorf("tag fight %+v, want a switch cleared", f)
			}
			if f := page.field(t, "mail.password"); f.Kind != "password" || f.Value != "" {
				t.Errorf("mail password %+v, want an empty password", f)
			}
			if f := page.field(t, "staffPage.box1Body"); f.Kind != "longtext" {
				t.Errorf("staff box %+v, want a long text", f)
			}

			// More settings holds every other field, each under its group's title.
			leftOut := []string{"site.name", "site.shortName", "site.url", "site.housekeepingUrl",
				"registration.startCredits", "auth.secureCookies", "site.maintenance", "game.closed"}
			titleOf := map[string]string{}
			var all []string
			for _, g := range settings.Groups() {
				for _, f := range g.Fields {
					titleOf[f.Key] = g.Title
					if !slices.Contains(leftOut, f.Key) {
						all = append(all, f.Key)
					}
				}
			}
			var seen []string
			for _, keys := range open {
				seen = append(seen, keys...)
			}
			for _, g := range page.More {
				for _, f := range g.Fields {
					if titleOf[f.Key] != g.Title {
						t.Errorf("%s shows under %q, want %q", f.Key, g.Title, titleOf[f.Key])
					}
					seen = append(seen, f.Key)
				}
			}
			slices.Sort(all)
			slices.Sort(seen)
			if !slices.Equal(seen, all) {
				t.Errorf("the page shows %q\nwant %q", seen, all)
			}
		})
	}
}

// The administrator saves the settings step: each changed setting is saved, and the client files step follows.
func TestSavingTheSettingsStepSavesEachChange(t *testing.T) {
	for _, form := range settingsForms {
		t.Run(form.name, func(t *testing.T) {
			i, mux := form.build(t)
			toSettings(t, mux)
			posted := shown(t, mux).form()
			for key, value := range map[string]string{
				"registration.defaultGender": "F",
				"referral.reward":            "75",
				"features.tagFight":          "0",
				"staffPage.box1Color":        "green",
				"staffPage.box1Body":         "Line one\r\nLine two",
				"homes.maxTags":              "30",
				// Both password limits rise: each is saved past the rule that ties them.
				"auth.passwordMinLength": "30",
				"auth.passwordMaxLength": "40",
			} {
				posted = changed(posted, key, value)
			}
			posted.Set("action", "save")

			expect(t, send(t, mux, "POST", "/installer/settings", posted), 303, "/installer/client", "")

			ctx, q := t.Context(), queries(i)
			got := []string{
				settings.String(ctx, q, "registration.defaultGender"),
				strconv.Itoa(settings.Int(ctx, q, "referral.reward")),
				strconv.FormatBool(settings.Bool(ctx, q, "features.tagFight")),
				settings.String(ctx, q, "staffPage.box1Color"),
				settings.String(ctx, q, "staffPage.box1Body"),
				strconv.Itoa(settings.Int(ctx, q, "homes.maxTags")),
				strconv.Itoa(settings.Int(ctx, q, "auth.passwordMinLength")),
				strconv.Itoa(settings.Int(ctx, q, "auth.passwordMaxLength")),
				strconv.FormatBool(settings.Bool(ctx, q, "features.forum")),
			}
			want := []string{"F", "75", "false", "green", "Line one\nLine two", "30", "30", "40", "true"}
			if !slices.Equal(got, want) {
				t.Errorf("saved %q, want %q", got, want)
			}
		})
	}
}

// The mail password shows empty, and an empty value keeps the saved one.
func TestAnEmptyMailPasswordKeepsTheSavedOne(t *testing.T) {
	for _, form := range settingsForms {
		t.Run(form.name, func(t *testing.T) {
			i, mux := form.build(t)
			ctx, q := t.Context(), queries(i)
			if err := settings.Set(ctx, q, 0, "mail.password", "kept"); err != nil {
				t.Fatal(err)
			}
			toSettings(t, mux)
			posted := shown(t, mux).form()
			posted.Set("action", "save")

			expect(t, send(t, mux, "POST", "/installer/settings", posted), 303, "/installer/client", "")
			if got := settings.String(ctx, q, "mail.password"); got != "kept" {
				t.Errorf("mail.password = %q, want the saved one", got)
			}
		})
	}
}

// A value breaks a setting's rule: the form is refused, names the field, and saves nothing.
func TestARefusedSettingSavesNothing(t *testing.T) {
	for _, c := range []struct {
		name  string
		key   string
		value string
		error string
	}{
		{"a value outside its rule", "registration.defaultGender", "X", "Default Gender: must be one of [M F]"},
		{"a number that is no number", "mail.port", "abc", "Mail Port: must be a whole number"},
		{"a rule across two settings", "game.pongTimeoutSeconds", "1", "Ping Timeout: must be longer than game.pingSeconds"},
		{"an empty heading", "staffPage.box1Heading", " ", "Staff Content Box 1 Heading: must not be empty"},
	} {
		for _, form := range settingsForms {
			t.Run(c.name+" "+form.name, func(t *testing.T) {
				i, mux := form.build(t)
				toSettings(t, mux)
				posted := changed(changed(shown(t, mux).form(), "referral.reward", "75"), c.key, c.value)
				posted.Set("action", "save")

				rec := send(t, mux, "POST", "/installer/settings", posted)
				expect(t, rec, 422, "", "")
				var page shownSettings
				if err := json.Unmarshal(rec.Body.Bytes(), &page); err != nil {
					t.Fatal(err)
				}
				if !strings.HasPrefix(page.Error, c.error) {
					t.Errorf("error %q, want it to start with %q", page.Error, c.error)
				}
				if f := page.field(t, c.key); f.Value != c.value {
					t.Errorf("%s shows %q, want what was typed, %q", c.key, f.Value, c.value)
				}
				if got := settings.Int(t.Context(), queries(i), "referral.reward"); got != 50 {
					t.Errorf("referral.reward = %d, want it unsaved", got)
				}
				expect(t, send(t, mux, "GET", "/installer/client", nil), 303, "/installer/settings", "")
			})
		}
	}
}

// The administrator skips the settings step: every setting keeps its value, and the client files step follows.
func TestSkippingTheSettingsStepKeepsEverySetting(t *testing.T) {
	for _, form := range settingsForms {
		t.Run(form.name, func(t *testing.T) {
			i, mux := form.build(t)
			toSettings(t, mux)
			posted := changed(changed(shown(t, mux).form(), "referral.reward", "75"), "mail.password", "new")
			posted.Set("action", "skip")

			expect(t, send(t, mux, "POST", "/installer/settings", posted), 303, "/installer/client", "")
			ctx, q := t.Context(), queries(i)
			if reward, password := settings.Int(ctx, q, "referral.reward"), settings.String(ctx, q, "mail.password"); reward != 50 || password != "" {
				t.Errorf("referral.reward = %d and mail.password = %q, want both kept", reward, password)
			}
		})
	}
}
