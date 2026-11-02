package router

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	habbosPerPage = 100
	// loginsShown bounds the IP history of one user.
	loginsShown = 200
	joinFormat  = "02-01-2006"
	// maxMottoLength is the longer of the two limits of Holo's site.
	maxMottoLength = 38
)

const (
	habboSaved   = "User updated successfully."
	mottoTooLong = "Sorry, but the motto you have chosen is too long!"
	lookInvalid  = "The figure or the gender is not valid."
	userAbove    = "Access denied. You may only act on users below your level."
)

// holds reports whether the staff member making the request holds attribute.
func (r *Router) holds(req *http.Request, attribute auth.Attribute) (bool, error) {
	session, _ := auth.FromContext(req.Context())
	attributes, err := auth.Attributes(req.Context(), r.deps.DB, session.UserID)
	if err != nil {
		return false, err
	}
	return slices.Contains(attributes, attribute), nil
}

// mayActOn asks whether the staff member outranks the target of an action. A
// refusal is logged, as Holo logged a try at its System Administrator, and tried
// says what it was.
func (r *Router) mayActOn(req *http.Request, tried string, targetUser, targetAvatar int64) (bool, error) {
	session, _ := auth.FromContext(req.Context())
	allowed, err := auth.Outranks(req.Context(), r.deps.DB, session.UserID, targetUser)
	if err != nil || allowed {
		return allowed, err
	}
	entry := staffLog{action: actionUsersRefused, detail: tried, targetUser: targetUser, targetAvatar: targetAvatar}
	return false, writeLog(req, r.deps.Queries, entry)
}

// keep is a field of Holo's Edit User, where a blank one changes nothing.
func keep(posted, current string) string {
	if posted == "" {
		return current
	}
	return posted
}

// activity is Holo's Last Activity column.
func activity(elapsed time.Duration) string {
	seconds := int(math.Ceil(elapsed.Seconds()))
	switch {
	case seconds > 6000:
		hours := int(math.Ceil(elapsed.Hours()))
		if hours > 24 {
			return fmt.Sprintf("%d days ago", int(math.Ceil(float64(hours)/24)))
		}
		return fmt.Sprintf("%d hours ago", hours)
	case seconds >= 600:
		return fmt.Sprintf("%d minutes ago", int(math.Ceil(elapsed.Minutes())))
	default:
		return fmt.Sprintf("%d seconds ago", seconds)
	}
}

// lastActivity reads a live session first, because a sign-in can be long past for
// someone still on the site.
func (r *Router) lastActivity(ctx context.Context, avatarID int64) (string, error) {
	seen, err := r.deps.Queries.GetLastSeen(ctx, avatarID)
	if store.IsNotFound(err) {
		seen, err = r.deps.Queries.GetLastSignIn(ctx, sql.NullInt64{Int64: avatarID, Valid: true})
	}
	switch {
	case store.IsNotFound(err):
		return "Unavailable", nil
	case err != nil:
		return "", err
	}
	return activity(time.Since(seen)), nil
}

type habbosPage struct {
	chrome
	Query   string
	Private bool
	Habbos  []habboRow
	Older   int
	Newer   int
}

type habboRow struct {
	ID       int64
	Name     string
	Archived bool
	Email    string
	IP       string
	Joined   string
	Activity string
}

// HandleHabbosView renders GET /housekeeping/habbos, Holo's User Listing. Its
// search also does the work of Retrive IP Address, Retrive User ID and the Clone
// Checker, but what is private takes housekeeping.usersPrivate.
func (r *Router) HandleHabbosView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	private, err := r.holds(req, auth.HousekeepingUsersPrivate)
	if err != nil {
		r.fail(w, err)
		return
	}
	query := strings.TrimSpace(req.URL.Query().Get("q"))
	total, err := r.deps.Queries.CountHabbos(ctx, store.CountHabbosParams{Query: query, Private: private})
	if err != nil {
		r.fail(w, err)
		return
	}
	paged := pageOf(req, total, habbosPerPage)
	rows, err := r.deps.Queries.SearchHabbos(ctx, store.SearchHabbosParams{
		Query:     query,
		Private:   private,
		RowLimit:  habbosPerPage,
		RowOffset: paged.offset,
	})
	if err != nil {
		r.fail(w, err)
		return
	}

	page := habbosPage{chrome: r.chrome(req), Query: query, Private: private, Older: paged.older, Newer: paged.newer}
	for _, row := range rows {
		seen, err := r.lastActivity(ctx, row.ID)
		if err != nil {
			r.fail(w, err)
			return
		}
		habbo := habboRow{
			ID:       row.ID,
			Name:     row.Name,
			Archived: row.ArchivedAt.Valid,
			Joined:   row.CreatedAt.UTC().Format(joinFormat),
			Activity: seen,
		}
		if private {
			habbo.Email = row.Email
			if habbo.IP, err = r.lastIP(ctx, row.UserID); err != nil {
				r.fail(w, err)
				return
			}
		}
		page.Habbos = append(page.Habbos, habbo)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "habbos.html", page)
}

