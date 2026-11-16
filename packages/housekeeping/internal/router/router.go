package router

import (
	"context"
	"database/sql"
	"encoding/json/v2"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"slices"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// dateFormat is Holo's date_full.
const dateFormat = "02-01-2006 15:04:05"

// Deps are the shared services every handler can use.
type Deps struct {
	Resolver astro.Resolver
	DB       *sql.DB
	Queries  *store.Queries
	Updates  *store.UpdateCheck
	// Habbos is nil until a runner injects it, and while it is nil its calls are
	// skipped.
	Habbos services.Habbos
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}

// Staff lets through only users holding housekeeping.access. Housekeeping has no
// login: a guest goes to the CMS, at site.url because a housekeeping running
// alone has no /. A banned user goes there too, because the CMS ends the session
// and shows Holo's ban message, on whatever page they open.
func (r *Router) Staff(next http.Handler) http.Handler {
	enter := auth.RequireAttribute(r.deps.DB, auth.HousekeepingAccess)(next)
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		session, ok := auth.FromContext(req.Context())
		if !ok {
			http.Redirect(w, req, settings.GetString("site.url"), http.StatusSeeOther)
			return
		}
		ban, err := auth.ActiveBan(req.Context(), r.deps.DB, session.UserID, auth.ClientIP(req))
		if err != nil {
			r.fail(w, err)
			return
		}
		if ban != nil {
			http.Redirect(w, req, settings.GetString("site.url"), http.StatusSeeOther)
			return
		}
		enter.ServeHTTP(w, req)
	})
}

// RequireAttribute lets through only staff holding attr, inside Staff. Anyone
// else gets Holo's Access Denied page, in the layout, because they are staff.
func (r *Router) RequireAttribute(attr auth.Attribute) func(http.Handler) http.Handler {
	return r.RequireAnyAttribute(attr)
}

// RequireAnyAttribute lets in a user holding at least one of attrs.
func (r *Router) RequireAnyAttribute(attrs ...auth.Attribute) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			session, _ := auth.FromContext(req.Context())
			attributes, err := auth.Attributes(req.Context(), r.deps.DB, session.UserID)
			if err != nil {
				r.fail(w, err)
				return
			}
			if !slices.ContainsFunc(attrs, func(attr auth.Attribute) bool { return slices.Contains(attributes, attr) }) {
				r.denied(w, req)
				return
			}
			next.ServeHTTP(w, req)
		})
	}
}

func (r *Router) denied(w http.ResponseWriter, req *http.Request) {
	w.WriteHeader(http.StatusForbidden)
	astro.WriteTemplate(w, r.deps.Resolver, "access-denied.html", accessDeniedPage{chrome: r.chrome(req)})
}

type accessDeniedPage struct {
	chrome
}

// chrome holds what the housekeeping layout reads. Every page struct embeds it,
// because rendering fails without these fields.
type chrome struct {
	Habbo         string
	PreviousLogin string
	SiteName      string
	SiteURL       string
	Sections      []section
	ServerName    string
	ServerDate    string
	ServerTime    string
	ServerMillis  int64
}

func (r *Router) chrome(req *http.Request) chrome {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	now := time.Now().UTC()
	page := chrome{
		SiteName:     settings.GetString("site.name"),
		SiteURL:      settings.GetString("site.url"),
		Sections:     sectionsOver(settings.Declared()),
		ServerDate:   now.Format("January 2, 2006"),
		ServerTime:   now.Format("15:04:05 GMT-0700 (MST)"),
		ServerMillis: now.UnixMilli(),
	}
	if site, err := url.Parse(page.SiteURL); err == nil {
		page.ServerName = site.Host
	}

	avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		logError("housekeeping: habbo", err)
	}
	page.Habbo = avatar.Name

	// The newest sign-in is the one in use. A first sign-in has no other.
	previous, err := r.deps.Queries.GetPreviousLogin(ctx, session.UserID)
	switch {
	case err == nil:
		page.PreviousLogin = previous.CreatedAt.UTC().Format(dateFormat) + " from " + previous.IP
	case !errors.Is(err, sql.ErrNoRows):
		logError("housekeeping: previous login", err)
	}
	return page
}

// logError logs err under msg, unless the visitor abandoned the request: its
// error is then context.Canceled, and the request ends quietly.
func logError(msg string, err error) {
	if errors.Is(err, context.Canceled) {
		return
	}
	slog.Error(msg, "err", err)
}

// sendLookTimeout is how long the game has to answer a SendLook.
const sendLookTimeout = 2 * time.Second

// sendLook tells the game that the habbo's look or motto changed, after the save.
// The call has a context of its own, apart from the request's, so a request the
// visitor abandons still tells the game. A failure is logged, and the page
// answers as it would without the game.
func (r *Router) sendLook(ctx context.Context, avatarID int64) {
	if r.deps.Habbos == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), sendLookTimeout)
	defer cancel()
	if err := r.deps.Habbos.SendLook(ctx, avatarID); err != nil {
		logError("housekeeping: send look", fmt.Errorf("habbo %d: %w", avatarID, err))
	}
}

func (r *Router) fail(w http.ResponseWriter, err error) {
	logError("housekeeping", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}

// answerJSON writes v as the answer, with status.
func (r *Router) answerJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.MarshalWrite(w, v); err != nil {
		slog.Error("housekeeping: json", "err", err)
	}
}

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
	actionHabbosRestore         = "habbos.restore"
	actionUsersUpdate           = "users.update"
	actionUsersAttributes       = "users.attributes"
	actionUsersRefused          = "users.refused"
	actionCreditsGive           = "credits.give"
	actionAlertsSend            = "alerts.send"
	actionAlertsBroadcast       = "alerts.broadcast"
	actionHelpPick              = "help.pick"
	actionHelpClose             = "help.close"
	actionBansCreate            = "bans.create"
	actionBansLift              = "bans.lift"
	actionBadgesGive            = "badges.give"
	actionBadgesWear            = "badges.wear"
	actionBadgesDelete          = "badges.delete"
	actionHomeStoreCreate       = "homeStore.create"
	actionHomeStoreUpdate       = "homeStore.update"
	actionNewsCreate            = "news.create"
	actionNewsUpdate            = "news.update"
	actionNewsDelete            = "news.delete"
	actionNewsImage             = "news.image"
	actionImagesDelete          = "images.delete"
	actionBannersCreate         = "banners.create"
	actionBannersUpdate         = "banners.update"
	actionBannersDelete         = "banners.delete"
	actionVouchersCreate        = "vouchers.create"
	actionVouchersDelete        = "vouchers.delete"
	actionDatabaseUpdate        = "database.update"
	actionConfigUpdate          = "config.update"
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
