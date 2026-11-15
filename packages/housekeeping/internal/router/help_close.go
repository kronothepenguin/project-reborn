package router

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleHelpClose handles POST /housekeeping/help/{id}/close, Holo's delete. The
// ticket stays as history.
func (r *Router) HandleHelpClose(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	ticket, found, err := r.ticketFromPath(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !found {
		r.refuseHelp(w, req, helpCloseInvalid)
		return
	}

	var closed int64
	err = r.inTx(ctx, func(q *store.Queries) error {
		var err error
		closed, err = q.CloseHelpTicket(ctx, store.CloseHelpTicketParams{
			ID:       ticket.ID,
			ClosedAt: sql.NullTime{Time: time.Now().UTC(), Valid: true},
		})
		if err != nil || closed == 0 {
			return err
		}
		return writeLog(req, q, ticketLog(actionHelpClose, ticket))
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case closed == 0:
		r.refuseHelp(w, req, helpCloseInvalid)
	default:
		http.Redirect(w, req, "/housekeeping/help?closed=1", http.StatusSeeOther)
	}
}
