package store

import (
	"database/sql"
	"slices"
	"testing"
	"time"
)

func newTestRoom(t *testing.T, q *Queries, owner int64) Room {
	t.Helper()
	return must(q.CreateRoom(t.Context(), CreateRoomParams{AvatarID: owner, RoomCategoryID: 2, RoomModelID: 1, Name: "Room", Door: "open", ShowOwner: true, CreatedAt: testNow}))
}

func TestRoomRights(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	_, owner := createUserWithHabbo(t, q, "owner@example.com", "Owner")
	_, helper := createUserWithHabbo(t, q, "helper@example.com", "Helper")
	_, other := createUserWithHabbo(t, q, "other@example.com", "Other")
	room := newTestRoom(t, q, owner.ID)

	for _, id := range []int64{helper.ID, other.ID, helper.ID} {
		if err := q.AddRoomRights(ctx, AddRoomRightsParams{RoomID: room.ID, AvatarID: id, GrantedAt: testNow}); err != nil {
			t.Fatal(err)
		}
	}
	if got := must(q.ListRoomRights(ctx, room.ID)); len(got) != 2 {
		t.Errorf("rights = %v, want Helper and Other once each", got)
	}
	if n := must(q.RemoveRoomRights(ctx, RemoveRoomRightsParams{RoomID: room.ID, AvatarID: other.ID})); n != 1 || must(q.HasRoomRights(ctx, HasRoomRightsParams{RoomID: room.ID, AvatarID: other.ID})) {
		t.Error("Other keeps its rights")
	}
	if got := must(q.RemoveAllRoomRights(ctx, room.ID)); !slices.Equal(got, []int64{helper.ID}) {
		t.Errorf("removed rights of %v, want Helper's", got)
	}
}

func TestARoomBanEnds(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	_, owner := createUserWithHabbo(t, q, "owner@example.com", "Owner")
	_, pest := createUserWithHabbo(t, q, "pest@example.com", "Pest")
	room := newTestRoom(t, q, owner.ID)
	end := testNow.Add(15 * time.Minute)

	if err := q.BanFromRoom(ctx, BanFromRoomParams{RoomID: room.ID, AvatarID: pest.ID, ExpiresAt: end}); err != nil {
		t.Fatal(err)
	}
	if got := must(q.GetRoomBanEnd(ctx, GetRoomBanEndParams{RoomID: room.ID, AvatarID: pest.ID, Now: testNow})); !got.Equal(end) {
		t.Errorf("the ban ends at %v, want %v", got, end)
	}
	if _, err := q.GetRoomBanEnd(ctx, GetRoomBanEndParams{RoomID: room.ID, AvatarID: pest.ID, Now: end}); !IsNotFound(err) {
		t.Errorf("the ban still holds at its end: %v", err)
	}
	later := end.Add(time.Hour)
	if err := q.BanFromRoom(ctx, BanFromRoomParams{RoomID: room.ID, AvatarID: pest.ID, ExpiresAt: later}); err != nil {
		t.Fatal(err)
	}
	if got := must(q.GetRoomBanEnd(ctx, GetRoomBanEndParams{RoomID: room.ID, AvatarID: pest.ID, Now: end})); !got.Equal(later) {
		t.Errorf("a second ban ends at %v, want %v", got, later)
	}
	if n := must(q.DeleteExpiredRoomBans(ctx, later)); n != 1 {
		t.Errorf("deleted %d expired bans, want 1", n)
	}
}

func TestAHabboVotesOnARoomOnce(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	_, owner := createUserWithHabbo(t, q, "owner@example.com", "Owner")
	_, fan := createUserWithHabbo(t, q, "fan@example.com", "Fan")
	_, critic := createUserWithHabbo(t, q, "critic@example.com", "Critic")
	room := newTestRoom(t, q, owner.ID)

	for _, v := range []struct {
		avatar int64
		vote   int64
		rows   int64
	}{{fan.ID, 1, 1}, {critic.ID, -1, 1}, {fan.ID, -1, 0}} {
		if n := must(q.AddRoomVote(ctx, AddRoomVoteParams{RoomID: room.ID, AvatarID: v.avatar, Vote: v.vote, VotedAt: testNow})); n != v.rows {
			t.Errorf("a vote of %d added %d rows, want %d", v.vote, n, v.rows)
		}
	}
	if got := must(q.GetRoomRating(ctx, room.ID)); got.Rating != 0 || got.Votes != 2 {
		t.Errorf("rating = %+v, want 0 from two votes", got)
	}
	if _, err := q.AddRoomVote(ctx, AddRoomVoteParams{RoomID: room.ID, AvatarID: owner.ID, Vote: 2, VotedAt: testNow}); err == nil {
		t.Error("a vote of 2 was saved")
	}
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
