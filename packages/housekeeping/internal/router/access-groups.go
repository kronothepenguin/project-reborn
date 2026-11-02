package router

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// staffShown is the limit of Holo's staff list.
const staffShown = 50

const (
	groupSaved      = "Access groups updated successfully."
	groupDeleted    = "Access group deleted successfully."
	groupNotTicked  = "Tick the box to delete this group."
	groupNameBlank  = "Please do not leave any fields blank."
	groupNameTaken  = "A group with this name already exists."
	groupUnknown    = "Only the attributes of the catalogue can be given."
	lastManager     = "Access denied. The last user who can manage access groups must keep housekeeping.access and housekeeping.accessGroups."
	groupAbove      = "Access denied. You may not change a group above your level."
	levelAbove      = "Access denied. You may not set a level above your own."
	levelInvalid    = "The level must be a number from 0 to 99."
	userMissing     = "A user with this name/id does not exist!"
	displayNotOwned = "The display habbo must be one of the user's own habbos."
)

// maxLevel keeps levels small enough to type. Holo's ranks stop at 7.
const maxLevel = 99

// errLastManager makes inTx roll back a change the guard refuses.
var errLastManager = errors.New("housekeeping: the last manager of access groups")

// inTx runs change in one transaction, committing when it returns nil. change must
// use only the q it receives, because the pool's one connection is the
// transaction's until inTx returns.
func (r *Router) inTx(ctx context.Context, change func(q *store.Queries) error) error {
	tx, err := r.deps.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if err := change(r.deps.Queries.WithTx(tx)); err != nil {
		return err
	}
	return tx.Commit()
}

// keepManager refuses a change that leaves nobody able to manage access groups,
// after the change has run in its transaction. It asks for someone holding both
// attributes, from any group or directly: housekeeping.accessGroups alone opens
// nothing, so losing housekeeping.access would lock the hotel out just the same,
// and nobody is expected to edit the database by hand.
func keepManager(ctx context.Context, q *store.Queries) error {
	managers, err := q.ListAttributeHolders(ctx, string(auth.HousekeepingAccessGroups))
	if err != nil {
		return err
	}
	entrants, err := q.ListAttributeHolders(ctx, string(auth.HousekeepingAccess))
	if err != nil {
		return err
	}
	for _, manager := range managers {
		if slices.Contains(entrants, manager) {
			return nil
		}
	}
	return errLastManager
}

// refused logs a change the guard refused, as Holo logged the refusals of its rank
// tool. The transaction is over by now, so it can use the pool.
func (r *Router) refused(req *http.Request, detail string, targetUser int64) error {
	return writeLog(req, r.deps.Queries, staffLog{action: actionGroupsRefused, detail: detail, targetUser: targetUser})
}

type groupForm struct {
	ID          int64
	Name        string
	Description string
	StaffListed bool
	Level       int64
}

// readGroupForm also says whether the level is one a group can have.
func readGroupForm(req *http.Request) (groupForm, bool) {
	level, err := strconv.ParseInt(req.PostFormValue("level"), 10, 64)
	form := groupForm{
		Name:        strings.TrimSpace(req.PostFormValue("name")),
		Description: strings.TrimSpace(req.PostFormValue("description")),
		StaffListed: req.PostFormValue("staffListed") != "",
		Level:       level,
	}
	return form, err == nil && level >= 0 && level <= maxLevel
}

// actorLevel is the level of the staff member making the request.
func (r *Router) actorLevel(req *http.Request) (int64, error) {
	session, _ := auth.FromContext(req.Context())
	return auth.Level(req.Context(), r.deps.DB, session.UserID)
}

func groupPath(id int64) string {
	return "/housekeeping/access-groups/" + strconv.FormatInt(id, 10)
}

type accessGroupsPage struct {
	chrome
	Groups  []groupRow
	Staff   []staffRow
	New     groupForm
	Message string
	Error   string
}

type groupRow struct {
	ID          int64
	Name        string
	Description string
	Level       int64
	Members     int64
	StaffListed bool
}

type staffRow struct {
	UserID int64
	Name   string
	Group  string
}

