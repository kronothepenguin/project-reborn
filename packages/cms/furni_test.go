package cms

import (
	"database/sql"
	"net/http"
	"net/url"
	"slices"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestTheFurniPageNeedsASession(t *testing.T) {
	_, mux := newSite(t)
	wantRedirect(t, serve(mux, "GET", "/account/furni", nil, nil), "/")
	wantRedirect(t, serve(mux, "POST", "/account/furni/take", nil, url.Values{}), "/")
}

// Archiving a habbo sends the furni of its hand and of its recycler to the user's shared inventory, ends its
// recycling and gives its rooms to the active habbo, furni in place (decision server/0124). The Furni page lists
// the shared furni a row a kind, and Take moves a kind, or all of it, to the active habbo's hand (decisions
// server/0122 and server/0123).
func TestArchivingSharesFurniAndTheFurniPageTakesIt(t *testing.T) {
	db, mux := newSite(t)
	cookie, second := habboWithSecond(t, db, mux)
	active := avatarID(t, db, "Newbie")
	q := store.New(db)
	ctx := t.Context()
	give := func(userID, definition int64, holder int64) store.Furni {
		t.Helper()
		f, err := q.CreateFurni(ctx, store.CreateFurniParams{
			FurniDefinitionID: definition, UserID: userID, AvatarID: sql.NullInt64{Int64: holder, Valid: holder != 0}, CreatedAt: testNow,
		})
		if err != nil {
			t.Fatalf("CreateFurni: %v", err)
		}
		return f
	}
	give(second.UserID, 1279, second.ID)
	give(second.UserID, 1279, second.ID)
	give(second.UserID, 1152, second.ID)
	own := give(second.UserID, 463, active)
	recycled := give(second.UserID, 1279, second.ID)
	if n, err := q.RecycleFurni(ctx, store.RecycleFurniParams{ID: recycled.ID, AvatarID: second.ID, MadeBefore: testNow.Add(time.Hour)}); err != nil || n != 1 {
		t.Fatalf("RecycleFurni = %d, %v", n, err)
	}
	if err := q.CreateRecycling(ctx, store.CreateRecyclingParams{AvatarID: second.ID, FurniDefinitionID: 463, StartedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO rooms (creator_avatar_id, owner_avatar_id, room_category_id, room_model_id, name, created_at, updated_at)
		VALUES (?, ?, (SELECT MIN(id) FROM room_categories), (SELECT MIN(id) FROM room_models), 'Attic', ?, ?)`, second.ID, second.ID, testNow, testNow); err != nil {
		t.Fatal(err)
	}
	room := int64(count(t, db, `SELECT id FROM rooms WHERE name = 'Attic'`))
	placed := give(second.UserID, 1152, second.ID)
	if n, err := q.PlaceFurni(ctx, store.PlaceFurniParams{ID: placed.ID, AvatarID: second.ID, RoomID: room, X: 5, Y: 5}); err != nil || n != 1 {
		t.Fatalf("PlaceFurni = %d, %v", n, err)
	}
	other := habbo(t, db, "other@example.com", "Other")
	theirs := give(other, 1152, 0)

	wantPage(t, serve(mux, "GET", "/account/furni", cookie, nil), http.StatusOK, "account/furni.html", "Habbo:Newbie", "Furni:[]")
	wantPage(t, serve(mux, "POST", archive(second.ID), cookie, yourPassword()), http.StatusOK, "Result:The habbo is archived.")

	if n := count(t, db, `SELECT COUNT(*) FROM recyclings`); n != 0 {
		t.Errorf("%d recyclings are left, want the archived habbo's ended", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM rooms WHERE id = ? AND owner_avatar_id = ? AND creator_avatar_id = ?`, room, active, second.ID); n != 1 {
		t.Error("the archived habbo's room is not the active habbo's, with its creator kept")
	}
	if n := count(t, db, `SELECT COUNT(*) FROM furnis WHERE id = ? AND room_id = ? AND x = 5`, placed.ID, room); n != 1 {
		t.Error("the furni of the archived habbo's room did not stay in place")
	}
	if n := count(t, db, `SELECT COUNT(*) FROM furnis WHERE avatar_id = ? OR recycler_avatar_id = ?`, second.ID, second.ID); n != 0 {
		t.Errorf("%d furni are still the archived habbo's", n)
	}

	const listed = "Furni:[{ID:1279 Name:Moon Lamp Amount:3} {ID:1152 Name:Throne Amount:1}]"
	wantPage(t, serve(mux, "GET", "/account/furni", cookie, nil), http.StatusOK, listed)
	lamps := url.Values{"furni": {"1279"}}
	wantPage(t, serve(mux, "POST", "/account/furni/take", cookie, lamps), http.StatusOK,
		"Result:3 furni moved to Newbie&#39;s hand.", "Failed:false", "Furni:[{ID:1152 Name:Throne Amount:1}]")
	for _, none := range []url.Values{lamps, {"furni": {"463"}}, {"furni": {"lamp"}}} {
		wantPage(t, serve(mux, "POST", "/account/furni/take", cookie, none), http.StatusUnprocessableEntity,
			"Result:There is no such furni to take.", "Failed:true", "Furni:[{ID:1152 Name:Throne Amount:1}]")
	}
	wantPage(t, serve(mux, "POST", "/account/furni/take", cookie, url.Values{}), http.StatusOK,
		"Result:1 furni moved to Newbie&#39;s hand.", "Furni:[]")

	hand, err := q.ListHandFurni(ctx, store.ListHandFurniParams{AvatarID: active, PageSize: 20})
	if err != nil {
		t.Fatal(err)
	}
	if len(hand) != 5 || !slices.ContainsFunc(hand, func(f store.Furni) bool { return f.ID == own.ID }) {
		t.Errorf("the active habbo's hand holds %d furni, want its own, the three lamps and the throne: %+v", len(hand), hand)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM furnis WHERE id = ? AND avatar_id IS NULL`, theirs.ID); n != 1 {
		t.Error("another user's shared furni was taken")
	}
}
