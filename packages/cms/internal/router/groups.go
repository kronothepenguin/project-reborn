package router

import (
	"context"
	"database/sql"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	groupPurchaseDetail = "Group purchase"
	reasonGroup         = "group"
	accessRegular       = "open"
	roleAdmin           = "admin"
	roleMember          = "member"
	widgetGroup         = "group_info"
	widgetMembers       = "members"
	widgetGroups        = "groups"
)

// purchaseTakenText is 0084's answer for a name another group has, on purchase
// and in the settings.
const purchaseTakenText = "A group with this name already exists."

// Why a purchase fails, which the dialog words as grouppurchase.php did.
const (
	purchaseDisabled        = "disabled"
	purchaseCredits         = "credits"
	purchaseOwned           = "owned"
	purchaseBlank           = "blank"
	purchaseNameLong        = "nameLong"
	purchaseDescriptionLong = "descriptionLong"
	purchaseTaken           = "taken"
)

// myGroup is a group the active habbo joined, as its lists show it.
type myGroup struct {
	ID    int64
	Name  string
	Badge string
}

// groupPurchase is what grouppurchase.php checked before it showed its form, so
// that the dialog can open as Holo's did; buying checks it all again.
type groupPurchase struct {
	Enabled        bool
	Price          int
	Owned          int64
	MaxOwned       int
	NameMax        int
	DescriptionMax int
}

func (r *Router) myGroups(ctx context.Context, avatarID int64) ([]myGroup, error) {
	rows, err := r.deps.Queries.ListAvatarGroups(ctx, avatarID)
	if err != nil {
		return nil, err
	}
	groups := make([]myGroup, 0, len(rows))
	for _, row := range rows {
		groups = append(groups, myGroup{ID: row.ID, Name: row.Name, Badge: row.Badge})
	}
	return groups, nil
}

func (r *Router) groupPurchase(ctx context.Context, userID int64) (groupPurchase, error) {
	owned, err := r.deps.Queries.CountUserOwnedGroups(ctx, userID)
	if err != nil {
		return groupPurchase{}, err
	}
	return groupPurchase{
		Enabled:        settings.Bool(ctx, r.deps.Queries, "features.groupPurchase"),
		Price:          settings.Int(ctx, r.deps.Queries, "groups.price"),
		Owned:          owned,
		MaxOwned:       settings.Int(ctx, r.deps.Queries, "groups.maxOwned"),
		NameMax:        settings.Int(ctx, r.deps.Queries, "groups.nameMaxLength"),
		DescriptionMax: settings.Int(ctx, r.deps.Queries, "groups.descriptionMaxLength"),
	}, nil
}

type purchaseBody struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type purchaseAnswer struct {
	ID    int64  `json:"id,omitempty"`
	Name  string `json:"name,omitempty"`
	Error string `json:"error,omitempty"`
}

