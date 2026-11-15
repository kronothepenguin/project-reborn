package router

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleBansLift handles POST /housekeeping/bans/{id}/lift, in place of Holo's unban
// tool. The ban stays as history. Level is an action on a user like any other, and a
// ban on an address alone has no user to outrank.
func (r *Router) HandleBansLift(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	ban, err := r.deps.Queries.GetBan(ctx, id)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	if ban.UserID.Valid {
		allowed, err := r.mayActOn(req, "lift a ban", ban.UserID.Int64, 0)
		if err != nil {
			r.fail(w, err)
			return
		}
		if !allowed {
			r.refuseBan(w, req, banForm{}, userAbove)
			return
		}
	}

	session, _ := auth.FromContext(ctx)
	var lifted int64
	err = r.inTx(ctx, func(q *store.Queries) error {
		lifted, err = q.LiftBan(ctx, store.LiftBanParams{
			ID:             id,
			LiftedAt:       sql.NullTime{Time: time.Now().UTC(), Valid: true},
			LiftedByUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
		})
		if err != nil || lifted == 0 {
			return err
		}
		return writeLog(req, q, staffLog{
			action:     actionBansLift,
			detail:     fmt.Sprintf("%d: %s", ban.ID, ban.Reason),
			targetUser: ban.UserID.Int64,
		})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/housekeeping/bans?lifted="+strconv.FormatInt(lifted, 10), http.StatusSeeOther)
}
