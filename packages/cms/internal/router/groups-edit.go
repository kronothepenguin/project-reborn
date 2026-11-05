package router

import (
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// groupSkinLabels are the skins in the order of group_profile.php's edit menu,
// which differs from a habbo home's.
var groupSkinLabels = []skinOption{
	{"defaultskin", "Default"},
	{"goldenskin", "Golden"},
	{"hc_pillowskin", "HC Bling"},
	{"hc_machineskin", "HC Scifi"},
	{"nakedskin", "Staff - Naked Skin"},
	{"metalskin", "Metal"},
	{"notepadskin", "Notepad"},
	{"speechbubbleskin", "Speech Bubble"},
	{"noteitskin", "Stickie Note"},
}

type groupEditPage struct {
	groupPage
	Skins   []skinOption
	NoteMax int
	Smilies bool
	// NewMembers is the Group Members widget where widget_add.php put it, which
	// the editor copies when an admin places it.
	NewMembers homeItem
}

// HandleGroupsEditView handles GET /groups/{id}/edit, group_profile.php's edit
// mode, for the group's admins while the habbo holding the role is active (0086).
// Anyone else goes to the group's page, as Holo bounced them.
func (r *Router) HandleGroupsEditView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
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
	admin, err := r.isGroupAdmin(ctx, group.ID, session.AvatarID)
	switch {
	case err != nil:
		r.fail(w, err)
		return
	case !admin:
		http.Redirect(w, req, "/groups/"+strconv.FormatInt(group.ID, 10), http.StatusSeeOther)
		return
	}
	page, err := r.newGroupPage(ctx, group, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	edit := groupEditPage{
		groupPage:  page,
		NoteMax:    settings.GetInt("homes.noteMaxLength"),
		Smilies:    settings.GetBool("features.smilies"),
		NewMembers: homeItem{Kind: "widget", Widget: widgetMembers, Skin: "defaultskin", X: widgetX, Y: widgetY},
	}
	if edit.Skins, err = r.skinOptions(ctx, groupSkinLabels); err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "groups/id/edit.html", edit)
}