// HandleGroupsPurchase handles POST /groups, grouppurchase.php's confirmation:
// the active habbo buys a Regular group with Holo's badge from the user's purse.
// The debit, its ledger row, the group, the owner's admin row and the home with
// its Group information widget are written together.
func (r *Router) HandleGroupsPurchase(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	var body purchaseBody
	if !readEdit(w, req, &body) {
		return
	}
	session, _ := auth.FromContext(ctx)
	name := strings.TrimSpace(body.Name)
	description := strings.TrimSpace(body.Description)

	refusal := ""
	var created store.Group
	now := time.Now().UTC()
	err := r.inTx(ctx, func(q *store.Queries) error {
		price := settings.Int(ctx, q, "groups.price")
		if !settings.Bool(ctx, q, "features.groupPurchase") {
			refusal = purchaseDisabled
			return nil
		}
		wallet, err := q.GetWallet(ctx, session.UserID)
		if err != nil {
			return err
		}
		if wallet.Credits < int64(price) {
			refusal = purchaseCredits
			return nil
		}
		owned, err := q.CountUserOwnedGroups(ctx, session.UserID)
		if err != nil {
			return err
		}
		switch {
		case owned >= int64(settings.Int(ctx, q, "groups.maxOwned")):
			refusal = purchaseOwned
			return nil
		case name == "" || description == "":
			refusal = purchaseBlank
			return nil
		case utf8.RuneCountInString(name) > settings.Int(ctx, q, "groups.nameMaxLength"):
			refusal = purchaseNameLong
			return nil
		case utf8.RuneCountInString(description) > settings.Int(ctx, q, "groups.descriptionMaxLength"):
			refusal = purchaseDescriptionLong
			return nil
		}
		switch _, err := q.GetGroupByName(ctx, name); {
		case err == nil:
			refusal = purchaseTaken
			return nil
		case !store.IsNotFound(err):
			return err
		}

		changed, err := q.ChangeWalletCredits(ctx, store.ChangeWalletCreditsParams{UserID: session.UserID, Credits: -int64(price), UpdatedAt: now})
		if err != nil {
			return err
		}
		if changed == 0 {
			refusal = purchaseCredits
			return nil
		}
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			UserID:    session.UserID,
			AvatarID:  sql.NullInt64{Int64: session.AvatarID, Valid: true},
			Credits:   -int64(price),
			Reason:    reasonGroup,
			Detail:    groupPurchaseDetail,
			CreatedAt: now,
		})
		if err != nil {
			return err
		}
		created, err = q.CreateGroup(ctx, store.CreateGroupParams{
			AvatarID:    session.AvatarID,
			Name:        name,
			Description: description,
			Badge:       badge.Default,
			Access:      accessRegular,
			CreatedAt:   now,
			UpdatedAt:   now,
		})
		if err != nil {
			return err
		}
		err = q.AddGroupMember(ctx, store.AddGroupMemberParams{
			GroupID:     created.ID,
			AvatarID:    session.AvatarID,
			Role:        roleAdmin,
			RequestedAt: now,
			JoinedAt:    sql.NullTime{Time: now, Valid: true},
		})
		if err != nil {
			return err
		}
		home, err := q.CreateGroupHome(ctx, store.CreateGroupHomeParams{GroupID: created.ID, UpdatedAt: now})
		if err != nil {
			return err
		}
		// Holo wrote the Group information widget where it wrote the profile widget.
		_, err = q.CreateHomeItem(ctx, store.CreateHomeItemParams{
			HomeID:    home.ID,
			Kind:      "widget",
			Widget:    sql.NullString{String: widgetGroup, Valid: true},
			Skin:      "defaultskin",
			X:         profileX,
			Y:         profileY,
			Z:         profileZ,
			CreatedAt: now,
			UpdatedAt: now,
		})
		return err
	})
	switch {
	case store.IsConflict(err):
		r.answerJSON(w, http.StatusUnprocessableEntity, purchaseAnswer{Error: purchaseTaken})
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, purchaseAnswer{Error: refusal})
	default:
		r.sendPurse(ctx, session.UserID)
		r.answerJSON(w, http.StatusOK, purchaseAnswer{ID: created.ID, Name: created.Name})
	}
}

// dateFull is Holo's $date_full, which it wrote for a group's creation.
const dateFull = "02-01-2006 15:04:05"

const (
	accessExclusive = "moderated"
	accessPrivate   = "closed"
	accessUnlimited = "unlimited"
)

type groupPage struct {
	community
	ImagingURL string
	GroupID    int64
	// Group is the group's name, which Name would hide from the layout.
	Group string
	// Exclusive and Private carry Holo's icons beside the name.
	Exclusive    bool
	Private      bool
	HomeID       int64
	Background   string
	BackgroundID int64
	Items        []homeItem
	Info         groupInfo
	Members      []groupMember
	Viewer       groupViewer
	// The owner's settings dialog reads these.
	Access         string
	NameMax        int
	DescriptionMax int
	MaxMembers     int
}

