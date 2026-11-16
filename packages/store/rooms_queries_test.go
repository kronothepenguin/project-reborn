package store

import (
	"database/sql"
	"testing"
	"time"
)

func newTestRoom(t *testing.T, q *Queries, owner int64) Room {
	t.Helper()
	return must(q.CreateRoom(t.Context(), CreateRoomParams{AvatarID: owner, RoomCategoryID: 2, RoomModelID: 1, Name: "Room", Door: "open", ShowOwner: true, CreatedAt: testNow}))
}

// A deleted room leaves its lines without a room, so that what was said in it stays for moderators.
func TestTheChatHistoryOutlivesItsRoom(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, owner := createUserWithHabbo(t, q, "owner@example.com", "Owner")
	_, guest := createUserWithHabbo(t, q, "guest@example.com", "Guest")
	room := newTestRoom(t, q, owner.ID)
	id := func(v int64) sql.NullInt64 { return sql.NullInt64{Int64: v, Valid: true} }

	lines := []AddChatMessageParams{
		{PublicRoomID: id(101), AvatarID: guest.ID, Kind: "chat", Text: "hello lounge", SaidAt: testNow.Add(-40 * 24 * time.Hour)},
		{RoomID: id(room.ID), AvatarID: guest.ID, Kind: "whisper", ToAvatarID: id(owner.ID), Text: "psst", SaidAt: testNow},
		{RoomID: id(room.ID), AvatarID: owner.ID, Kind: "shout", Text: "HELLO", SaidAt: testNow},
	}
	for _, line := range lines {
		if err := q.AddChatMessage(ctx, line); err != nil {
			t.Fatal(err)
		}
	}
	if err := q.AddChatMessage(ctx, AddChatMessageParams{PublicRoomID: id(101), RoomID: id(room.ID), AvatarID: guest.ID, Kind: "chat", Text: "both", SaidAt: testNow}); err == nil {
		t.Error("a line said in two rooms was saved")
	}
	must(q.DeleteRoom(ctx, DeleteRoomParams{ID: room.ID, OwnerAvatarID: owner.ID}))
	if n := countRows(t, db, "SELECT COUNT(*) FROM chat_messages WHERE room_id IS NULL AND public_room_id IS NULL"); n != 2 {
		t.Errorf("%d lines lost their room, want the deleted room's 2, kept", n)
	}
	if n := must(q.DeleteChatMessagesBefore(ctx, testNow.Add(-30*24*time.Hour))); n != 1 {
		t.Errorf("deleted %d lines older than 30 days, want 1", n)
	}
}

func TestAnIgnoreList(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	_, frank := createUserWithHabbo(t, q, "frank@example.com", "Frank")
	_, noisy := createUserWithHabbo(t, q, "noisy@example.com", "Noisy")

	for range 2 {
		if err := q.IgnoreHabbo(ctx, IgnoreHabboParams{AvatarID: frank.ID, IgnoredAvatarID: noisy.ID, CreatedAt: testNow}); err != nil {
			t.Fatal(err)
		}
	}
	if got := must(q.ListIgnoredHabbos(ctx, frank.ID)); len(got) != 1 || got[0].Name != "Noisy" {
		t.Errorf("ignored = %+v, want Noisy once", got)
	}
	if n := must(q.UnignoreHabbo(ctx, UnignoreHabboParams{AvatarID: frank.ID, IgnoredAvatarID: noisy.ID})); n != 1 || len(must(q.ListIgnoredHabbos(ctx, frank.ID))) != 0 {
		t.Error("Noisy is still ignored")
	}
}

// The client's badge window sets every slot at once; the site wears one badge in slot 1, in place of the one there,
// and shows the badge of the first slot filled (decision server/0083).
func TestBadgeSlots(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	_, habbo := createUserWithHabbo(t, q, "badges@example.com", "Badger")
	for _, code := range []string{"ADM", "HC1", "NWB"} {
		if _, err := q.GrantAvatarBadge(ctx, GrantAvatarBadgeParams{AvatarID: habbo.ID, Code: code, GrantedAt: testNow}); err != nil && !IsConflict(err) {
			t.Fatal(err)
		}
		if err := q.TakeOffAvatarBadge(ctx, habbo.ID); err != nil {
			t.Fatal(err)
		}
	}
	if err := q.TakeOffAvatarBadges(ctx, habbo.ID); err != nil {
		t.Fatal(err)
	}
	for code, slot := range map[string]int64{"NWB": 2, "HC1": 4} {
		if n := must(q.WearAvatarBadgeInSlot(ctx, WearAvatarBadgeInSlotParams{AvatarID: habbo.ID, Code: code, Slot: slot})); n != 1 {
			t.Errorf("wore %s in %d rows", code, n)
		}
	}
	if worn := must(q.GetWornAvatarBadge(ctx, habbo.ID)); worn.Code != "NWB" {
		t.Errorf("the site shows %s, want NWB, in the first slot filled", worn.Code)
	}
	if err := q.TakeOffAvatarBadge(ctx, habbo.ID); err != nil {
		t.Fatal(err)
	}
	if err := q.WearAvatarBadge(ctx, WearAvatarBadgeParams{AvatarID: habbo.ID, Code: "ADM"}); err != nil {
		t.Fatal(err)
	}
	slots := map[string]int64{}
	for _, b := range must(q.ListAvatarBadges(ctx, habbo.ID)) {
		slots[b.Code] = b.Slot
	}
	if slots["ADM"] != 1 || slots["NWB"] != 2 || slots["HC1"] != 4 {
		t.Errorf("slots %v, want ADM in 1 and the others kept", slots)
	}
}