func (r *Router) lastIP(ctx context.Context, userID int64) (string, error) {
	logins, err := r.deps.Queries.ListUserLogins(ctx, store.ListUserLoginsParams{UserID: userID, RowLimit: 1})
	if err != nil {
		return "", err
	}
	if len(logins) == 0 {
		return "No IP Found", nil
	}
	return logins[0].IP, nil
}

type habboPage struct {
	chrome
	Private bool
	CanEdit bool
	CanGive bool
	CanBan  bool
	// CanGrant shows Attributes, which stays empty without it.
	CanGrant   bool
	Attributes []attributeBox
	Target     targetHabbo
	Owner      targetUser
	Others     []ownedHabbo
	Badges     []badgeRow
	Logins     []loginRow
	Message    string
	Error      string
}

type targetHabbo struct {
	ID       int64
	Name     string
	Figure   string
	Gender   string
	Motto    string
	Joined   string
	Activity string
	Archived bool
}

type targetUser struct {
	ID         int64
	Email      string
	BornOn     string
	Newsletter bool
	Credits    int64
	Tickets    int64
	Film       int64
}

type ownedHabbo struct {
	ID       int64
	Name     string
	Archived bool
}

type badgeRow struct {
	Code string
	Worn bool
}

type loginRow struct {
	IP   string
	Date string
}

// newHabboPage is the page of one habbo, with its owner. Addresses and IP history
// stay empty without housekeeping.usersPrivate.
func (r *Router) newHabboPage(req *http.Request, avatar store.Avatar) (habboPage, error) {
	ctx := req.Context()
	q := r.deps.Queries
	page := habboPage{chrome: r.chrome(req)}
	user, err := q.GetUser(ctx, avatar.UserID)
	if err != nil {
		return page, err
	}
	wallet, err := q.GetWallet(ctx, avatar.UserID)
	if err != nil {
		return page, err
	}
	seen, err := r.lastActivity(ctx, avatar.ID)
	if err != nil {
		return page, err
	}
	session, _ := auth.FromContext(ctx)
	attributes, err := auth.Attributes(ctx, r.deps.DB, session.UserID)
	if err != nil {
		return page, err
	}
	page.Private = slices.Contains(attributes, auth.HousekeepingUsersPrivate)
	page.CanEdit = slices.Contains(attributes, auth.HousekeepingUsersEdit)
	page.CanGive = slices.Contains(attributes, auth.HousekeepingCredits)
	page.CanBan = slices.Contains(attributes, auth.HousekeepingBans)
	page.CanGrant = slices.Contains(attributes, auth.HousekeepingAccessGroups)

	page.Target = targetHabbo{
		ID:       avatar.ID,
		Name:     avatar.Name,
		Figure:   avatar.Figure,
		Gender:   avatar.Gender,
		Motto:    avatar.Motto,
		Joined:   avatar.CreatedAt.UTC().Format(joinFormat),
		Activity: seen,
		Archived: avatar.ArchivedAt.Valid,
	}
	page.Owner = targetUser{
		ID:         user.ID,
		Newsletter: user.Newsletter,
		Credits:    wallet.Credits,
		Tickets:    wallet.Tickets,
		Film:       wallet.Film,
	}
	habbos, err := q.ListAllUserAvatars(ctx, avatar.UserID)
	if err != nil {
		return page, err
	}
	for _, habbo := range habbos {
		if habbo.ID != avatar.ID {
			page.Others = append(page.Others, ownedHabbo{ID: habbo.ID, Name: habbo.Name, Archived: habbo.ArchivedAt.Valid})
		}
	}
	if page.CanGrant {
		direct, err := q.ListDirectUserAttributes(ctx, avatar.UserID)
		if err != nil {
			return page, err
		}
		for _, entry := range auth.Catalogue() {
			page.Attributes = append(page.Attributes, attributeBox{
				Name:        string(entry.Attribute),
				Description: entry.Description,
				Held:        slices.Contains(direct, string(entry.Attribute)),
			})
		}
	}
	badges, err := q.ListAvatarBadges(ctx, avatar.ID)
	if err != nil {
		return page, err
	}
	for _, badge := range badges {
		page.Badges = append(page.Badges, badgeRow{Code: badge.Code, Worn: badge.Worn})
	}
	if !page.Private {
		return page, nil
	}

	page.Owner.Email = user.Email
	page.Owner.BornOn = user.BornOn.UTC().Format(time.DateOnly)
	logins, err := q.ListUserLogins(ctx, store.ListUserLoginsParams{UserID: avatar.UserID, RowLimit: loginsShown})
	if err != nil {
		return page, err
	}
	seenIPs := make(map[string]bool)
	for _, login := range logins {
		if !seenIPs[login.IP] {
			seenIPs[login.IP] = true
			page.Logins = append(page.Logins, loginRow{IP: login.IP, Date: login.CreatedAt.UTC().Format(dateFormat)})
		}
	}
	return page, nil
}

