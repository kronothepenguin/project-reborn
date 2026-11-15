package router

import (
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type settingsBody struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Access      string `json:"access"`
}

// HandleGroupsSettings handles POST /groups/{id}/settings,
// update_group_settings.php: the owner renames the group, rewrites its text and
// changes its type, with Holo's checks in Holo's order. An Unlimited group keeps
// its type, and leaving Exclusive removes the waiting requests at once.
func (r *Router) HandleGroupsSettings(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	group, ok := r.ownedGroup(w, req)
	if !ok {
		return
	}
	var body settingsBody
	if !readEdit(w, req, &body) {
		return
	}
	name := strings.TrimSpace(body.Name)
	description := strings.TrimSpace(body.Description)
	refusal := ""
	switch {
	case group.Access == accessUnlimited && body.Access != accessUnlimited:
		refusal = settingsLocked
	case body.Access != accessRegular && body.Access != accessExclusive && body.Access != accessPrivate && body.Access != accessUnlimited:
		refusal = settingsBadType
	case utf8.RuneCountInString(name) > settings.GetInt("groups.nameMaxLength"):
		refusal = settingsNameLong
	case utf8.RuneCountInString(description) > settings.GetInt("groups.descriptionMaxLength"):
		refusal = settingsDescLong
	case name == "":
		refusal = settingsNameBlank
	}
	if refusal != "" {
		r.answerJSON(w, http.StatusUnprocessableEntity, groupAnswer{Error: refusal})
		return
	}
	err := r.inTx(ctx, func(q *store.Queries) error {
		switch other, err := q.GetGroupByName(ctx, name); {
		case err == nil && other.ID != group.ID:
			refusal = purchaseTakenText
			return nil
		case err != nil && !store.IsNotFound(err):
			return err
		}
		err := q.UpdateGroup(ctx, store.UpdateGroupParams{ID: group.ID, Name: name, Description: description, Access: body.Access, UpdatedAt: time.Now().UTC()})
		if err != nil {
			return err
		}
		if group.Access == accessExclusive && body.Access != accessExclusive {
			return q.DeleteGroupRequests(ctx, group.ID)
		}
		return nil
	})
	switch {
	case store.IsConflict(err):
		r.answerJSON(w, http.StatusUnprocessableEntity, groupAnswer{Error: purchaseTakenText})
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, groupAnswer{Error: refusal})
	default:
		r.answerJSON(w, http.StatusOK, groupAnswer{Message: settingsSaved})
	}
}
