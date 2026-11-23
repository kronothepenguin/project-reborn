package router

import (
	"cmp"
	"context"
	"fmt"
	"maps"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	settingsSaved    = "Settings saved successfully."
	settingsNotSaved = "Settings not saved."
	settingsBlank    = "Please do not leave any fields blank. " + settingsNotSaved
)

type settingsPage struct {
	chrome
	Section section
	Message string
	Error   string
	// Hotel says whether the game runs, on the form of the hotel's switch alone.
	Hotel string
}

// hotelSection is the form of the hotel's switch.
const hotelSection = "hotel"

// switches close the game's doors while either is on. The game reads them when
// it starts.
var switches = []string{"site.maintenance", "game.closed"}

// switchTimeout is how long the game has to start or stop. A stop holds the
// players' connections for 5 seconds.
const switchTimeout = 15 * time.Second

// HandleSettingsView renders GET /housekeeping/settings. An unknown section shows
// the first form, as Holo's content tool fell back to its first category.
func (r *Router) HandleSettingsView(w http.ResponseWriter, req *http.Request) {
	sections, err := r.sections(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	current, ok := findSection(sections, req.URL.Query().Get("section"))
	if !ok {
		current = sections[0]
	}
	page := settingsPage{chrome: r.chrome(req), Section: current, Hotel: r.hotelLine(req.Context(), current)}
	if req.URL.Query().Has("saved") {
		page.Message = settingsSaved
	}
	astro.WriteTemplate(w, r.deps.Resolver, "settings.html", page)
}

// HandleSettingsSave handles POST /housekeeping/settings/{section}. It reads only
// the fields of that section, so a form can never reach another key, and it saves
// all of them or none, as Holo's forms did.
func (r *Router) HandleSettingsSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	sections, err := r.sections(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	current, ok := findSection(sections, req.PathValue("section"))
	if !ok {
		http.NotFound(w, req)
		return
	}
	if err := req.ParseForm(); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	changes, problem := readChanges(ctx, r.deps.Queries, current, req.PostForm)
	if problem == "" {
		if err := settings.Validate(ctx, r.deps.Queries, changes); err != nil {
			problem = strings.TrimPrefix(err.Error(), "settings: ") + ". " + settingsNotSaved
		}
	}
	if problem != "" {
		w.WriteHeader(http.StatusUnprocessableEntity)
		astro.WriteTemplate(w, r.deps.Resolver, "settings.html", settingsPage{
			chrome:  r.chrome(req),
			Section: withTyped(current, req.PostForm),
			Error:   problem,
			Hotel:   r.hotelLine(ctx, current),
		})
		return
	}

	if len(changes) > 0 {
		keys := slices.Sorted(maps.Keys(changes))
		// The log row and the values commit together. The values stay out of the
		// row, because they can be secrets.
		entry := staffLog{action: actionSettingsUpdate, detail: strings.Join(keys, ", ")}
		session, _ := auth.FromContext(ctx)
		err := r.inTx(ctx, func(q *store.Queries) error {
			if err := writeLog(req, q, entry); err != nil {
				return err
			}
			return setAll(ctx, q, session.UserID, keys, changes)
		})
		if err != nil {
			r.fail(w, err)
			return
		}
		r.followSwitches(ctx, changes)
	}

	query := url.Values{"section": {current.ID}, "saved": {"1"}}
	http.Redirect(w, req, "/housekeeping/settings?"+query.Encode(), http.StatusSeeOther)
}

// hotelLine says whether the game runs and how many habbos are inside, on the
// form of the hotel's switch. Other forms get no line.
func (r *Router) hotelLine(ctx context.Context, s section) string {
	if s.ID != hotelSection {
		return ""
	}
	status, ok := r.hotelStatus(ctx)
	switch {
	case !ok:
		return "The game server gives no answer."
	case !status.Running:
		return "The game server is stopped."
	case status.Online == 1:
		return "The game server is running, with 1 habbo inside."
	default:
		return fmt.Sprintf("The game server is running, with %d habbos inside.", status.Online)
	}
}

// followSwitches stops the game when a saved change closed one of the switches,
// and starts it when one opened. The game keeps its doors closed while either
// switch is still on. The call has a context of its own, so an abandoned request
// still reaches the game. The result goes to gameAnswered, and the save stands: the game
// reads the switches when it next starts.
func (r *Router) followSwitches(ctx context.Context, changes map[string]any) {
	if r.deps.Hotel == nil {
		return
	}
	var closed, opened bool
	for _, key := range switches {
		if on, ok := changes[key].(bool); ok {
			closed, opened = closed || on, opened || !on
		}
	}
	if !closed && !opened {
		return
	}
	ctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), switchTimeout)
	defer cancel()
	if closed {
		r.gameAnswered("hotel stop", r.deps.Hotel.Stop(ctx))
		return
	}
	r.gameAnswered("hotel start", r.deps.Hotel.Start(ctx))
}

