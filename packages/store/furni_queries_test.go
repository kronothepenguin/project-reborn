package store

import (
	"database/sql"
	"testing"
)

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
