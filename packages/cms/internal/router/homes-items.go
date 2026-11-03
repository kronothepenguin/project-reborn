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

// Where store.php put what it placed. A note always went to the same height.
const (
	placedX = 10
	placedY = 10
	noteZ   = 18
)

// The profile widget comes back where Holo wrote it when anyone viewed a home
// without one.
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

// ownHome loads the home of the path for its owner: the user who owns its habbo,
// whichever of their habbos is active (0065). Anyone else gets 403, and a home
// that does not exist, a group's, or one whose habbo is archived, 404.
func (r *Router) ownHome(w http.ResponseWriter, req *http.Request) (store.Home, store.Avatar, bool) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return store.Home{}, store.Avatar{}, false
	}
	home, err := r.deps.Queries.GetHome(ctx, id)
	if store.IsNotFound(err) {
		http.NotFound(w, req)
		return home, store.Avatar{}, false
	}
	if err != nil {
		r.fail(w, err)
		return home, store.Avatar{}, false
	}
	habbo, err := r.deps.Queries.GetHomeHabbo(ctx, id)
	switch {
	case store.IsNotFound(err) || (err == nil && habbo.ArchivedAt.Valid):
		http.NotFound(w, req)
		return home, habbo, false
	case err != nil:
		r.fail(w, err)
		return home, habbo, false
	case habbo.UserID != session.UserID:
		r.answerJSON(w, http.StatusForbidden, editError{http.StatusText(http.StatusForbidden)})
		return home, habbo, false
	}
	return home, habbo, true
}

// inClub reports whether userID has club now.
func (r *Router) inClub(ctx context.Context, userID int64) (bool, error) {
	_, err := r.deps.Queries.GetClubEnd(ctx, store.GetClubEndParams{UserID: userID, Now: time.Now().UTC()})
	if store.IsNotFound(err) {
		return false, nil
	}
	return err == nil, err
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
	ID    int64         `json:"id"`
	Kind  string        `json:"kind"`
	X     int64         `json:"x"`
	Y     int64         `json:"y"`
	Z     int64         `json:"z"`
	Image string        `json:"image,omitempty"`
	Skin  string        `json:"skin,omitempty"`
	HTML  template.HTML `json:"html,omitempty"`
}

type placeBody struct {
	Kind string `json:"kind"`
	Item int64  `json:"item"`
	All  bool   `json:"all"`
	Z    int64  `json:"z"`
	Skin string `json:"skin"`
	Text string `json:"text"`
}

// HandleHomesItemsPlace handles POST /homes/{id}/items: a sticker, or all of that
// sticker, or a note with its text, leaves the user's inventory for the home, as
// store.php's place_sticker and noteeditor-place did.
func (r *Router) HandleHomesItemsPlace(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	home, _, ok := r.ownHome(w, req)
	if !ok {
		return
	}
	var body placeBody
	if !readEdit(w, req, &body) {
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

// drawn is item as the editor draws it; asset is its store item's art.
func (r *Router) drawn(item store.HomeItem, asset string) placed {
	out := placed{ID: item.ID, Kind: item.Kind, X: item.X, Y: item.Y, Z: item.Z, Skin: item.Skin}
	switch item.Kind {
	case "sticker":
		out.Image = image(asset)
	case "note":
		out.HTML = bbcode.Format(item.Body, settings.GetBool("features.smilies"))
	}
	return out
}

type skinBody struct {
	Skin string `json:"skin"`
}

// HandleHomesItemsSkin handles POST /homes/{id}/items/{item}/skin, for notes and
// widgets, as edit_stickie.php and edit_widget.php.
func (r *Router) HandleHomesItemsSkin(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	home, _, ok := r.ownHome(w, req)
	if !ok {
		return
	}
	itemID, err := strconv.ParseInt(req.PathValue("item"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	var body skinBody
	if !readEdit(w, req, &body) {
		return
	}
	item, err := r.deps.Queries.GetHomeItem(ctx, store.GetHomeItemParams{ID: itemID, HomeID: home.ID})
	switch {
	case store.IsNotFound(err) || (err == nil && item.Kind == "sticker"):
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeNotThere})
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	allowed, err := r.skinAllowed(ctx, body.Skin)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeBadSkin})
		return
	}
	_, err = r.deps.Queries.SkinHomeItem(ctx, store.SkinHomeItemParams{ID: item.ID, HomeID: home.ID, Skin: body.Skin, UpdatedAt: time.Now().UTC()})
	if err != nil {
		r.fail(w, err)
		return
	}
	item.Skin = body.Skin
	r.answerJSON(w, http.StatusOK, r.drawn(item, ""))
}