// readChanges turns the posted fields of s into typed values, keeping those that
// differ from the current ones, or says what is wrong with them. A field that was
// not posted stays as it is. A password is compared with its value in q, because
// s holds none.
func readChanges(ctx context.Context, q *store.Queries, s section, form url.Values) (map[string]any, string) {
	changes := make(map[string]any)
	for _, f := range s.Fields {
		if f.Kind == kindPassword {
			switch typed := form.Get(f.Key); {
			case form.Has(clearField(f.Key)):
				if settings.String(ctx, q, f.Key) != "" {
					changes[f.Key] = ""
				}
			case typed != "" && typed != settings.String(ctx, q, f.Key):
				changes[f.Key] = typed
			}
			continue
		}
		if !form.Has(f.Key) {
			continue
		}
		typed := form.Get(f.Key)
		switch f.Kind {
		case kindToggle:
			if on := typed == "1"; on != f.On {
				changes[f.Key] = on
			}
		case kindChoice:
			if !slices.ContainsFunc(f.Choices, func(c choice) bool { return c.Value == typed }) {
				return nil, f.Label + " must be one of its choices. " + settingsNotSaved
			}
			if typed != f.Value {
				changes[f.Key] = typed
			}
		case kindLongText:
			typed = strings.ReplaceAll(typed, "\r\n", "\n")
			if f.Required && strings.TrimSpace(typed) == "" {
				return nil, settingsBlank
			}
			if typed != f.Value {
				changes[f.Key] = typed
			}
		case kindNumber:
			number, err := strconv.Atoi(typed)
			if err != nil {
				return nil, f.Label + " must be a number. " + settingsNotSaved
			}
			if typed != f.Value {
				changes[f.Key] = number
			}
		default:
			if f.Required && typed == "" {
				return nil, settingsBlank
			}
			if typed != f.Value {
				changes[f.Key] = typed
			}
		}
	}
	return changes, ""
}

// clearField names the checkbox that empties a password, whose blank field keeps
// the current one.
func clearField(key string) string {
	return key + ".clear"
}

// withTyped shows a refused form with what was typed, except a password.
func withTyped(s section, form url.Values) section {
	fields := slices.Clone(s.Fields)
	for i, f := range fields {
		if !form.Has(f.Key) || f.Kind == kindPassword {
			continue
		}
		fields[i].Value = form.Get(f.Key)
		fields[i].On = form.Get(f.Key) == "1"
	}
	s.Fields = fields
	return s
}

// setAll writes keys one at a time, as settings.Set does. A rule across two keys
// can refuse the first of them until the second is written, as the password limits
// do when both rise, so a refused key waits for the others. Validate passed, so a
// round that writes nothing is a real failure.
func setAll(ctx context.Context, q *store.Queries, userID int64, keys []string, values map[string]any) error {
	for len(keys) > 0 {
		var refused []string
		var last error
		for _, key := range keys {
			if err := settings.Set(ctx, q, userID, key, values[key]); err != nil {
				refused, last = append(refused, key), err
			}
		}
		if len(refused) == len(keys) {
			return last
		}
		keys = refused
	}
	return nil
}

const (
	kindText     = "text"
	kindLongText = "longtext"
	kindChoice   = "choice"
	kindNumber   = "number"
	kindToggle   = "toggle"
	kindPassword = "password"
)

// section is one settings form, over one group of settings.Groups(). Forms have
// Holo's texts where Holo had the form.
type section struct {
	ID     string
	Menu   string
	Title  string
	Button string
	// Help says what the whole form is for.
	Help string
	// Content puts the form in the menu's Content Management box.
	Content bool
	Fields  []field
}

type field struct {
	Key      string
	Label    string
	Help     string
	Kind     string
	Value    string
	On       bool
	OnLabel  string
	OffLabel string
	Required bool
	// Long makes a text field multi-line, sized as Holo's content tool sized it.
	Long    bool
	Rows    int
	Choices []choice
	// BBCode gives a long text the BBCode editor (decision holo-port/0092).
	BBCode bool
}

