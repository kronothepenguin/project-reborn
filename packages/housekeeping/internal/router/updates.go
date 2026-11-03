package router

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const (
	updatesApplied = "The updates were applied. A copy of the database from before them was saved beside it."
	updateFailed   = "Update %s failed: %v. The updates before it were applied, and the copy of the database from before them is %s."
	configSaved    = "config.json was saved. The new values apply when the programs restart."
	configInvalid  = "The value of %s is not a JSON value."
	configRefused  = "config.json was not saved: %v"
)

type updatesPage struct {
	chrome
	Waiting []updateRow
	Applied []updateRow
	NewKeys []configKey
	OldKeys []configKey
	Message string
	Error   string
}

// configKey is a key of config.json as its field shows it: a string as it is,
// and any other value as JSON.
type configKey struct {
	Path  string
	Value string
}

func fieldText(value json.RawMessage) string {
	var text string
	if json.Unmarshal(value, &text) == nil {
		return text
	}
	return string(value)
}

// fieldValue reads the field of a key whose default is def, keeping the type
// the default has: the text itself for a string, a JSON value otherwise.
func fieldValue(def json.RawMessage, text string) (json.RawMessage, bool) {
	var s string
	if json.Unmarshal(def, &s) == nil {
		value, err := json.Marshal(text)
		return value, err == nil
	}
	text = strings.TrimSpace(text)
	return json.RawMessage(text), json.Valid([]byte(text))
}

type updateRow struct {
	Number string
	Title  string
	Date   string
}

func updateNumber(version int64, name string) string {
	return fmt.Sprintf("%04d-%s", version, name)
}

// HandleUpdatesView renders GET /housekeeping/updates, the successor of Holo's
// upgrade.php: what this release brings that the database lacks, and what it
// already received.
func (r *Router) HandleUpdatesView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newUpdatesPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	switch query := req.URL.Query(); {
	case query.Has("applied"):
		page.Message = updatesApplied
	case query.Has("config"):
		page.Message = configSaved
	}
	astro.WriteTemplate(w, r.deps.Resolver, "updates.html", page)
}

func (r *Router) newUpdatesPage(req *http.Request) (updatesPage, error) {
	ctx := req.Context()
	updates, err := store.Updates()
	if err != nil {
		return updatesPage{}, err
	}
	waiting, err := store.WaitingUpdates(ctx, r.deps.DB, updates)
	if err != nil {
		return updatesPage{}, err
	}
	applied, err := store.AppliedUpdates(ctx, r.deps.DB)
	if err != nil {
		return updatesPage{}, err
	}

	missing, unused, err := config.Differences()
	if err != nil {
		return updatesPage{}, err
	}

	page := updatesPage{chrome: r.chrome(req)}
	for _, key := range missing {
		page.NewKeys = append(page.NewKeys, configKey{Path: key.Path, Value: fieldText(key.Value)})
	}
	for _, key := range unused {
		page.OldKeys = append(page.OldKeys, configKey{Path: key.Path, Value: string(key.Value)})
	}
	for _, update := range waiting {
		page.Waiting = append(page.Waiting, updateRow{Number: updateNumber(update.Version, update.Name), Title: update.Title})
	}
	titles := make(map[int64]string, len(updates))
	for _, update := range updates {
		titles[update.Version] = update.Title
	}
	for _, migration := range slices.Backward(applied) {
		page.Applied = append(page.Applied, updateRow{
			Number: updateNumber(migration.Version, migration.Name),
			Title:  titles[migration.Version],
			Date:   migration.AppliedAt.UTC().Format(dateFormat),
		})
	}
	return page, nil
}

// HandleUpdatesApply handles POST /housekeeping/updates. Nothing is applied
// without a copy of the database first, and the run stops at the first update
// that fails, keeping the ones before it.
func (r *Router) HandleUpdatesApply(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	updates, err := store.Updates()
	if err != nil {
		r.fail(w, err)
		return
	}
	waiting, err := store.WaitingUpdates(ctx, r.deps.DB, updates)
	if err != nil {
		r.fail(w, err)
		return
	}
	if len(waiting) == 0 {
		http.Redirect(w, req, "/housekeeping/updates", http.StatusSeeOther)
		return
	}
	backup, err := store.Backup(ctx, r.deps.DB)
	if err != nil {
		r.fail(w, err)
		return
	}

	applied, applyErr := store.ApplyUpdates(ctx, r.deps.DB, waiting)
	var detail []string
	for _, update := range applied {
		detail = append(detail, "applied "+updateNumber(update.Version, update.Name))
	}
	var failed *store.UpdateError
	if errors.As(applyErr, &failed) {
		detail = append(detail, fmt.Sprintf("%s failed: %v", updateNumber(failed.Update.Version, failed.Update.Name), failed.Err))
	}
	detail = append(detail, "copy "+backup)
	if err := writeLog(req, r.deps.Queries, staffLog{action: actionDatabaseUpdate, detail: strings.Join(detail, "; ")}); err != nil {
		r.fail(w, err)
		return
	}

	switch {
	case failed != nil:
		page, err := r.newUpdatesPage(req)
		if err != nil {
			r.fail(w, err)
			return
		}
		page.Error = fmt.Sprintf(updateFailed, updateNumber(failed.Update.Version, failed.Update.Name), failed.Err, backup)
		w.WriteHeader(http.StatusInternalServerError)
		astro.WriteTemplate(w, r.deps.Resolver, "updates.html", page)
	case applyErr != nil:
		r.fail(w, applyErr)
	default:
		http.Redirect(w, req, "/housekeeping/updates?applied=1", http.StatusSeeOther)
	}
}