func (r *Router) newAccessGroupsPage(req *http.Request) (accessGroupsPage, error) {
	ctx := req.Context()
	page := accessGroupsPage{chrome: r.chrome(req)}
	groups, err := r.deps.Queries.ListAccessGroups(ctx)
	if err != nil {
		return page, err
	}
	for _, group := range groups {
		page.Groups = append(page.Groups, groupRow{
			ID:          group.ID,
			Name:        group.Name,
			Description: group.Description,
			Level:       group.Level,
			Members:     group.MemberCount,
			StaffListed: group.StaffListed,
		})
	}
	members, err := r.deps.Queries.ListStaffMembers(ctx, staffShown)
	if err != nil {
		return page, err
	}
	for _, member := range members {
		page.Staff = append(page.Staff, staffRow{UserID: member.UserID, Name: member.Name, Group: member.GroupName})
	}
	return page, nil
}

// HandleAccessGroupsView renders GET /housekeeping/access-groups, which replaces
// Holo's rank tool: access groups stand in for ranks.
func (r *Router) HandleAccessGroupsView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newAccessGroupsPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	if req.URL.Query().Has("deleted") {
		page.Message = groupDeleted
	}
	astro.WriteTemplate(w, r.deps.Resolver, "access-groups.html", page)
}

// HandleAccessGroupsCreate handles POST /housekeeping/access-groups.
func (r *Router) HandleAccessGroupsCreate(w http.ResponseWriter, req *http.Request) {
	form, validLevel := readGroupForm(req)
	refuse := func(message string) {
		page, err := r.newAccessGroupsPage(req)
		if err != nil {
			r.fail(w, err)
			return
		}
		page.New, page.Error = form, message
		w.WriteHeader(http.StatusUnprocessableEntity)
		astro.WriteTemplate(w, r.deps.Resolver, "access-groups.html", page)
	}
	if form.Name == "" {
		refuse(groupNameBlank)
		return
	}
	if !validLevel {
		refuse(levelInvalid)
		return
	}
	level, err := r.actorLevel(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	if form.Level > level {
		if err := r.refused(req, form.Name, 0); err != nil {
			r.fail(w, err)
			return
		}
		refuse(levelAbove)
		return
	}

	var id int64
	err = r.inTx(req.Context(), func(q *store.Queries) error {
		now := time.Now().UTC()
		group, err := q.CreateAccessGroup(req.Context(), store.CreateAccessGroupParams{
			Name:        form.Name,
			Description: form.Description,
			StaffListed: form.StaffListed,
			Level:       form.Level,
			CreatedAt:   now,
			UpdatedAt:   now,
		})
		if err != nil {
			return err
		}
		id = group.ID
		return writeLog(req, q, staffLog{action: actionGroupsCreate, detail: form.Name})
	})
	switch {
	case store.IsConflict(err):
		refuse(groupNameTaken)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, groupPath(id), http.StatusSeeOther)
	}
}

type accessGroupPage struct {
	chrome
	Group      groupForm
	Attributes []attributeBox
	Members    []memberRow
	Search     string
	Found      foundUser
	Message    string
	Error      string
}

type attributeBox struct {
	Name        string
	Description string
	Held        bool
}

type memberRow struct {
	UserID int64
	Name   string
	Habbos []habboOption
}

type habboOption struct {
	ID       int64
	Name     string
	Selected bool
}

// foundUser is the result of the group page's search. A zero UserID means none.
type foundUser struct {
	UserID int64
	Habbos []habboOption
}

func (r *Router) habboOptions(ctx context.Context, userID, selected int64) ([]habboOption, error) {
	habbos, err := r.deps.Queries.ListUserAvatars(ctx, userID)
	if err != nil {
		return nil, err
	}
	options := make([]habboOption, 0, len(habbos))
	for _, habbo := range habbos {
		options = append(options, habboOption{ID: habbo.ID, Name: habbo.Name, Selected: habbo.ID == selected})
	}
	return options, nil
}

