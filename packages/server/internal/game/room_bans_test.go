package game

import (
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// A room ban ends: the next scheduled run deletes it, and a ban still running stays.
func TestTheScheduledRunDeletesEndedRoomBans(t *testing.T) {
	db := openDB(t)
	q := store.New(db)
	ctx := t.Context()
	now := time.Now().UTC()
	user, err := q.CreateUser(ctx, store.CreateUserParams{Email: "owner@example.com", BornOn: now, CreatedIP: "127.0.0.1", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	var avatars []int64
	for _, name := range []string{"Owner", "Ended", "Running"} {
		avatar, err := q.CreateAvatar(ctx, store.CreateAvatarParams{UserID: user.ID, Name: name, Figure: "hd-180-1", Gender: "M", CreatedAt: now, UpdatedAt: now})
		if err != nil {
			t.Fatal(err)
		}
		avatars = append(avatars, avatar.ID)
	}
	room, err := q.CreateRoom(ctx, store.CreateRoomParams{AvatarID: avatars[0], RoomCategoryID: 2, RoomModelID: 1, Name: "Banned", Door: "open", CreatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	ended, running := avatars[1], avatars[2]
	for avatar, end := range map[int64]time.Time{ended: now.Add(-time.Minute), running: now.Add(time.Minute)} {
		if err := q.BanFromRoom(ctx, store.BanFromRoomParams{RoomID: room.ID, AvatarID: avatar, ExpiresAt: end}); err != nil {
			t.Fatal(err)
		}
	}

	if err := DeleteEndedRoomBans(ctx, db, now); err != nil {
		t.Fatal(err)
	}

	// Asked before either end, a ban that is still saved answers.
	before := now.Add(-time.Hour)
	if _, err := q.GetRoomBanEnd(ctx, store.GetRoomBanEndParams{RoomID: room.ID, AvatarID: ended, Now: before}); !store.IsNotFound(err) {
		t.Errorf("the ended ban is still saved: %v", err)
	}
	if _, err := q.GetRoomBanEnd(ctx, store.GetRoomBanEndParams{RoomID: room.ID, AvatarID: running, Now: before}); err != nil {
		t.Errorf("the running ban is gone: %v", err)
	}
}
