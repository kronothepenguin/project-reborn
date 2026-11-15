package router

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleHelpPick handles POST /housekeeping/help/{id}/pick. With reply it is Holo's
// Quick Reply, which picks the ticket up if nobody has and opens the alert form. Holo
// did that on a link, and here the picking stays in a POST.
func (r *Router) HandleHelpPick(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	reply := req.PostFormValue("reply") != ""
	if reply {
		allowed, err := r.holds(req, auth.HousekeepingAlerts)
		if err != nil {
			r.fail(w, err)
			return
		}
		if !allowed {
			r.denied(w, req)
			return
		}
	}
	ticket, found, err := r.ticketFromPath(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !found || ticket.ClosedAt.Valid {
		r.refuseHelp(w, req, helpPickInvalid)
		return
	}

	session, _ := auth.FromContext(ctx)
	now := time.Now().UTC()
	var picked int64
	err = r.inTx(ctx, func(q *store.Queries) error {
		var err error
		picked, err = q.PickUpHelpTicket(ctx, store.PickUpHelpTicketParams{
			ID:               ticket.ID,
			PickedUpByUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
			PickedUpAt:       sql.NullTime{Time: now, Valid: true},
		})
		if err != nil || picked == 0 {
			return err
		}
		return writeLog(req, q, ticketLog(actionHelpPick, ticket))
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case reply:
		http.Redirect(w, req, "/housekeeping/alerts?reply="+strconv.FormatInt(ticket.ID, 10), http.StatusSeeOther)
	case picked == 0:
		r.refuseHelp(w, req, helpPickInvalid)
	default:
		http.Redirect(w, req, "/housekeeping/help?picked=1", http.StatusSeeOther)
	}
}
