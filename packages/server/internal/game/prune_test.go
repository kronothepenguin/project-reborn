package game

import (
	"database/sql"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The chat history keeps game.chatHistoryDays, 30, and PruneChat deletes what is older (decision server/0084).
func TestPruneChatKeepsThirtyDays(t *testing.T) {
	db := openDB(t)
	q := store.New(db)
	ctx := t.Context()
	now := time.Now().UTC()
	user, err := q.CreateUser(ctx, store.CreateUserParams{Email: "talker@example.com", BornOn: now, CreatedIP: "127.0.0.1", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	avatar, err := q.CreateAvatar(ctx, store.CreateAvatarParams{UserID: user.ID, Name: "Talker", Figure: "hd-180-1", Gender: "M", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	for _, age := range []time.Duration{31 * 24 * time.Hour, 30*24*time.Hour + time.Minute, 29 * 24 * time.Hour} {
		line := store.AddChatMessageParams{PublicRoomID: sql.NullInt64{Int64: 101, Valid: true}, AvatarID: avatar.ID, Kind: "chat", Text: "hi", SaidAt: now.Add(-age)}
		if err := q.AddChatMessage(ctx, line); err != nil {
			t.Fatal(err)
		}
	}

	if err := PruneChat(ctx, db, now); err != nil {
		t.Fatal(err)
	}
	if n, err := q.CountChatLog(ctx, store.CountChatLogParams{Room: 101}); err != nil || n != 1 {
		t.Errorf("%d lines left, %v; want the one of 29 days", n, err)
	}
}