// habboFromPath answers 404 for a habbo that does not exist.
func (r *Router) habboFromPath(w http.ResponseWriter, req *http.Request) (store.Avatar, bool) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return store.Avatar{}, false
	}
	avatar, err := r.deps.Queries.GetAvatar(req.Context(), id)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return avatar, false
	case err != nil:
		r.fail(w, err)
		return avatar, false
	}
	return avatar, true
}

// HandleHabboView renders GET /housekeeping/habbos/{id}.
func (r *Router) HandleHabboView(w http.ResponseWriter, req *http.Request) {
	avatar, ok := r.habboFromPath(w, req)
	if !ok {
		return
	}
	page, err := r.newHabboPage(req, avatar)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Message = habboMessage(req.URL.Query(), avatar.Name)
	astro.WriteTemplate(w, r.deps.Resolver, "habbos/id.html", page)
}

// habboMessage is what a change says once it has redirected here. The address only
// picks a text: what it adds must read as a badge code or an amount, so that a link
// cannot put words on the page.
func habboMessage(query url.Values, name string) string {
	if query.Has("saved") {
		return habboSaved
	}
	if amount, err := strconv.ParseInt(query.Get("gave"), 10, 64); err == nil {
		return fmt.Sprintf("Gave user %s %d credits.", name, amount)
	}
	code := query.Get("badge")
	switch {
	case !badgeCode.MatchString(code):
		return ""
	case query.Has("given"):
		return "Gave the user this badge (" + code + ") and set it as current badge successfully."
	case query.Has("worn"):
		return "This user already has this badge; the badge (" + code + ") has been set as the user's current badge successfully."
	case query.Has("removed"):
		return "Removed the badge (" + code + ") from this user."
	}
	return ""
}

// refuseHabbo answers a refused change on the habbo's page.
func (r *Router) refuseHabbo(w http.ResponseWriter, req *http.Request, avatar store.Avatar, message string) {
	page, err := r.newHabboPage(req, avatar)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, "habbos/id.html", page)
}

// HandleHabboSave handles POST /housekeeping/habbos/{id}, the habbo's half of
// Holo's Edit User. It reads these fields alone, where Holo took column names from
// the form, and the name stays out as Holo's form disabled it.
func (r *Router) HandleHabboSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	avatar, ok := r.habboFromPath(w, req)
	if !ok {
		return
	}
	allowed, err := r.mayActOn(req, "edit habbo", avatar.UserID, avatar.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.refuseHabbo(w, req, avatar, userAbove)
		return
	}

	motto := keep(req.PostFormValue("motto"), avatar.Motto)
	figure := keep(req.PostFormValue("figure"), avatar.Figure)
	gender := keep(req.PostFormValue("gender"), avatar.Gender)
	if utf8.RuneCountInString(motto) > maxMottoLength {
		r.refuseHabbo(w, req, avatar, mottoTooLong)
		return
	}
	if auth.ValidateLook(figure, gender) != nil {
		r.refuseHabbo(w, req, avatar, lookInvalid)
		return
	}

	var changed []string
	if motto != avatar.Motto {
		changed = append(changed, "motto")
	}
	if figure != avatar.Figure {
		changed = append(changed, "figure")
	}
	if gender != avatar.Gender {
		changed = append(changed, "gender")
	}
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		err := q.UpdateAvatarMotto(ctx, store.UpdateAvatarMottoParams{ID: avatar.ID, Motto: motto, UpdatedAt: now})
		if err != nil {
			return err
		}
		look := store.UpdateAvatarLookParams{ID: avatar.ID, Figure: figure, Gender: gender, UpdatedAt: now}
		if err := q.UpdateAvatarLook(ctx, look); err != nil {
			return err
		}
		return writeLog(req, q, staffLog{
			action:       actionHabbosUpdate,
			detail:       strings.Join(changed, ", "),
			targetUser:   avatar.UserID,
			targetAvatar: avatar.ID,
		})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, habboPath(avatar.ID)+"?saved=1", http.StatusSeeOther)
}

func habboPath(id int64) string {
	return "/housekeeping/habbos/" + strconv.FormatInt(id, 10)
}