type choice struct {
	Value    string
	Label    string
	Selected bool
}

const defaultButton = "Save Settings"

// page holds housekeeping's own texts of a form: Holo's page title, menu name
// and button, and the form's help. An empty text takes the group's title, or
// the default button.
type page struct {
	Menu    string
	Title   string
	Button  string
	Help    string
	Content bool
}

// pages gives each group's form its texts, by the group's id.
var pages = map[string]page{
	"site":        {Menu: "General Configuration", Title: "Project Reborn Configuration", Button: "Save Configuration"},
	"maintenance": {Button: "Apply"},
	hotelSection:  {Button: "Apply"},
	"mail":        {Help: "The mail server that sends 'Forgot your password?' links. The minimail needs none."},
	"features":    {Title: "Manage Content Options", Content: true},
	"staffPage":   {Title: "Manage Content Options", Content: true},
	"creditsPage": {Title: "Manage Content Options", Content: true},
	"forum":       {Title: "Manage Content Options", Content: true},
}

// inputs gives a field what housekeeping draws its own way, by key: the words
// of a switch, and a multi-line text with the BBCode editor.
var inputs = map[string]field{
	"site.maintenance":     {OnLabel: "Site Closed", OffLabel: "Site Open"},
	"game.closed":          {OnLabel: "Hotel Closed", OffLabel: "Hotel Open"},
	"staffPage.box1Body":   {Long: true, BBCode: true},
	"staffPage.box2Body":   {Long: true, BBCode: true},
	"creditsPage.box1Body": {Long: true, BBCode: true},
	"creditsPage.box2Body": {Long: true, BBCode: true},
}

// sectionsOver lays the groups of settings.Groups() out as forms, with the
// values of declared. A secret stays masked, because declared holds no value
// for it.
func sectionsOver(declared []settings.Setting) []section {
	byKey := make(map[string]settings.Setting, len(declared))
	for _, setting := range declared {
		byKey[setting.Key] = setting
	}

	groups := settings.Groups()
	sections := make([]section, 0, len(groups))
	for _, g := range groups {
		p := pages[g.ID]
		s := section{
			ID:      g.ID,
			Menu:    cmp.Or(p.Menu, g.Title),
			Title:   cmp.Or(p.Title, g.Title),
			Button:  cmp.Or(p.Button, defaultButton),
			Help:    p.Help,
			Content: p.Content,
		}
		for _, f := range g.Fields {
			setting, ok := byKey[f.Key]
			if !ok {
				continue
			}
			s.Fields = append(s.Fields, filled(f, setting))
		}
		sections = append(sections, s)
	}
	return sections
}

// filled turns a field of a group into a field of a form, with its value.
func filled(f settings.Field, setting settings.Setting) field {
	out := inputs[f.Key]
	out.Key, out.Label, out.Help, out.Required = f.Key, f.Label, f.Help, f.Required
	if setting.Secret {
		out.Kind = kindPassword
		return out
	}
	value := fmt.Sprint(setting.Value)
	switch f.Kind {
	case "switch":
		out.Kind, out.On = kindToggle, setting.Value == true
		if out.OnLabel == "" {
			out.OnLabel, out.OffLabel = "Enabled", "Disabled"
		}
	case "number":
		out.Kind, out.Value = kindNumber, value
	case "choice":
		out.Kind, out.Value = kindChoice, value
		for _, c := range f.Choices {
			out.Choices = append(out.Choices, choice{Value: c.Value, Label: c.Label, Selected: c.Value == value})
		}
	default:
		out.Kind, out.Value = kindText, value
		if out.Long {
			out.Kind, out.Rows = kindLongText, min(max((utf8.RuneCountInString(value)+59)/60, 2), 10)
		}
	}
	return out
}

// sections lays out the declared settings, with their current values, as forms.
func (r *Router) sections(ctx context.Context) ([]section, error) {
	declared, err := settings.Declared(ctx, r.deps.Queries)
	if err != nil {
		return nil, err
	}
	return sectionsOver(declared), nil
}

func findSection(sections []section, id string) (section, bool) {
	at := slices.IndexFunc(sections, func(s section) bool { return s.ID == id })
	if at < 0 {
		return section{}, false
	}
	return sections[at], true
}
