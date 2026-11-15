package router

import (
	"context"
	"database/sql"
	"encoding/json/v2"
	"fmt"
	"html/template"
	"net/http"
	"slices"
	"strconv"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/bbcode"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// The playground of a home, wide for club owners, and the most a request carries.
const (
	playgroundWidth  = 922
	playgroundHeight = 1360
	maxZ             = 1_000_000
	maxEditBody      = 1 << 18
)

// Where store.php put what it placed. A note always went to the same height, and
// widget_add.php put a widget a little further in.
const (
	placedX = 10
	placedY = 10
	noteZ   = 18
	widgetX = 20
	widgetY = 20
)

// The profile widget, and a group's Group information widget, come back where
// Holo wrote them when anyone viewed a home without one.
const (
	profileX = 25
	profileY = 25
	profileZ = 5
)

const (
	homeFull     = "This home cannot hold more than %d items."
	homeTooFew   = "You do not have this item in your inventory."
	homeBadSkin  = "This skin is not available."
	homeBadPlace = "Items must stay on the playground."
	homeBadNote  = "Your note is too long."
	homeNotThere = "This item is not on this home."
	backgroundNo = "You do not have this background in your inventory."
)

// skins are Holo's, with who may use the ones not everyone can.
var skins = []string{"defaultskin", "speechbubbleskin", "metalskin", "noteitskin", "notepadskin", "goldenskin"}

var (
	clubSkins  = []string{"hc_machineskin", "hc_pillowskin"}
	staffSkins = []string{"nakedskin"}
)

type editError struct {
	Error string `json:"error"`
}

// ownHome loads the home of the path for those who may edit it: a habbo's home for
// the user who owns the habbo, whichever of their habbos is active (0065), and a
// group's for the admins while that habbo is active (0086). Anyone else gets 403,
// and a home that does not exist, or one whose habbo is archived, 404.
func (r *Router) ownHome(w http.ResponseWriter, req *http.Request) (store.Home, bool) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return store.Home{}, false
	}
	home, err := r.deps.Queries.GetHome(ctx, id)
	if store.IsNotFound(err) {
		http.NotFound(w, req)
		return home, false
	}
	if err != nil {
		r.fail(w, err)
		return home, false
	}
	if home.GroupID.Valid {
		admin, err := r.isGroupAdmin(ctx, home.GroupID.Int64, session.AvatarID)
		switch {
		case err != nil:
			r.fail(w, err)
			return home, false
		case !admin:
			r.answerJSON(w, http.StatusForbidden, editError{http.StatusText(http.StatusForbidden)})
			return home, false
		}
		return home, true
	}
	habbo, err := r.deps.Queries.GetHomeHabbo(ctx, id)
	switch {
	case store.IsNotFound(err) || (err == nil && habbo.ArchivedAt.Valid):
		http.NotFound(w, req)
		return home, false
	case err != nil:
		r.fail(w, err)
		return home, false
	case habbo.UserID != session.UserID:
		r.answerJSON(w, http.StatusForbidden, editError{http.StatusText(http.StatusForbidden)})
		return home, false
	}
	return home, true
}

// inClub reports whether userID has club now, reading the club as clubDays does.
func (r *Router) inClub(ctx context.Context, userID int64) (bool, error) {
	days, err := r.clubDays(ctx, userID, time.Now().UTC())
	return days > 0, err
}

// skinAllowed reports whether the user making the request may use skin: club skins
// take club, as Holo's menu showed them, and the staff skin homes.staffItems.
func (r *Router) skinAllowed(ctx context.Context, skin string) (bool, error) {
	session, _ := auth.FromContext(ctx)
	switch {
	case slices.Contains(skins, skin):
		return true, nil
	case slices.Contains(clubSkins, skin):
		return r.inClub(ctx, session.UserID)
	case slices.Contains(staffSkins, skin):
		return r.holds(ctx, auth.HomesStaffItems), nil
	}
	return false, nil
}

func readEdit(w http.ResponseWriter, req *http.Request, body any) bool {
	if err := json.UnmarshalRead(http.MaxBytesReader(w, req.Body, maxEditBody), body); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return false
	}
	return true
}

// placed is one item as the editor draws it.
type placed struct {
	ID     int64         `json:"id"`
	Kind   string        `json:"kind"`
	Widget string        `json:"widget,omitempty"`
	X      int64         `json:"x"`
	Y      int64         `json:"y"`
	Z      int64         `json:"z"`
	Image  string        `json:"image,omitempty"`
	Skin   string        `json:"skin,omitempty"`
	HTML   template.HTML `json:"html,omitempty"`
}

type placeBody struct {
	Kind   string `json:"kind"`
	Item   int64  `json:"item"`
	Widget string `json:"widget"`
	All    bool   `json:"all"`
	Z      int64  `json:"z"`
	Skin   string `json:"skin"`
	Text   string `json:"text"`
}

// homeWidgets are the widgets the inventory's Widgets tab offers a home, once
// each, as store.php did: Group Members on a group's home, and MY GROUPS on a
// habbo's.
func homeWidgets(home store.Home) []string {
	if home.GroupID.Valid {
		return []string{widgetMembers}
	}
	return []string{widgetGroups}
}

