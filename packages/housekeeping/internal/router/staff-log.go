package router

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The actions of staff_logs, listed in the store's staff log entity.
const (
	actionNoteUpdate            = "note.update"
	actionSettingsUpdate        = "settings.update"
	actionGroupsCreate          = "accessGroups.create"
	actionGroupsUpdate          = "accessGroups.update"
	actionGroupsDelete          = "accessGroups.delete"
	actionGroupsAddMember       = "accessGroups.addMember"
	actionGroupsSetDisplayHabbo = "accessGroups.setDisplayHabbo"
	actionGroupsRemoveMember    = "accessGroups.removeMember"
	actionGroupsRefused         = "accessGroups.refused"
	actionHabbosUpdate          = "habbos.update"
	actionUsersUpdate           = "users.update"
	actionUsersRefused          = "users.refused"
	actionCreditsGive           = "credits.give"
	actionBadgesGive            = "badges.give"
	actionBadgesWear            = "badges.wear"
	actionBadgesDelete          = "badges.delete"
)

// staffLog is what a mutation records about itself; the actor, the address and
// the time come from the request. A target of 0 means none.
type staffLog struct {
	action       string
	detail       string
	targetUser   int64
	targetAvatar int64
}

// writeLog writes the staff_logs row of a mutation, and every mutation calls it.
// q is bound to the mutation's transaction when it has one, so that the row and
// the change commit or roll back together.
func writeLog(req *http.Request, q *store.Queries, entry staffLog) error {
	session, _ := auth.FromContext(req.Context())
	return q.CreateStaffLog(req.Context(), store.CreateStaffLogParams{
		UserID:         sql.NullInt64{Int64: session.UserID, Valid: true},
		TargetUserID:   sql.NullInt64{Int64: entry.targetUser, Valid: entry.targetUser != 0},
		TargetAvatarID: sql.NullInt64{Int64: entry.targetAvatar, Valid: entry.targetAvatar != 0},
		Action:         entry.action,
		Detail:         entry.detail,
		IP:             auth.ClientIP(req),
		CreatedAt:      time.Now().UTC(),
	})
}
