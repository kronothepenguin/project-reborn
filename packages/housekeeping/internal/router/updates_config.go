package router

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
)

// HandleUpdatesConfigSave handles POST /housekeeping/updates/config: it writes the
// keys a release added to config.json, with the values posted, and drops the
// keys nothing reads. The keys already there stay as they are.
func (r *Router) HandleUpdatesConfigSave(w http.ResponseWriter, req *http.Request) {
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
