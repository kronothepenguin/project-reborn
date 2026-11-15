package router

import (
	"net/http"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// skinLabels are the skins in the order and words of Holo's edit menu.
var skinLabels = []skinOption{
	{"defaultskin", "Default"},
	{"goldenskin", "Golden"},
	{"metalskin", "Metal"},
	{"notepadskin", "Notepad"},
	{"speechbubbleskin", "Speech Bubble"},
	{"noteitskin", "Stickie Note"},
	{"hc_pillowskin", "HC Bling"},
	{"hc_machineskin", "HC Scifi"},
	{"nakedskin", "Staff - Naked Skin"},
}

type homeEditPage struct {
	homePage
	Skins   []skinOption
	NoteMax int
	Smilies bool
	// NewGroups is the MY GROUPS widget where widget_add.php put it, which the
	// editor copies when the owner places it.
	NewGroups homeItem
}

// HandleHomeEditView handles GET /home/{name}/edit, Holo's edit mode, for the
// owner of the habbo whichever habbo is active (0065). Anyone else goes to the
// home, as Holo bounced them.
func (r *Router) HandleHomeEditView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	name := req.PathValue("name")
	avatar, err := r.deps.Queries.GetAvatarByName(ctx, name)
	switch {
	case store.IsNotFound(err) || (err == nil && avatar.ArchivedAt.Valid):
		r.homeMissing(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	case avatar.UserID != session.UserID:
		http.Redirect(w, req, "/home/"+url.PathEscape(avatar.Name), http.StatusSeeOther)
		return
	}
	home, err := r.newHomePage(ctx, avatar)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := homeEditPage{
		homePage:  home,
		NoteMax:   settings.GetInt("homes.noteMaxLength"),
		Smilies:   settings.GetBool("features.smilies"),
		NewGroups: homeItem{Kind: "widget", Widget: widgetGroups, Skin: "defaultskin", X: widgetX, Y: widgetY},
	}
	if page.Skins, err = r.skinOptions(ctx, skinLabels); err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "home/name/edit.html", page)
}
