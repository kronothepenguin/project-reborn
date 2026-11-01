package router

import (
	"context"
	"maps"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
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
}

// HandleSettingsView renders GET /housekeeping/settings. An unknown section shows
// the first form, as Holo's content tool fell back to its first category.
func (r *Router) HandleSettingsView(w http.ResponseWriter, req *http.Request) {
	sections := sectionsOver(settings.Declared())
	current, ok := findSection(sections, req.URL.Query().Get("section"))
	if !ok {
		current = sections[0]
	}
	page := settingsPage{chrome: r.chrome(req), Section: current}
	if req.URL.Query().Has("saved") {
		page.Message = settingsSaved
	}
	astro.WriteTemplate(w, r.deps.Resolver, "settings.html", page)
}

// HandleSettingsSave handles POST /housekeeping/settings/{section}. It reads only
// the fields of that section, so a form can never reach another key, and it saves
// all of them or none, as Holo's forms did.
func (r *Router) HandleSettingsSave(w http.ResponseWriter, req *http.Request) {
	current, ok := findSection(sectionsOver(settings.Declared()), req.PathValue("section"))
	if !ok {
		http.NotFound(w, req)
		return
	}
	if err := req.ParseForm(); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	changes, problem := readChanges(current, req.PostForm)
	if problem == "" {
		if err := settings.Validate(changes); err != nil {
			problem = strings.TrimPrefix(err.Error(), "settings: ") + ". " + settingsNotSaved
		}
	}
	if problem != "" {
		w.WriteHeader(http.StatusUnprocessableEntity)
		astro.WriteTemplate(w, r.deps.Resolver, "settings.html", settingsPage{
			chrome:  r.chrome(req),
			Section: withTyped(current, req.PostForm),
			Error:   problem,
		})
		return
	}

	if len(changes) > 0 {
		keys := slices.Sorted(maps.Keys(changes))
		// settings.Set cannot join a transaction, so the row goes first: a failed
		// write then leaves a row for nothing, never a change without a row. The
		// values stay out of the row, because they can be secrets.
		entry := staffLog{action: actionSettingsUpdate, detail: strings.Join(keys, ", ")}
		if err := writeLog(req, r.deps.Queries, entry); err != nil {
			r.fail(w, err)
			return
		}
		session, _ := auth.FromContext(req.Context())
		if err := r.setAll(req.Context(), session.UserID, keys, changes); err != nil {
			r.fail(w, err)
			return
		}
	}

	query := url.Values{"section": {current.ID}, "saved": {"1"}}
	http.Redirect(w, req, "/housekeeping/settings?"+query.Encode(), http.StatusSeeOther)
}

// readChanges turns the posted fields of s into typed values, keeping those that
// differ from the current ones, or says what is wrong with them. A field that was
// not posted stays as it is.
func readChanges(s section, form url.Values) (map[string]any, string) {
	changes := make(map[string]any)
	for _, f := range s.Fields {
		if f.Kind == kindPassword {
			switch typed := form.Get(f.Key); {
			case form.Has(clearField(f.Key)):
				if settings.GetString(f.Key) != "" {
					changes[f.Key] = ""
				}
			case typed != "" && typed != settings.GetString(f.Key):
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
func (r *Router) setAll(ctx context.Context, userID int64, keys []string, values map[string]any) error {
	for len(keys) > 0 {
		var refused []string
		var last error
		for _, key := range keys {
			if err := settings.Set(ctx, r.deps.DB, userID, key, values[key]); err != nil {
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