// groupViewer is what the page offers the active habbo, as group_profile.php's
// view tools: Join is "join", "request" or empty, and Favourite "make",
// "remove" or empty.
type groupViewer struct {
	Join      string
	Favourite string
	Leave     bool
	// Admin opens the Edit menu, and Owner adds its Settings.
	Admin bool
	Owner bool
	// Me is the active habbo, whose own row the member list treats apart.
	Me int64
}

// groupInfo is the Group information widget.
type groupInfo struct {
	Badge       string
	Name        string
	Created     string
	Members     int64
	Description string
}

// groupMember is a habbo of the Group Members widget.
type groupMember struct {
	Name      string
	Figure    string
	Created   string
	Owner     bool
	Admin     bool
	Favourite bool
}

type groupMissingPage struct {
	community
	// Searched shows Holo's line for a search that found nothing.
	Searched bool
	Search   string
	NameMax  int
}

// HandleGroupsView handles GET /groups/{id}, group_profile.php: anyone reads a
// group's home. Unlike Holo, viewing writes nothing.
func (r *Router) HandleGroupsView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.groupMissing(w, req, false, "")
		return
	}
	group, err := r.deps.Queries.GetGroup(ctx, id)
	switch {
	case store.IsNotFound(err):
		r.groupMissing(w, req, false, "")
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	page, err := r.newGroupPage(ctx, group, 0)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "groups/id.html", page)
}

// HandleGroupsSearchView handles GET /groups?name=, the Search for group of a
// missing group's page (0095): the group with exactly that name, ignoring case.
func (r *Router) HandleGroupsSearchView(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	if !query.Has("name") {
		r.groupMissing(w, req, false, "")
		return
	}
	name := query.Get("name")
	group, err := r.deps.Queries.GetGroupByName(req.Context(), name)
	switch {
	case store.IsNotFound(err):
		r.groupMissing(w, req, true, name)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/groups/"+strconv.FormatInt(group.ID, 10), http.StatusSeeOther)
	}
}

