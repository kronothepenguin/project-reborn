package router

import (
	"context"
	"html/template"
	"net/http"
	"net/url"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/bbcode"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// defaultBackground is the background of a home without one, as in Holo.
const defaultBackground = "c_images/backgrounds2/bg_pattern_abstract2.gif"

// createdFormat is Holo's hbirth, the date a habbo registered.
const createdFormat = "02-01-2006"

type homePage struct {
	community
	ImagingURL string
	// MyPage is the active habbo's own home, under the Me tab; any other home is
	// under Community, as Holo told myprofile from profile.
	MyPage     bool
	CanEdit    bool
	Owner      string
	HomeID     int64
	Background string
	// BackgroundID is the store item of the background, 0 for Holo's default.
	BackgroundID int64
	// Wide is a home whose owner has club: no club banner, a wider playground.
	Wide    bool
	Items   []homeItem
	Profile profileWidget
}

type homeItem struct {
	ID     int64
	Kind   string
	Widget string
	Skin   string
	X      int64
	Y      int64
	Z      int64
	Image  string
	HTML   template.HTML
}

type profileWidget struct {
	Name    string
	Figure  string
	Motto   string
	Created string
	Badge   string
	Tags    []string
	// Own is the active habbo's own profile, whose tags it may remove; other
	// habbos may add them to theirs.
	Own bool
}

type homeMissingPage struct {
	community
}

// HandleHomeSearch handles GET /home, the header's habbo search: it opens the
// home of the habbo named, and without a name the page Holo showed for no habbo.
func (r *Router) HandleHomeSearch(w http.ResponseWriter, req *http.Request) {
	name := strings.TrimSpace(req.URL.Query().Get("name"))
	if name == "" {
		r.homeMissing(w, req)
		return
	}
	http.Redirect(w, req, "/home/"+url.PathEscape(name), http.StatusSeeOther)
}

func (r *Router) homeMissing(w http.ResponseWriter, req *http.Request) {
	page, err := r.community(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	w.WriteHeader(http.StatusNotFound)
	astro.WriteTemplate(w, r.deps.Resolver, "home/not-found.html", homeMissingPage{community: page})
}

// HandleHomeView handles GET /home/{name}, user_profile.php. Anyone reads a home.
// An archived habbo has none, and a banned user's habbos show Holo's page for it.
func (r *Router) HandleHomeView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	avatar, err := r.deps.Queries.GetAvatarByName(ctx, req.PathValue("name"))
	switch {
	case store.IsNotFound(err) || (err == nil && avatar.ArchivedAt.Valid):
		r.homeMissing(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	ban, err := auth.ActiveBan(ctx, r.deps.DB, avatar.UserID, "")
	if err != nil {
		r.fail(w, err)
		return
	}
	if ban != nil {
		page, err := r.community(ctx)
		if err != nil {
			r.fail(w, err)
			return
		}
		astro.WriteTemplate(w, r.deps.Resolver, "home/banned.html", homeMissingPage{community: page})
		return
	}
	page, err := r.newHomePage(ctx, avatar)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "home/name.html", page)
}

func (r *Router) newHomePage(ctx context.Context, avatar store.Avatar) (homePage, error) {
	q := r.deps.Queries
	shared, err := r.community(ctx)
	if err != nil {
		return homePage{}, err
	}
	session, _ := auth.FromContext(ctx)
	page := homePage{
		community:  shared,
		ImagingURL: settings.GetString("imaging.avatarUrl"),
		MyPage:     shared.SignedIn && session.AvatarID == avatar.ID,
		CanEdit:    shared.SignedIn && session.UserID == avatar.UserID,
		Owner:      avatar.Name,
		Background: image(defaultBackground),
	}
	home, err := q.GetProfileHome(ctx, avatar.ID)
	if err != nil {
		return page, err
	}
	page.HomeID = home.ID
	if home.BackgroundHomeStoreItemID.Valid {
		background, err := q.GetHomeStoreItem(ctx, home.BackgroundHomeStoreItemID.Int64)
		if err != nil {
			return page, err
		}
		page.Background = image(background.Asset)
		page.BackgroundID = background.ID
	}
	if page.Wide, err = r.inClub(ctx, avatar.UserID); err != nil {
		return page, err
	}
	if page.Profile, err = r.profileWidget(ctx, avatar, home.ProfileID.Int64); err != nil {
		return page, err
	}
	page.Profile.Own = page.MyPage

	items, err := q.ListHomeItemsToDraw(ctx, home.ID)
	if err != nil {
		return page, err
	}
	smilies := settings.GetBool("features.smilies")
	for _, it := range items {
		item := homeItem{ID: it.ID, Kind: it.Kind, Widget: it.Widget.String, Skin: it.Skin, X: it.X, Y: it.Y, Z: it.Z}
		switch it.Kind {
		case "sticker":
			item.Image = image(it.Asset)
		case "note":
			item.HTML = bbcode.Format(it.Body, smilies)
		}
		page.Items = append(page.Items, item)
	}
	return page, nil
}

func (r *Router) profileWidget(ctx context.Context, avatar store.Avatar, profileID int64) (profileWidget, error) {
	q := r.deps.Queries
	widget := profileWidget{
		Name:    avatar.Name,
		Figure:  avatar.Figure,
		Motto:   avatar.Motto,
		Created: avatar.CreatedAt.UTC().Format(createdFormat),
	}
	badge, err := q.GetWornAvatarBadge(ctx, avatar.ID)
	switch {
	case err == nil:
		widget.Badge = image("c_images/album1584/" + badge.Code + ".gif")
	case !store.IsNotFound(err):
		return widget, err
	}
	if widget.Tags, err = q.ListProfileTags(ctx, profileID); err != nil {
		return widget, err
	}
	return widget, nil
}

// skinOption is one skin of Holo's edit menu.
type skinOption struct {
	Value string
	Label string
}

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
	page := homeEditPage{homePage: home, NoteMax: settings.GetInt("homes.noteMaxLength")}
	for _, skin := range skinLabels {
		allowed, err := r.skinAllowed(ctx, skin.Value)
		if err != nil {
			r.fail(w, err)
			return
		}
		if allowed {
			page.Skins = append(page.Skins, skin)
		}
	}
	astro.WriteTemplate(w, r.deps.Resolver, "home/name/edit.html", page)
}
