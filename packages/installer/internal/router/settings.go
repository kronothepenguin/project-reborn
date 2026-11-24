package router

import (
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// settingsPage shows the day-one groups open and every other group under
// "More settings".
type settingsPage struct {
	stepper
	Open  []settingsGroup
	More  []settingsGroup
	Error string
}

// settingsGroup is one group of fields. Refused marks the group of the field a
// refused form names, so that its tab opens.
type settingsGroup struct {
	Title   string
	Fields  []settingsField
	Refused bool
}

// settingsField is one setting as the form shows it. Kind is text, longtext,
// number, switch, choice or password. A password shows no value.
type settingsField struct {
	Key      string
	Label    string
	Help     string
	Kind     string
	Value    string
	On       bool
	Required bool
	Choices  []settingsChoice
}

type settingsChoice struct {
	Value    string
	Label    string
	Selected bool
}

type openGroup struct {
	title string
	keys  []string
}

// openGroups are the day-one groups, with the installer's own titles. A key
// whose group it is shows there, in this order.
var openGroups = []openGroup{
	{"New players", []string{"registration.defaultFigure", "registration.defaultGender", "referral.enabled", "referral.reward"}},
	{"Password reset mail", []string{"mail.host", "mail.port", "mail.username", "mail.password", "mail.from"}},
	{"Avatar pictures", []string{"imaging.avatarUrl"}},
	{"Site features", nil},
	{"Prices", []string{"club.price1Month", "club.price3Months", "club.price6Months", "groups.price"}},
	{"Game ads", []string{"game.loadingAdImage", "game.loadingAdLink", "game.roomAdImage", "game.roomAdLink"}},
}

// siteFeatures is the index of "Site features" in openGroups: it holds the
// features.* switches and the recycler's, in housekeeping's order.
const siteFeatures = 3

// openIndex is the index in openGroups of the group that shows f, or -1.
func openIndex(f settings.Field) int {
	if f.Kind == "switch" && (strings.HasPrefix(f.Key, "features.") || f.Key == "recycler.enabled") {
		return siteFeatures
	}
	return slices.IndexFunc(openGroups, func(g openGroup) bool { return slices.Contains(g.keys, f.Key) })
}

// leftOut are the settings the step never shows: the site step's, and the
// switches that close the site and the hotel.
var leftOut = []string{
	"site.name", "site.shortName", "site.url", "site.housekeepingUrl",
	"registration.startCredits", "auth.secureCookies",
	"site.maintenance", "game.closed",
}

// longTexts are the texts of the content groups that take several lines.
var longTexts = []string{
	"staffPage.box1Body", "staffPage.box2Body",
	"creditsPage.box1Body", "creditsPage.box2Body",
}

// settingsView lays the settings out with their current values from q.
func settingsView(req *http.Request, q *store.Queries) (settingsPage, error) {
	declared, err := settings.Declared(req.Context(), q)
	if err != nil {
		return settingsPage{}, err
	}
	byKey := make(map[string]settings.Setting, len(declared))
	for _, s := range declared {
		byKey[s.Key] = s
	}

	page := settingsPage{Open: make([]settingsGroup, len(openGroups))}
	opened := make(map[string]settingsField)
	for i, g := range openGroups {
		page.Open[i].Title = g.title
	}
	for _, g := range settings.Groups() {
		more := settingsGroup{Title: g.Title}
		for _, f := range g.Fields {
			setting, ok := byKey[f.Key]
			if !ok || slices.Contains(leftOut, f.Key) {
				continue
			}
			field := filledField(f, setting)
			switch at := openIndex(f); at {
			case siteFeatures:
				page.Open[at].Fields = append(page.Open[at].Fields, field)
			case -1:
				more.Fields = append(more.Fields, field)
			default:
				opened[f.Key] = field
			}
		}
		if len(more.Fields) > 0 {
			page.More = append(page.More, more)
		}
	}
	for i, g := range openGroups {
		for _, key := range g.keys {
			if field, ok := opened[key]; ok {
				page.Open[i].Fields = append(page.Open[i].Fields, field)
			}
		}
	}
	return page, nil
}

// filledField turns a field of a group into a field of the form, with its value.
func filledField(f settings.Field, setting settings.Setting) settingsField {
	out := settingsField{Key: f.Key, Label: f.Label, Help: f.Help, Kind: f.Kind, Required: f.Required}
	if setting.Secret {
		out.Kind = "password"
		return out
	}
	out.Value = fmt.Sprint(setting.Value)
	switch f.Kind {
	case "switch":
		out.On = setting.Value == true
	case "choice":
		for _, c := range f.Choices {
			out.Choices = append(out.Choices, settingsChoice{Value: c.Value, Label: c.Label, Selected: c.Value == out.Value})
		}
	case "text":
		if slices.Contains(longTexts, f.Key) {
			out.Kind = "longtext"
		}
	}
	return out
}

// fields walks every field of the page.
func (p settingsPage) fields(each func(*settingsField)) {
	for _, groups := range [][]settingsGroup{p.Open, p.More} {
		for g := range groups {
			for f := range groups[g].Fields {
				each(&groups[g].Fields[f])
			}
		}
	}
}

// HandleSettingsView renders GET /installer/settings with the current settings.
func (r *Router) HandleSettingsView(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, "settings")
	if !ok {
		return
	}
	page, err := settingsView(req, store.New(installation.DB))
	if err != nil {
		r.fail(w, err)
		return
	}
	page.stepper = r.stepper()
	astro.WriteTemplate(w, r.deps.Resolver, "settings.html", page)
}

