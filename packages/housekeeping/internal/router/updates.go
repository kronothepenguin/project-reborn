package router

import (
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	updatesApplied = "The updates were applied. A copy of the database from before them was saved beside it."
	updateFailed   = "Update %s failed: %v. The updates before it were applied, and the copy of the database from before them is %s."
)

type updatesPage struct {
	chrome
	Waiting []updateRow
	Applied []updateRow
	Message string
	Error   string
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
	if req.URL.Query().Has("applied") {
		page.Message = updatesApplied
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

	page := updatesPage{chrome: r.chrome(req)}
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
