package router

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const alertsPerPage = 100

const (
	alertSent    = "Gave alert to user."
	alertNoHabbo = "This user does not exist."
	alertBlank   = "Please do not leave the alert field blank."
)

type alertsPage struct {
	chrome
	CanBroadcast bool
	Username     string
	Alert        string
	Everyone     string
	Alerts       []alertRow
	Older        int
	Newer        int
	Message      string
	Error        string
}

type alertRow struct {
	ID      int64
	HabboID int64
	Habbo   string
	Alert   string
	Type    string
}

func (r *Router) newAlertsPage(req *http.Request) (alertsPage, error) {
	ctx := req.Context()
	page := alertsPage{chrome: r.chrome(req)}
	var err error
	if page.CanBroadcast, err = r.holds(req, auth.HousekeepingAlertsBroadcast); err != nil {
		return page, err
	}
	total, err := r.deps.Queries.CountActiveAlerts(ctx)
	if err != nil {
		return page, err
	}
	paged := pageOf(req, total, alertsPerPage)
	page.Older, page.Newer = paged.older, paged.newer
	alerts, err := r.deps.Queries.ListActiveAlerts(ctx, store.ListActiveAlertsParams{
		RowLimit:  alertsPerPage,
		RowOffset: paged.offset,
	})
	if err != nil {
		return page, err
	}
	for _, alert := range alerts {
		row := alertRow{ID: alert.ID, HabboID: alert.AvatarID, Habbo: alert.Habbo, Alert: alert.Message, Type: "System Message"}
		if alert.SenderUserID.Valid {
			row.Type = "Staff Message"
		}
		page.Alerts = append(page.Alerts, row)
	}
	return page, nil
}

// HandleAlertsView renders GET /housekeeping/alerts: Holo's alert, mass alert and
// Active Alerts Listing on one page. Holo deleted an alert when it was dismissed, so
// the list shows those not dismissed yet.
func (r *Router) HandleAlertsView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newAlertsPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	query := req.URL.Query()
	if query.Has("sent") {
		page.Message = alertSent
	}
	if processed, err := strconv.ParseInt(query.Get("everyone"), 10, 64); err == nil {
		page.Message = fmt.Sprintf("Gave mass alert. Users processed: %d", processed)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "alerts.html", page)
}

func (r *Router) refuseAlert(w http.ResponseWriter, req *http.Request, form alertsPage, message string) {
	page, err := r.newAlertsPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Username, page.Alert, page.Everyone, page.Error = form.Username, form.Alert, form.Everyone, message
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, "alerts.html", page)
}

// HandleAlertsSend handles POST /housekeeping/alerts, to one habbo or, with
// housekeeping.alertsBroadcast, to everyone.
func (r *Router) HandleAlertsSend(w http.ResponseWriter, req *http.Request) {
	everyone := req.PostFormValue("everyone")
	if req.PostForm.Has("everyone") {
		r.sendToEveryone(w, req, everyone)
		return
	}
	ctx := req.Context()
	form := alertsPage{Username: req.PostFormValue("username"), Alert: req.PostFormValue("alert")}
	avatar, err := r.deps.Queries.GetAvatarByName(ctx, form.Username)
	switch {
	case store.IsNotFound(err) || (err == nil && avatar.ArchivedAt.Valid):
		r.refuseAlert(w, req, form, alertNoHabbo)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	if strings.TrimSpace(form.Alert) == "" {
		r.refuseAlert(w, req, form, alertBlank)
		return
	}

	session, _ := auth.FromContext(ctx)
	err = r.inTx(ctx, func(q *store.Queries) error {
		err := q.CreateAlert(ctx, store.CreateAlertParams{
			AvatarID:     avatar.ID,
			SenderUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
			Message:      form.Alert,
			CreatedAt:    time.Now().UTC(),
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionAlertsSend, targetUser: avatar.UserID, targetAvatar: avatar.ID})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/housekeeping/alerts?sent=1", http.StatusSeeOther)
}

func (r *Router) sendToEveryone(w http.ResponseWriter, req *http.Request, alert string) {
	ctx := req.Context()
	allowed, err := r.holds(req, auth.HousekeepingAlertsBroadcast)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.denied(w, req)
		return
	}
	if strings.TrimSpace(alert) == "" {
		r.refuseAlert(w, req, alertsPage{Everyone: alert}, alertBlank)
		return
	}

	session, _ := auth.FromContext(ctx)
	var processed int64
	err = r.inTx(ctx, func(q *store.Queries) error {
		var err error
		processed, err = q.CreateAlertForEveryone(ctx, store.CreateAlertForEveryoneParams{
			SenderUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
			Message:      alert,
			CreatedAt:    time.Now().UTC(),
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionAlertsBroadcast, detail: strconv.FormatInt(processed, 10)})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/housekeeping/alerts?everyone="+strconv.FormatInt(processed, 10), http.StatusSeeOther)
}