// HandleSettingsSave handles POST /installer/settings: "skip" saves nothing,
// and every other action saves the changed settings together, after
// settings.Validate accepts them all. A refused value saves nothing and shows
// the form again with what was typed.
func (r *Router) HandleSettingsSave(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, "settings")
	if !ok {
		return
	}
	if req.PostFormValue("action") == "skip" {
		r.pass(w, req, "settings")
		return
	}
	ctx, q := req.Context(), store.New(installation.DB)
	page, err := settingsView(req, q)
	if err != nil {
		r.fail(w, err)
		return
	}
	changes, key, problem := settingsChanges(req, q, page)
	if problem == "" {
		if err := settings.Validate(ctx, q, changes); err != nil {
			key, problem = namedProblem(page, err)
		}
	}
	if problem != "" {
		page.fields(func(f *settingsField) { typedInto(f, req.PostForm) })
		page.refuse(key)
		page.Error = problem
		page.stepper = r.stepper()
		r.invalid(w, "settings.html", page)
		return
	}
	if err := r.deps.Setup.SaveSettings(ctx, changes); err != nil {
		r.fail(w, err)
		return
	}
	r.pass(w, req, "settings")
}

// settingsChanges turns the posted fields into typed values, keeping those that
// differ from the current ones, or gives the key of the field that is wrong
// and the problem that names it. A field that was not posted keeps its value,
// and so does an empty password.
func settingsChanges(req *http.Request, q *store.Queries, page settingsPage) (map[string]any, string, string) {
	form := req.PostForm
	changes := make(map[string]any)
	var key, problem string
	page.fields(func(f *settingsField) {
		if problem != "" || !form.Has(f.Key) {
			return
		}
		typed := posted(form, f.Key)
		switch f.Kind {
		case "password":
			if typed != "" && typed != settings.String(req.Context(), q, f.Key) {
				changes[f.Key] = typed
			}
		case "switch":
			if on := typed == "1"; on != f.On {
				changes[f.Key] = on
			}
		case "number":
			number, err := strconv.Atoi(strings.TrimSpace(typed))
			if err != nil {
				key, problem = f.Key, f.Label+": must be a whole number"
				return
			}
			if strconv.Itoa(number) != f.Value {
				changes[f.Key] = number
			}
		default:
			if f.Kind == "longtext" {
				typed = strings.ReplaceAll(typed, "\r\n", "\n")
			}
			if f.Required && strings.TrimSpace(typed) == "" {
				key, problem = f.Key, f.Label+": must not be empty"
				return
			}
			if typed != f.Value {
				changes[f.Key] = typed
			}
		}
	})
	return changes, key, problem
}

// posted is the field's last value: a switch posts a hidden 0 before its box,
// which posts 1 when ticked.
func posted(form url.Values, key string) string {
	values := form[key]
	return values[len(values)-1]
}

// namedProblem gives the key that settings' error starts with,
// "settings: <key>: <reason>", and the problem that names its field.
func namedProblem(page settingsPage, err error) (string, string) {
	message := strings.TrimPrefix(err.Error(), "settings: ")
	key, reason, found := strings.Cut(message, ": ")
	if !found {
		return "", message
	}
	label := key
	page.fields(func(f *settingsField) {
		if f.Key == key {
			label = f.Label
		}
	})
	return key, label + ": " + reason
}

// refuse marks the group that holds the field of key.
func (p settingsPage) refuse(key string) {
	for _, groups := range [][]settingsGroup{p.Open, p.More} {
		for g := range groups {
			if slices.ContainsFunc(groups[g].Fields, func(f settingsField) bool { return f.Key == key }) {
				groups[g].Refused = true
			}
		}
	}
}

// typedInto shows what was typed in a refused form, except a password.
func typedInto(f *settingsField, form url.Values) {
	if !form.Has(f.Key) || f.Kind == "password" {
		return
	}
	typed := posted(form, f.Key)
	switch f.Kind {
	case "switch":
		f.On = typed == "1"
	case "choice":
		for i := range f.Choices {
			f.Choices[i].Selected = f.Choices[i].Value == typed
		}
	default:
		f.Value = typed
	}
}
