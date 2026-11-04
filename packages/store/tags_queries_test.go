package store

import (
	"maps"
	"slices"
	"testing"
	"time"
)

// tagged makes a habbo with a profile that took tags a minute apart from at.
func tagged(t *testing.T, q *Queries, email, name string, at time.Time, tags ...string) (Avatar, Profile) {
	t.Helper()
	ctx := t.Context()
	_, avatar := createUserWithHabbo(t, q, email, name)
	profile, err := q.CreateProfile(ctx, CreateProfileParams{AvatarID: avatar.ID, CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateProfile: %v", err)
	}
	for i, tag := range tags {
		if _, err := q.AddProfileTag(ctx, AddProfileTagParams{ProfileID: profile.ID, Tag: tag, CreatedAt: at.Add(time.Duration(i) * time.Minute)}); err != nil {
			t.Fatalf("AddProfileTag %s: %v", tag, err)
		}
	}
	return avatar, profile
}

func TestTheTagCloudCountsTheHabbosNotArchived(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	tagged(t, q, "alpha@example.com", "Alpha", testNow, "retro", "holo")
	tagged(t, q, "beta@example.com", "Beta", testNow, "retro")
	ghost, _ := tagged(t, q, "ghost@example.com", "Ghost", testNow, "retro", "ghost")
	if _, err := db.ExecContext(ctx, `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, ghost.ID); err != nil {
		t.Fatal(err)
	}

	got := make(map[string]int64)
	for _, row := range must(q.ListTagCloud(ctx, 20)) {
		got[row.Tag] = row.Habbos
	}
	if want := map[string]int64{"retro": 2, "holo": 1}; !maps.Equal(got, want) {
		t.Errorf("the cloud = %v, want %v", got, want)
	}
	if n := len(must(q.ListTagCloud(ctx, 1))); n != 1 {
		t.Errorf("a cloud of 1 has %d tags", n)
	}
}

func TestTaggedHabbosListInTheOrderTheyTookTheTag(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, alpha := tagged(t, q, "alpha@example.com", "Alpha", testNow.Add(time.Hour), "retro")
	_, beta := tagged(t, q, "beta@example.com", "Beta", testNow, "retro", "holo")
	ghost, _ := tagged(t, q, "ghost@example.com", "Ghost", testNow.Add(-time.Hour), "retro")
	if _, err := db.ExecContext(ctx, `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, ghost.ID); err != nil {
		t.Fatal(err)
	}

	rows := must(q.ListTaggedAvatars(ctx, ListTaggedAvatarsParams{Tag: "retro", RowLimit: 20}))
	var names []string
	for _, row := range rows {
		names = append(names, row.Name)
	}
	if !slices.Equal(names, []string{"Beta", "Alpha"}) {
		t.Fatalf("retro = %v, want Beta, who took it first, then Alpha", names)
	}
	if rows[0].ProfileID != beta.ID || rows[1].ProfileID != alpha.ID || rows[0].Figure == "" {
		t.Errorf("rows = %+v", rows)
	}
	if n := len(must(q.ListTaggedAvatars(ctx, ListTaggedAvatarsParams{Tag: "retro", RowLimit: 1}))); n != 1 {
		t.Errorf("a list of 1 has %d habbos", n)
	}
	for tag, want := range map[string]int64{"retro": 2, "holo": 1, "Retro": 0, "retr": 0, "%": 0} {
		if got := must(q.CountTaggedAvatars(ctx, tag)); got != want {
			t.Errorf("CountTaggedAvatars(%q) = %d, want %d", tag, got, want)
		}
	}
}