// HandleHomesItemsDelete handles POST /homes/{id}/items/{item}/delete: a sticker
// goes back to the user's inventory and a note is gone, as in Holo. Holo also let
// the profile widget go, and wrote it again in its corner the next time anyone
// looked, so here it goes straight back there.
func (r *Router) HandleHomesItemsDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	home, _, ok := r.ownHome(w, req)
	if !ok {
		return
	}
	itemID, err := strconv.ParseInt(req.PathValue("item"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	session, _ := auth.FromContext(ctx)
	missing := false
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		item, err := q.GetHomeItem(ctx, store.GetHomeItemParams{ID: itemID, HomeID: home.ID})
		if store.IsNotFound(err) {
			missing = true
			return nil
		}
		if err != nil {
			return err
		}
		if item.Kind == "widget" && item.Widget.String == "profile" {
			if _, err := q.SkinHomeItem(ctx, store.SkinHomeItemParams{ID: item.ID, HomeID: home.ID, Skin: "defaultskin", UpdatedAt: now}); err != nil {
				return err
			}
			_, err := q.MoveHomeItem(ctx, store.MoveHomeItemParams{ID: item.ID, HomeID: home.ID, X: profileX, Y: profileY, Z: profileZ, UpdatedAt: now})
			return err
		}
		if _, err := q.DeleteHomeItem(ctx, store.DeleteHomeItemParams{ID: item.ID, HomeID: home.ID}); err != nil {
			return err
		}
		if item.Kind != "sticker" || !item.HomeStoreItemID.Valid {
			return nil
		}
		return q.AddHomeInventory(ctx, store.AddHomeInventoryParams{UserID: session.UserID, HomeStoreItemID: item.HomeStoreItemID.Int64, Quantity: 1})
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case missing:
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeNotThere})
	default:
		r.answerJSON(w, http.StatusOK, struct{}{})
	}
}

type layoutItem struct {
	ID int64 `json:"id"`
	X  int64 `json:"x"`
	Y  int64 `json:"y"`
	Z  int64 `json:"z"`
}

type layoutBody struct {
	Items      []layoutItem `json:"items"`
	Background int64        `json:"background"`
}

// HandleHomesLayout handles POST /homes/{id}/layout, savehome.php: the places of
// the items and the background, all or nothing. A background is one the user
// holds, or 0 for Holo's default.
func (r *Router) HandleHomesLayout(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	home, _, ok := r.ownHome(w, req)
	if !ok {
		return
	}
	var body layoutBody
	if !readEdit(w, req, &body) {
		return
	}
	for _, it := range body.Items {
		if it.X < 0 || it.X > playgroundWidth || it.Y < 0 || it.Y > playgroundHeight || it.Z < 0 || it.Z > maxZ {
			r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeBadPlace})
			return
		}
	}
	session, _ := auth.FromContext(ctx)
	refusal := ""
	now := time.Now().UTC()
	err := r.inTx(ctx, func(q *store.Queries) error {
		background := sql.NullInt64{}
		if body.Background != 0 {
			item, err := q.GetHomeStoreItem(ctx, body.Background)
			if err != nil && !store.IsNotFound(err) {
				return err
			}
			held, heldErr := q.GetHomeInventoryQuantity(ctx, store.GetHomeInventoryQuantityParams{UserID: session.UserID, HomeStoreItemID: body.Background})
			if heldErr != nil && !store.IsNotFound(heldErr) {
				return heldErr
			}
			if err != nil || item.Kind != "background" || held < 1 {
				refusal = backgroundNo
				return nil
			}
			background = sql.NullInt64{Int64: item.ID, Valid: true}
		}
		if err := q.SetHomeBackground(ctx, store.SetHomeBackgroundParams{ID: home.ID, BackgroundHomeStoreItemID: background, UpdatedAt: now}); err != nil {
			return err
		}
		for _, it := range body.Items {
			_, err := q.MoveHomeItem(ctx, store.MoveHomeItemParams{ID: it.ID, HomeID: home.ID, X: it.X, Y: it.Y, Z: it.Z, UpdatedAt: now})
			if err != nil {
				return err
			}
		}
		return nil
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{refusal})
	default:
		r.answerJSON(w, http.StatusOK, struct{}{})
	}
}