func (r *Router) groupMissing(w http.ResponseWriter, req *http.Request, searched bool, search string) {
	page, err := r.community(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	w.WriteHeader(http.StatusNotFound)
	astro.WriteTemplate(w, r.deps.Resolver, "groups/not-found.html", groupMissingPage{
		community: page,
		Searched:  searched,
		Search:    search,
		NameMax:   settings.Int(req.Context(), r.deps.Queries, "groups.nameMaxLength"),
	})
}

// newGroupPage is a group's page; editor is the user editing its home, 0 when
// nobody is.
func (r *Router) newGroupPage(ctx context.Context, group store.Group, editor int64) (groupPage, error) {
	q := r.deps.Queries
	shared, err := r.community(ctx)
	if err != nil {
		return groupPage{}, err
	}
	page := groupPage{
		community:  shared,
		ImagingURL: settings.String(ctx, r.deps.Queries, "imaging.avatarUrl"),
		GroupID:    group.ID,
		Group:      group.Name,
		Exclusive:  group.Access == accessExclusive,
		Private:    group.Access == accessPrivate,
		Access:     group.Access,

		NameMax:        settings.Int(ctx, r.deps.Queries, "groups.nameMaxLength"),
		DescriptionMax: settings.Int(ctx, r.deps.Queries, "groups.descriptionMaxLength"),
		MaxMembers:     settings.Int(ctx, r.deps.Queries, "groups.maxMembers"),
	}
	home, err := q.GetGroupHome(ctx, group.ID)
	if err != nil {
		return page, err
	}
	page.HomeID = home.ID
	if page.Background, page.BackgroundID, err = r.homeBackground(ctx, home); err != nil {
		return page, err
	}
	count, err := q.CountGroupMembers(ctx, group.ID)
	if err != nil {
		return page, err
	}
	page.Info = groupInfo{
		Badge:       group.Badge,
		Name:        group.Name,
		Created:     group.CreatedAt.UTC().Format(dateFull),
		Members:     count,
		Description: group.Description,
	}
	// Holo listed every member in the widget, with no pages.
	members, err := q.ListGroupMembers(ctx, store.ListGroupMembersParams{GroupID: group.ID, RowLimit: -1})
	if err != nil {
		return page, err
	}
	for _, m := range members {
		page.Members = append(page.Members, groupMember{
			Name:      m.Name,
			Figure:    m.Figure,
			Created:   m.CreatedAt.UTC().Format(createdFormat),
			Owner:     m.ID == group.AvatarID,
			Admin:     m.Role == roleAdmin,
			Favourite: m.Favourite,
		})
	}

	if page.Items, err = r.homeItems(ctx, home.ID, editor); err != nil {
		return page, err
	}
	if page.Viewer, err = r.groupViewer(ctx, group); err != nil {
		return page, err
	}
	return page, nil
}

// groupViewer offers what group_profile.php offered, for the active habbo (0086).
// Holo showed Join again to a habbo with a waiting request; here it does not.
func (r *Router) groupViewer(ctx context.Context, group store.Group) (groupViewer, error) {
	var viewer groupViewer
	session, ok := auth.FromContext(ctx)
	if !ok {
		return viewer, nil
	}
	viewer.Me = session.AvatarID
	row, err := r.deps.Queries.GetGroupMember(ctx, store.GetGroupMemberParams{GroupID: group.ID, AvatarID: session.AvatarID})
	switch {
	case store.IsNotFound(err):
		switch group.Access {
		case accessRegular, accessUnlimited:
			viewer.Join = "join"
		case accessExclusive:
			viewer.Join = "request"
		}
		return viewer, nil
	case err != nil:
		return viewer, err
	case !row.JoinedAt.Valid:
		return viewer, nil
	}
	viewer.Favourite = "make"
	if row.Favourite {
		viewer.Favourite = "remove"
	}
	viewer.Owner = session.AvatarID == group.AvatarID
	viewer.Admin = row.Role == roleAdmin
	viewer.Leave = !viewer.Owner
	return viewer, nil
}

// The answers of joingroup.php and leavegroup.php, spelled correctly.
const (
	joinJoined    = "You have now joined this group."
	joinRequested = "A request to join this group has been made. The group owner will have to accept you before you join this group."
	joinFull      = "This group is full."
	joinClosed    = "Sorry, but this group is closed. No one can join this group!"
	joinAlready   = "You are already a member of this group or a request to join this group has already been made."
	joinLimit     = "You are already a member/have pending requests of %d or more groups."
	leftGroup     = "You have successfully left this group."
)

type groupAnswer struct {
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

// actedGroup is the group of a membership action's path; a group that does not
// exist answers 404.
func (r *Router) actedGroup(w http.ResponseWriter, req *http.Request) (store.Group, bool) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return store.Group{}, false
	}
	group, err := r.deps.Queries.GetGroup(req.Context(), id)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return group, false
	case err != nil:
		r.fail(w, err)
		return group, false
	}
	return group, true
}

// The answers of update_group_settings.php, with 0084's taken name.
const (
	settingsSaved     = "Editing group settings successful"
	settingsLocked    = "You may not change the group type if it is set to 3."
	settingsBadType   = "Invalid group type."
	settingsNameLong  = "Name too long"
	settingsDescLong  = "Description too long"
	settingsNameBlank = "Please give a name"
	groupDeleted      = "The group has been deleted successfully."
)

// ownedGroup is the group of the path when the active habbo owns it; anyone else
// gets 403, as only the owner had group_settings.php.
func (r *Router) ownedGroup(w http.ResponseWriter, req *http.Request) (store.Group, bool) {
	group, ok := r.actedGroup(w, req)
	if !ok {
		return group, false
	}
	session, _ := auth.FromContext(req.Context())
	if group.AvatarID != session.AvatarID {
		r.answerJSON(w, http.StatusForbidden, groupAnswer{Error: "notOwner"})
		return group, false
	}
	return group, true
}
