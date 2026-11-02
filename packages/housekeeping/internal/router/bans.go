package router

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/netip"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const bansPerPage = 100

const (
	banUserMissing   = "Sorry, but this user does not exist!"
	banLengthInvalid = "Invalid ban length!"
	banIPInvalid     = "Invalid IP Address"
)

// banLength is an option of Holo's form. Holo added the numbers by hand, and got
// the ends of days and months wrong.
type banLength struct {
	Value  string
	Label  string
	years  int
	months int
	days   int
	hours  time.Duration
}

func (l banLength) after(now time.Time) time.Time {
	return now.AddDate(l.years, l.months, l.days).Add(l.hours)
}

// Permanent is Holo's 25 years, with a real date, as its form says.
var banLengths = []banLength{
	{Value: "2h", Label: "2 Hours", hours: 2 * time.Hour},
	{Value: "4h", Label: "4 Hours", hours: 4 * time.Hour},
	{Value: "12h", Label: "12 Hours", hours: 12 * time.Hour},
	{Value: "1d", Label: "24 Hours", days: 1},
	{Value: "2d", Label: "2 Days", days: 2},
	{Value: "7d", Label: "7 Days", days: 7},
	{Value: "2w", Label: "2 Weeks", days: 14},
	{Value: "1m", Label: "1 Month", months: 1},
	{Value: "6m", Label: "6 Months", months: 6},
	{Value: "1y", Label: "1 Year", years: 1},
	{Value: "perm", Label: "Permenantly (25 Years)", years: 25},
}

type banForm struct {
	User   string
	Reason string
	IP     string
	Length string
}

type bansPage struct {
	chrome
	Form    banForm
	Lengths []lengthOption
	Bans    []banRow
	Older   int
	Newer   int
	Message string
	Error   string
}

type lengthOption struct {
	Value    string
	Label    string
	Selected bool
}

type banRow struct {
	ID      int64
	UserID  int64
	Habbo   string
	Reason  string
	Expires string
	IP      string
}

func (r *Router) newBansPage(req *http.Request, form banForm) (bansPage, error) {
	ctx := req.Context()
	page := bansPage{chrome: r.chrome(req), Form: form}
	for _, length := range banLengths {
		page.Lengths = append(page.Lengths, lengthOption{
			Value:    length.Value,
			Label:    length.Label,
			Selected: length.Value == form.Length,
		})
	}
	now := time.Now().UTC()
	total, err := r.deps.Queries.CountActiveBans(ctx, now)
	if err != nil {
		return page, err
	}
	paged := pageOf(req, total, bansPerPage)
	page.Older, page.Newer = paged.older, paged.newer
	bans, err := r.deps.Queries.ListActiveBans(ctx, store.ListActiveBansParams{
		Now:       now,
		RowLimit:  bansPerPage,
		RowOffset: paged.offset,
	})
	if err != nil {
		return page, err
	}
	for _, ban := range bans {
		row := banRow{ID: ban.ID, UserID: ban.UserID.Int64, Habbo: ban.Habbo, Reason: ban.Reason, IP: ban.IP.String}
		if ban.ExpiresAt.Valid {
			row.Expires = ban.ExpiresAt.Time.UTC().Format(dateFormat)
		}
		page.Bans = append(page.Bans, row)
	}
	return page, nil
}

// HandleBansView renders GET /housekeeping/bans: Holo's ban tool and its Active Ban
// Listing, with the Lift button in place of its unban tool. ?user= fills the form,
// from the page of a habbo.
func (r *Router) HandleBansView(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	page, err := r.newBansPage(req, banForm{User: query.Get("user")})
	if err != nil {
		r.fail(w, err)
		return
	}
	if page.Message, err = r.banMessage(req); err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "bans.html", page)
}