// HandleHomesItemsPlace handles POST /homes/{id}/items: a sticker, or all of that
// sticker, or a note with its text, leaves the user's inventory for the home, as
// store.php's place_sticker and noteeditor-place did, or a widget the home may
// take goes on it, as widget_add.php.
func (r *Router) HandleHomesItemsPlace(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	home, ok := r.ownHome(w, req)
	if !ok {
		return
	}
	var body placeBody
	if !readEdit(w, req, &body) {
		return
	}
	if body.Kind == "widget" {
		r.placeWidget(w, req, home, body)
		return
	}
	session, _ := auth.FromContext(ctx)
	item, err := r.deps.Queries.GetHomeStoreItem(ctx, body.Item)
	if err != nil && !store.IsNotFound(err) {
		r.fail(w, err)
		return
	}
	if err != nil || item.Kind != body.Kind || (item.Kind != "sticker" && item.Kind != "note") {
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeTooFew})
		return
	}
	if body.Z < 0 || body.Z > maxZ {
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeBadPlace})
		return
	}
	if item.Kind == "note" {
		allowed, err := r.skinAllowed(ctx, body.Skin)
		if err != nil {
			r.fail(w, err)
			return
		}
		if !allowed {
			r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeBadSkin})
			return
		}
		if utf8.RuneCountInString(body.Text) > settings.GetInt("homes.noteMaxLength") {
			r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeBadNote})
			return
		}
	}

	limit := int64(settings.GetInt("homes.maxItems"))
	refusal := ""
	var created []placed
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		count := int64(1)
		if item.Kind == "sticker" && body.All {
			held, err := q.GetHomeInventoryQuantity(ctx, store.GetHomeInventoryQuantityParams{UserID: session.UserID, HomeStoreItemID: item.ID})
			if err != nil && !store.IsNotFound(err) {
				return err
			}
			count = max(held, 1)
		}
		total, err := q.CountHomeItems(ctx, home.ID)
		if err != nil {
			return err
		}
		if total+count > limit {
			refusal = fmt.Sprintf(homeFull, limit)
			return nil
		}
		taken, err := q.TakeHomeInventory(ctx, store.TakeHomeInventoryParams{UserID: session.UserID, HomeStoreItemID: item.ID, Quantity: count})
		if err != nil {
			return err
		}
		if taken == 0 {
			refusal = homeTooFew
			return nil
		}
		for range count {
			row := store.CreateHomeItemParams{
				HomeID:            home.ID,
				Kind:              item.Kind,
				HomeStoreItemID:   sql.NullInt64{Int64: item.ID, Valid: true},
				X:                 placedX,
				Y:                 placedY,
				Z:                 body.Z,
				CreatedByAvatarID: sql.NullInt64{Int64: session.AvatarID, Valid: true},
				CreatedAt:         now,
				UpdatedAt:         now,
			}
			if item.Kind == "note" {
				row.Skin, row.Body, row.Z = body.Skin, body.Text, noteZ
			}
			placedItem, err := q.CreateHomeItem(ctx, row)
			if err != nil {
				return err
			}
			created = append(created, r.drawn(placedItem, item.Asset))
		}
		return nil
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{refusal})
	default:
		r.answerJSON(w, http.StatusOK, created)
	}
}

// placeWidget puts one of the home's widgets on it where widget_add.php did, if it
// is not there yet. The editor greys out a placed widget, so a refusal answers
// only a request it would not send.
func (r *Router) placeWidget(w http.ResponseWriter, req *http.Request, home store.Home, body placeBody) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	if !slices.Contains(homeWidgets(home), body.Widget) {
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeTooFew})
		return
	}
	if body.Z < 0 || body.Z > maxZ {
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeBadPlace})
		return
	}
	limit := int64(settings.GetInt("homes.maxItems"))
	refusal := ""
	var item store.HomeItem
	now := time.Now().UTC()
	err := r.inTx(ctx, func(q *store.Queries) error {
		there, err := q.CountHomeWidgets(ctx, store.CountHomeWidgetsParams{HomeID: home.ID, Widget: sql.NullString{String: body.Widget, Valid: true}})
		if err != nil {
			return err
		}
		if there > 0 {
			refusal = homeTooFew
			return nil
		}
		total, err := q.CountHomeItems(ctx, home.ID)
		if err != nil {
			return err
		}
		if total+1 > limit {
			refusal = fmt.Sprintf(homeFull, limit)
			return nil
		}
		item, err = q.CreateHomeItem(ctx, store.CreateHomeItemParams{
			HomeID:            home.ID,
			Kind:              "widget",
			Widget:            sql.NullString{String: body.Widget, Valid: true},
			Skin:              "defaultskin",
			X:                 widgetX,
			Y:                 widgetY,
			Z:                 body.Z,
			CreatedByAvatarID: sql.NullInt64{Int64: session.AvatarID, Valid: true},
			CreatedAt:         now,
			UpdatedAt:         now,
		})
		return err
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{refusal})
	default:
		r.answerJSON(w, http.StatusOK, []placed{r.drawn(item, "")})
	}
}

// drawn is item as the editor draws it; asset is its store item's art.
func (r *Router) drawn(item store.HomeItem, asset string) placed {
	out := placed{ID: item.ID, Kind: item.Kind, Widget: item.Widget.String, X: item.X, Y: item.Y, Z: item.Z, Skin: item.Skin}
	switch item.Kind {
	case "sticker":
		out.Image = image(asset)
	case "note":
		out.HTML = bbcode.Format(item.Body, settings.GetBool("features.smilies"))
	}
	return out
}
