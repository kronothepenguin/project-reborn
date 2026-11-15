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
	MyPage  bool
	CanEdit bool
	Owner   string
	// OwnerPath is Owner escaped for an address, since a name may hold ?.
	OwnerPath  string
	HomeID     int64
	Background string
	// BackgroundID is the store item of the background, 0 for Holo's default.
	BackgroundID int64
	// Wide is a home whose owner has club: no club banner, a wider playground.
	Wide    bool
	Items   []homeItem
	Profile profileWidget
	// Groups fill the MY GROUPS widget: the habbo's groups, in the order it asked
	// to join them, as user_profile.php listed them.
	Groups []homeGroup
}

// homeGroup is one group of the MY GROUPS widget, with quickmenu.php's marks.
type homeGroup struct {
	ID        int64
	Name      string
	Badge     string
	Created   string
	Favourite bool
	Admin     bool
	Owner     bool
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
	// Foreign is a sticker or note another user's habbo placed, which the edit
	// menu warns will go back to them (0083).
	Foreign bool
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
	// Group is the favourite group, 0 for none, whose badge leads to it.
	Group      int64
	GroupBadge string
}

type homeMissingPage struct {
	community
}

// HandleHomeSearchView handles GET /home, the header's habbo search: it opens the
// home of the habbo named, and without a name the page Holo showed for no habbo.
func (r *Router) HandleHomeSearchView(w http.ResponseWriter, req *http.Request) {
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
		OwnerPath:  url.PathEscape(avatar.Name),
	}
	home, err := q.GetProfileHome(ctx, avatar.ID)
	if err != nil {
		return page, err
	}
	page.HomeID = home.ID
	if page.Background, page.BackgroundID, err = r.homeBackground(ctx, home); err != nil {
		return page, err
	}
	if page.Wide, err = r.inClub(ctx, avatar.UserID); err != nil {
		return page, err
	}
	if page.Profile, err = r.profileWidget(ctx, avatar, home.ProfileID.Int64); err != nil {
		return page, err
	}
	page.Profile.Own = page.MyPage

	if page.Items, err = r.homeItems(ctx, home.ID, 0); err != nil {
		return page, err
	}
	if page.Groups, err = r.homeGroups(ctx, avatar.ID); err != nil {
		return page, err
	}
	return page, nil
}

// homeGroups are the habbo's groups for its MY GROUPS widget.
func (r *Router) homeGroups(ctx context.Context, avatarID int64) ([]homeGroup, error) {
	rows, err := r.deps.Queries.ListAvatarGroups(ctx, avatarID)
	if err != nil {
		return nil, err
	}
	groups := make([]homeGroup, 0, len(rows))
	for _, row := range rows {
		owner := row.OwnerAvatarID == avatarID
		admin := row.Role == roleAdmin
		groups = append(groups, homeGroup{
			ID:        row.ID,
			Name:      row.Name,
			Badge:     row.Badge,
			Created:   row.CreatedAt.UTC().Format(dateFull),
			Favourite: row.Favourite,
			Admin:     admin && !owner,
			Owner:     owner,
		})
	}
	return groups, nil
}

// homeBackground is the art of a home's background and its store item, or Holo's
// default and 0.
func (r *Router) homeBackground(ctx context.Context, home store.Home) (string, int64, error) {
	if !home.BackgroundHomeStoreItemID.Valid {
		return image(defaultBackground), 0, nil
	}
	background, err := r.deps.Queries.GetHomeStoreItem(ctx, home.BackgroundHomeStoreItemID.Int64)
	if err != nil {
		return "", 0, err
	}
	return image(background.Asset), background.ID, nil
}

// homeItems are a home's items as the page draws them: a sticker with its art and
// a note in BBCode. editor is the user editing the home, 0 when nobody is.
func (r *Router) homeItems(ctx context.Context, homeID, editor int64) ([]homeItem, error) {
	rows, err := r.deps.Queries.ListHomeItemsToDraw(ctx, homeID)
	if err != nil {
		return nil, err
	}
	smilies := settings.GetBool("features.smilies")
	items := make([]homeItem, 0, len(rows))
	for _, it := range rows {
		item := homeItem{ID: it.ID, Kind: it.Kind, Widget: it.Widget.String, Skin: it.Skin, X: it.X, Y: it.Y, Z: it.Z}
		item.Foreign = editor != 0 && it.Kind != "widget" && it.PlacerUserID != 0 && it.PlacerUserID != editor
		switch it.Kind {
		case "sticker":
			item.Image = image(it.Asset)
		case "note":
			item.HTML = bbcode.Format(it.Body, smilies)
		}
		items = append(items, item)
	}
	return items, nil
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
	favourite, err := q.GetFavouriteGroup(ctx, avatar.ID)
	switch {
	case err == nil:
		widget.Group, widget.GroupBadge = favourite.ID, favourite.Badge
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

// skinOptions are the skins of labels the user making the request may pick.
func (r *Router) skinOptions(ctx context.Context, labels []skinOption) ([]skinOption, error) {
	var options []skinOption
	for _, skin := range labels {
		allowed, err := r.skinAllowed(ctx, skin.Value)
		if err != nil {
			return nil, err
		}
		if allowed {
			options = append(options, skin)
		}
	}
	return options, nil
}