func (r *Router) newAccessGroupPage(req *http.Request, group store.AccessGroup) (accessGroupPage, error) {
	ctx := req.Context()
	page := accessGroupPage{
		chrome: r.chrome(req),
		Group:  groupForm{ID: group.ID, Name: group.Name, Description: group.Description, StaffListed: group.StaffListed, Level: group.Level},
	}
	held, err := r.deps.Queries.ListAccessGroupAttributes(ctx, group.ID)
	if err != nil {
		return page, err
	}
	for _, entry := range auth.Catalogue() {
		page.Attributes = append(page.Attributes, attributeBox{
			Name:        string(entry.Attribute),
			Description: entry.Description,
			Held:        slices.Contains(held, string(entry.Attribute)),
		})
	}
	members, err := r.deps.Queries.ListAccessGroupMembers(ctx, group.ID)
	if err != nil {
		return page, err
	}
	for _, member := range members {
		habbos, err := r.habboOptions(ctx, member.UserID, member.DisplayAvatarID.Int64)
		if err != nil {
			return page, err
		}
		page.Members = append(page.Members, memberRow{UserID: member.UserID, Name: member.Name, Habbos: habbos})
	}
	return page, nil
}

// groupFromPath answers 404 for a group that does not exist.
func (r *Router) groupFromPath(w http.ResponseWriter, req *http.Request) (store.AccessGroup, bool) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return store.AccessGroup{}, false
	}
	return r.group(w, req, id)
}

func (r *Router) group(w http.ResponseWriter, req *http.Request, id int64) (store.AccessGroup, bool) {
	group, err := r.deps.Queries.GetAccessGroup(req.Context(), id)
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

// findUser takes a habbo's name or a user's id, as Holo's rank tool took a name or
// an id.
func (r *Router) findUser(ctx context.Context, search string) (foundUser, error) {
	var userID int64
	avatar, err := r.deps.Queries.GetAvatarByName(ctx, search)
	switch {
	case err == nil:
		userID = avatar.UserID
	case !store.IsNotFound(err):
		return foundUser{}, err
	default:
		id, parseErr := strconv.ParseInt(search, 10, 64)
		if parseErr != nil {
			return foundUser{}, err
		}
		user, err := r.deps.Queries.GetUser(ctx, id)
		if err != nil {
			return foundUser{}, err
		}
		userID = user.ID
	}
	habbos, err := r.habboOptions(ctx, userID, avatar.ID)
	if err != nil {
		return foundUser{}, err
	}
	return foundUser{UserID: userID, Habbos: habbos}, nil
}

// HandleAccessGroupView renders GET /housekeeping/access-groups/{id}. A display
// habbo is picked from the user's own habbos, so ?habbo= finds the user first.
func (r *Router) HandleAccessGroupView(w http.ResponseWriter, req *http.Request) {
	group, ok := r.groupFromPath(w, req)
	if !ok {
		return
	}
	page, err := r.newAccessGroupPage(req, group)
	if err != nil {
		r.fail(w, err)
		return
	}
	if req.URL.Query().Has("saved") {
		page.Message = groupSaved
	}
	if page.Search = strings.TrimSpace(req.URL.Query().Get("habbo")); page.Search != "" {
		switch found, err := r.findUser(req.Context(), page.Search); {
		case store.IsNotFound(err):
			page.Error = userMissing
		case err != nil:
			r.fail(w, err)
			return
		default:
			page.Found = found
		}
	}
	astro.WriteTemplate(w, r.deps.Resolver, "access-groups/id.html", page)
}

// knownAttributes keeps a posted list to the catalogue, sorted and without repeats.
func knownAttributes(posted []string) ([]string, bool) {
	catalogue := auth.Catalogue()
	for _, name := range posted {
		known := slices.ContainsFunc(catalogue, func(entry auth.CatalogueEntry) bool { return string(entry.Attribute) == name })
		if !known {
			return nil, false
		}
	}
	return slices.Compact(slices.Sorted(slices.Values(posted))), true
}

func without(from, remove []string) []string {
	return slices.DeleteFunc(slices.Clone(from), func(name string) bool { return slices.Contains(remove, name) })
}

func describeUpdate(name string, added, removed []string) string {
	changes := make([]string, 0, len(added)+len(removed))
	for _, attribute := range added {
		changes = append(changes, "+"+attribute)
	}
	for _, attribute := range removed {
		changes = append(changes, "-"+attribute)
	}
	if len(changes) == 0 {
		return name
	}
	return fmt.Sprintf("%s: %s", name, strings.Join(changes, ", "))
}

// HandleAccessGroupSave handles POST /housekeeping/access-groups/{id}. The change,
// its log row and the guard share one transaction.
func (r *Router) HandleAccessGroupSave(w http.ResponseWriter, req *http.Request) {
	group, ok := r.groupFromPath(w, req)
	if !ok {
		return
	}
	if err := req.ParseForm(); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	form, validLevel := readGroupForm(req)
	form.ID = group.ID
	refuse := func(message string) {
		page, err := r.newAccessGroupPage(req, group)
		if err != nil {
			r.fail(w, err)
			return
		}
		page.Group, page.Error = form, message
		w.WriteHeader(http.StatusUnprocessableEntity)
		astro.WriteTemplate(w, r.deps.Resolver, "access-groups/id.html", page)
	}
	if form.Name == "" {
		refuse(groupNameBlank)
		return
	}
	if !validLevel {
		refuse(levelInvalid)
		return
	}
	wanted, ok := knownAttributes(req.PostForm["attribute"])
	if !ok {
		refuse(groupUnknown)
		return
	}
	level, err := r.actorLevel(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	if group.Level > level || form.Level > level {
		if err := r.refused(req, group.Name, 0); err != nil {
			r.fail(w, err)
			return
		}
		if group.Level > level {
			refuse(groupAbove)
		} else {
			refuse(levelAbove)
		}
		return
	}

	var detail string
	err = r.inTx(req.Context(), func(q *store.Queries) error {
		ctx := req.Context()
		held, err := q.ListAccessGroupAttributes(ctx, group.ID)
		if err != nil {
			return err
		}
		added, removed := without(wanted, held), without(held, wanted)
		sameFields := form.Name == group.Name && form.Description == group.Description && form.StaffListed == group.StaffListed && form.Level == group.Level
		if sameFields && len(added) == 0 && len(removed) == 0 {
			return nil
		}
		detail = describeUpdate(form.Name, added, removed)

		err = q.UpdateAccessGroup(ctx, store.UpdateAccessGroupParams{
			ID:          group.ID,
			Name:        form.Name,
			Description: form.Description,
			StaffListed: form.StaffListed,
			Level:       form.Level,
			UpdatedAt:   time.Now().UTC(),
		})
		if err != nil {
			return err
		}
		for _, attribute := range added {
			if err := q.AddAccessGroupAttribute(ctx, store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: attribute}); err != nil {
				return err
			}
		}
		for _, attribute := range removed {
			if err := q.RemoveAccessGroupAttribute(ctx, store.RemoveAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: attribute}); err != nil {
				return err
			}
		}
		if err := keepManager(ctx, q); err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionGroupsUpdate, detail: detail})
	})
	switch {
	case errors.Is(err, errLastManager):
		if err := r.refused(req, detail, 0); err != nil {
			r.fail(w, err)
			return
		}
		refuse(lastManager)
	case store.IsConflict(err):
		refuse(groupNameTaken)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, groupPath(group.ID)+"?saved=1", http.StatusSeeOther)
	}
}