type updatingPage struct {
	chrome
}

// Updating stands in front of every page but the update page while updates
// wait, because the pages' code may need them: those who may apply them go to
// the update page, and other staff are told that the hotel is being updated.
func (r *Router) Updating(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		waiting, err := r.deps.Updates.Waiting(req.Context())
		if err != nil {
			r.fail(w, err)
			return
		}
		if !waiting {
			next.ServeHTTP(w, req)
			return
		}
		session, _ := auth.FromContext(req.Context())
		attributes, err := auth.Attributes(req.Context(), r.deps.DB, session.UserID)
		if err != nil {
			r.fail(w, err)
			return
		}
		if slices.Contains(attributes, auth.HousekeepingDatabase) || slices.Contains(attributes, auth.HousekeepingAccessGroups) {
			http.Redirect(w, req, "/housekeeping/updates", http.StatusSeeOther)
			return
		}
		w.WriteHeader(http.StatusServiceUnavailable)
		astro.WriteTemplate(w, r.deps.Resolver, "updating.html", updatingPage{chrome: r.chrome(req)})
	})
}

type updateFailedPage struct {
	SiteName string
}

// UpdateFailed answers every page with the update-failed page once an automatic
// update failed at start. It stands outside the session reader, because the
// code may not work on the database the failure left.
func (r *Router) UpdateFailed(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if r.deps.Updates.Failed() == nil {
			next.ServeHTTP(w, req)
			return
		}
		w.WriteHeader(http.StatusServiceUnavailable)
		astro.WriteTemplate(w, r.deps.Resolver, "update-failed.html", updateFailedPage{SiteName: settings.GetString("site.name")})
	})
}

// HandleUpdatesConfig handles POST /housekeeping/updates/config: it writes the
// keys a release added to config.json, with the values posted, and drops the
// keys nothing reads. The keys already there stay as they are.
func (r *Router) HandleUpdatesConfig(w http.ResponseWriter, req *http.Request) {
	missing, unused, err := config.Differences()
	if err != nil {
		r.fail(w, err)
		return
	}
	if len(missing) == 0 && len(unused) == 0 {
		http.Redirect(w, req, "/housekeeping/updates", http.StatusSeeOther)
		return
	}
	values := make(map[string]json.RawMessage, len(missing))
	var added, removed []string
	for _, key := range missing {
		value, ok := fieldValue(key.Value, req.PostFormValue("key."+key.Path))
		if !ok {
			r.refuseConfig(w, req, fmt.Sprintf(configInvalid, key.Path))
			return
		}
		values[key.Path] = value
		added = append(added, key.Path)
	}
	for _, key := range unused {
		removed = append(removed, key.Path)
	}
	if err := config.Rewrite(values); err != nil {
		r.refuseConfig(w, req, fmt.Sprintf(configRefused, err))
		return
	}

	var detail []string
	if len(added) > 0 {
		detail = append(detail, "added "+strings.Join(added, ", "))
	}
	if len(removed) > 0 {
		detail = append(detail, "removed "+strings.Join(removed, ", "))
	}
	if err := writeLog(req, r.deps.Queries, staffLog{action: actionConfigUpdate, detail: strings.Join(detail, "; ")}); err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/housekeeping/updates?config=1", http.StatusSeeOther)
}

func (r *Router) refuseConfig(w http.ResponseWriter, req *http.Request, message string) {
	page, err := r.newUpdatesPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	for i, key := range page.NewKeys {
		if req.PostForm.Has("key." + key.Path) {
			page.NewKeys[i].Value = req.PostFormValue("key." + key.Path)
		}
	}
	page.Error = message
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, "updates.html", page)
}
