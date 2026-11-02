package router

import (
	"database/sql"
	"net/http"
	"slices"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const helpPerPage = 100

const (
	helpPicked       = "Help query picked up successfully."
	helpPickInvalid  = "Invalid ID specified or already picked up."
	helpClosed       = "Help query closed successfully."
	helpCloseInvalid = "Invalid ID specified or not picked up yet. Please note that all queries must be picked up before they can be closed."
	helpRefreshed    = "Overview refreshed."
)

type helpPage struct {
	chrome
	CanReply bool
	Tickets  []ticketRow
	Older    int
	Newer    int
	Message  string
	Error    string
}

type ticketRow struct {
	ID       int64
	Subject  string
	Date     string
	Habbo    string
	PickedUp bool
}

func (r *Router) newHelpPage(req *http.Request) (helpPage, error) {
	ctx := req.Context()
	page := helpPage{chrome: r.chrome(req)}
	var err error
	if page.CanReply, err = r.holds(req, auth.HousekeepingAlerts); err != nil {
		return page, err
	}
	total, err := r.deps.Queries.CountUnclosedHelpTickets(ctx)
	if err != nil {
		return page, err
	}
	paged := pageOf(req, total, helpPerPage)
	page.Older, page.Newer = paged.older, paged.newer
	tickets, err := r.deps.Queries.ListUnclosedHelpTickets(ctx, store.ListUnclosedHelpTicketsParams{
		RowLimit:  helpPerPage,
		RowOffset: paged.offset,
	})
	if err != nil {
		return page, err
	}
	for _, ticket := range tickets {
		page.Tickets = append(page.Tickets, ticketRow{
			ID:       ticket.ID,
			Subject:  ticket.Subject,
			Date:     ticket.CreatedAt.UTC().Format(dateFormat),
			Habbo:    ticket.Habbo.String,
			PickedUp: ticket.PickedUpAt.Valid,
		})
	}
	return page, nil
}

// HandleHelpView renders GET /housekeeping/help, Holo's Customer Support overview.
func (r *Router) HandleHelpView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newHelpPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	query := req.URL.Query()
	switch {
	case query.Has("picked"):
		page.Message = helpPicked
	case query.Has("closed"):
		page.Message = helpClosed
	case query.Has("refreshed"):
		page.Message = helpRefreshed
	}
	astro.WriteTemplate(w, r.deps.Resolver, "help.html", page)
}

func (r *Router) refuseHelp(w http.ResponseWriter, req *http.Request, message string) {
	page, err := r.newHelpPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, "help.html", page)
}

type ticketPage struct {
	chrome
	Private  bool
	CanReply bool
	ID       int64
	Subject  string
	Asker    string
	IP       string
	Date     string
	Text     string
	PickedUp bool
	Closed   bool
}

// HandleHelpTicketView renders GET /housekeeping/help/{id}, Holo's view of one
// query. A closed ticket stays readable. The address takes
// housekeeping.usersPrivate like any other.
func (r *Router) HandleHelpTicketView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	ticket, err := r.deps.Queries.GetHelpTicket(ctx, id)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	session, _ := auth.FromContext(ctx)
	attributes, err := auth.Attributes(ctx, r.deps.DB, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := ticketPage{
		chrome:   r.chrome(req),
		Private:  slices.Contains(attributes, auth.HousekeepingUsersPrivate),
		CanReply: slices.Contains(attributes, auth.HousekeepingAlerts),
		ID:       ticket.ID,
		Subject:  ticket.Subject,
		Asker:    ticket.Habbo.String,
		Date:     ticket.CreatedAt.UTC().Format(dateFormat),
		Text:     ticket.Message,
		PickedUp: ticket.PickedUpAt.Valid,
		Closed:   ticket.ClosedAt.Valid,
	}
	if page.Private {
		page.IP = ticket.IP
	}
	astro.WriteTemplate(w, r.deps.Resolver, "help/id.html", page)
}

// ticketFromPath reports false for a ticket that does not exist.
func (r *Router) ticketFromPath(req *http.Request) (store.GetHelpTicketRow, bool, error) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		return store.GetHelpTicketRow{}, false, nil
	}
	ticket, err := r.deps.Queries.GetHelpTicket(req.Context(), id)
	if store.IsNotFound(err) {
		return ticket, false, nil
	}
	return ticket, err == nil, err
}

func ticketLog(action string, ticket store.GetHelpTicketRow) staffLog {
	return staffLog{
		action:       action,
		detail:       strconv.FormatInt(ticket.ID, 10),
		targetUser:   ticket.HabboUserID.Int64,
		targetAvatar: ticket.AvatarID.Int64,
	}
}

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
