package store

import (
	"database/sql"
	"testing"
)

func TestAHandListsItsFurniOldestFirst(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, holder := createUserWithHabbo(t, q, "holder@example.com", "Holder")
	_, other := createUserWithHabbo(t, q, "other@example.com", "Other")
	hand := sql.NullInt64{Int64: holder.ID, Valid: true}

	var ids []int64
	for range 11 {
		f := must(q.CreateFurni(ctx, CreateFurniParams{FurniDefinitionID: 463, UserID: user.ID, AvatarID: hand, CreatedAt: testNow}))
		ids = append(ids, f.ID)
	}
	shared := must(q.CreateFurni(ctx, CreateFurniParams{FurniDefinitionID: 463, UserID: user.ID, CreatedAt: testNow}))
	must(q.CreateFurni(ctx, CreateFurniParams{FurniDefinitionID: 105, UserID: other.UserID, AvatarID: sql.NullInt64{Int64: other.ID, Valid: true}, State: "x", CreatedAt: testNow}))

	if n := must(q.CountHandFurni(ctx, holder.ID)); n != 11 {
		t.Errorf("the hand holds %d furni, want 11 without the shared one and the other habbo's", n)
	}
	page := must(q.ListHandFurni(ctx, ListHandFurniParams{AvatarID: holder.ID, PageSize: 9, Skip: 9}))
	if len(page) != 2 || page[0].ID != ids[9] || page[1].ID != ids[10] {
		t.Errorf("the second page of 9 = %+v, want the two newest furni, %v", page, ids[9:])
	}
	if shared.AvatarID.Valid || shared.RoomID.Valid || shared.UserID != user.ID {
		t.Errorf("shared furni = %+v, want no habbo and no room", shared)
	}
}

// A furni is in a hand or in a room, never both (decision holo-port/0057).
func TestAFurniIsNeverInAHandAndARoom(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, holder := createUserWithHabbo(t, q, "holder@example.com", "Holder")
	room := must(q.CreateRoom(ctx, CreateRoomParams{AvatarID: holder.ID, RoomCategoryID: 2, RoomModelID: 1, Name: "Den", Door: "open", ShowOwner: true, CreatedAt: testNow}))
	f := must(q.CreateFurni(ctx, CreateFurniParams{FurniDefinitionID: 463, UserID: user.ID, AvatarID: sql.NullInt64{Int64: holder.ID, Valid: true}, CreatedAt: testNow}))

	if _, err := db.ExecContext(ctx, `UPDATE furnis SET room_id = ? WHERE id = ?`, room.ID, f.ID); err == nil {
		t.Error("a furni in a hand was placed in a room without leaving the hand")
	}
	if _, err := db.ExecContext(ctx, `UPDATE furnis SET room_id = ?, avatar_id = NULL WHERE id = ?`, room.ID, f.ID); err != nil {
		t.Errorf("placing a furni that leaves the hand: %v", err)
	}
}