// banMessage is what a change says once it has redirected here. It reads the ban,
// so that a link cannot put words on the page.
func (r *Router) banMessage(req *http.Request) (string, error) {
	ctx := req.Context()
	query := req.URL.Query()
	if lifted, err := strconv.ParseInt(query.Get("lifted"), 10, 64); err == nil {
		return fmt.Sprintf("Operation applied successfully. Affected bans: %d", lifted), nil
	}
	banID, err := strconv.ParseInt(query.Get("banned"), 10, 64)
	if err != nil {
		return "", nil
	}
	habboID, err := strconv.ParseInt(query.Get("habbo"), 10, 64)
	if err != nil {
		return "", nil
	}
	ban, err := r.deps.Queries.GetBan(ctx, banID)
	if store.IsNotFound(err) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	avatar, err := r.deps.Queries.GetAvatar(ctx, habboID)
	if store.IsNotFound(err) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	if !ban.UserID.Valid || ban.UserID.Int64 != avatar.UserID {
		return "", nil
	}
	return fmt.Sprintf("User %s has been banned untill %s successfully.", avatar.Name, ban.ExpiresAt.Time.UTC().Format(dateFormat)), nil
}

func (r *Router) refuseBan(w http.ResponseWriter, req *http.Request, form banForm, message string) {
	page, err := r.newBansPage(req, form)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, "bans.html", page)
}

// findHabbo takes a habbo's name or a user's id, as findUser does. A user's id
// stands for their first habbo, archived or not, because the ban is on the user.
func (r *Router) findHabbo(ctx context.Context, search string) (store.Avatar, error) {
	avatar, err := r.deps.Queries.GetAvatarByName(ctx, search)
	if !store.IsNotFound(err) {
		return avatar, err
	}
	id, parseErr := strconv.ParseInt(search, 10, 64)
	if parseErr != nil {
		return avatar, err
	}
	habbos, listErr := r.deps.Queries.ListAllUserAvatars(ctx, id)
	if listErr != nil {
		return avatar, listErr
	}
	if len(habbos) == 0 {
		return avatar, err
	}
	return habbos[0], nil
}

func findLength(value string) (banLength, bool) {
	for _, length := range banLengths {
		if length.Value == value {
			return length, true
		}
	}
	return banLength{}, false
}

// banAddress reads the optional address, in the form auth.ClientIP compares.
func banAddress(posted string) (sql.NullString, bool) {
	if posted == "" {
		return sql.NullString{}, true
	}
	address, err := netip.ParseAddr(posted)
	if err != nil {
		return sql.NullString{}, false
	}
	return sql.NullString{String: address.Unmap().String(), Valid: true}, true
}

// HandleBansCreate handles POST /housekeeping/bans. The sessions go in the same
// transaction as the ban, so that nobody stays signed in on a ban that exists.
func (r *Router) HandleBansCreate(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	form := banForm{
		User:   strings.TrimSpace(req.PostFormValue("user")),
		Reason: req.PostFormValue("reason"),
		IP:     strings.TrimSpace(req.PostFormValue("ip")),
		Length: req.PostFormValue("length"),
	}
	avatar, err := r.findHabbo(ctx, form.User)
	switch {
	case store.IsNotFound(err):
		r.refuseBan(w, req, form, banUserMissing)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	allowed, err := r.mayActOn(req, "ban", avatar.UserID, avatar.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.refuseBan(w, req, form, userAbove)
		return
	}
	length, ok := findLength(form.Length)
	if !ok {
		r.refuseBan(w, req, form, banLengthInvalid)
		return
	}
	address, ok := banAddress(form.IP)
	if !ok {
		r.refuseBan(w, req, form, banIPInvalid)
		return
	}

	session, _ := auth.FromContext(ctx)
	now := time.Now().UTC()
	expires := length.after(now)
	var ban store.Ban
	err = r.inTx(ctx, func(q *store.Queries) error {
		ban, err = q.CreateBan(ctx, store.CreateBanParams{
			UserID:         sql.NullInt64{Int64: avatar.UserID, Valid: true},
			IP:             address,
			Reason:         form.Reason,
			IssuedByUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
			CreatedAt:      now,
			ExpiresAt:      sql.NullTime{Time: expires, Valid: true},
		})
		if err != nil {
			return err
		}
		if err := q.DeleteUserSessions(ctx, avatar.UserID); err != nil {
			return err
		}
		detail := form.Reason + " until " + expires.Format(dateFormat)
		if address.Valid {
			detail += " on " + address.String
		}
		return writeLog(req, q, staffLog{
			action:       actionBansCreate,
			detail:       detail,
			targetUser:   avatar.UserID,
			targetAvatar: avatar.ID,
		})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	location := fmt.Sprintf("/housekeeping/bans?banned=%d&habbo=%d", ban.ID, avatar.ID)
	http.Redirect(w, req, location, http.StatusSeeOther)
}

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
