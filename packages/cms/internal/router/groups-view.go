package router

import (
	"context"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// dateFull is Holo's $date_full, which it wrote for a group's creation.
const dateFull = "02-01-2006 15:04:05"

const (
	accessExclusive = "moderated"
	accessPrivate   = "closed"
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
	// Wide is always true: Holo gave group homes the wide playground and no club
	// banner.
	Wide    bool
	Items   []homeItem
	Info    groupInfo
	Members []groupMember
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
	page, err := r.newGroupPage(ctx, group)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "groups/id.html", page)
}

// HandleGroupsSearch handles GET /groups?name=, the Search for group of a
// missing group's page (0095): the group with exactly that name, ignoring case.
func (r *Router) HandleGroupsSearch(w http.ResponseWriter, req *http.Request) {
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
		NameMax:   settings.GetInt("groups.nameMaxLength"),
	})
}

func (r *Router) newGroupPage(ctx context.Context, group store.Group) (groupPage, error) {
	q := r.deps.Queries
	shared, err := r.community(ctx)
	if err != nil {
		return groupPage{}, err
	}
	page := groupPage{
		community:  shared,
		ImagingURL: settings.GetString("imaging.avatarUrl"),
		GroupID:    group.ID,
		Group:      group.Name,
		Exclusive:  group.Access == accessExclusive,
		Private:    group.Access == accessPrivate,
		Wide:       true,
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

	if page.Items, err = r.homeItems(ctx, home.ID); err != nil {
		return page, err
	}
	return page, nil
}