// HandleAccessGroupDelete handles POST /housekeeping/access-groups/{id}/delete. The
// group's attributes and memberships go with it, so the guard runs in the same
// transaction.
func (r *Router) HandleAccessGroupDelete(w http.ResponseWriter, req *http.Request) {
	group, ok := r.groupFromPath(w, req)
	if !ok {
		return
	}
	if req.PostFormValue("confirm") == "" {
		r.refuseMember(w, req, group, groupNotTicked)
		return
	}
	level, err := r.actorLevel(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	if group.Level > level {
		if err := r.refused(req, group.Name, 0); err != nil {
			r.fail(w, err)
			return
		}
		r.refuseMember(w, req, group, groupAbove)
		return
	}

	err = r.inTx(req.Context(), func(q *store.Queries) error {
		if err := q.DeleteAccessGroup(req.Context(), group.ID); err != nil {
			return err
		}
		if err := keepManager(req.Context(), q); err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionGroupsDelete, detail: group.Name})
	})
	switch {
	case errors.Is(err, errLastManager):
		if err := r.refused(req, group.Name, 0); err != nil {
			r.fail(w, err)
			return
		}
		r.refuseMember(w, req, group, lastManager)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/housekeeping/access-groups?deleted=1", http.StatusSeeOther)
	}
}
