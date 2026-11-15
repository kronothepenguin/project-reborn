package game

import (
	"database/sql"
	"slices"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

func userOf(t *testing.T, db *sql.DB, avatarID int64) int64 {
	t.Helper()
	avatar, err := store.New(db).GetAvatar(t.Context(), avatarID)
	if err != nil {
		t.Fatalf("GetAvatar: %v", err)
	}
	return avatar.UserID
}

func TestLoginLoadsTheHabbosOwnData(t *testing.T) {
	db := openDB(t)
	id := frank(t, db, "ticket-1")
	ctx := t.Context()
	q := store.New(db)
	now := time.Now().UTC()
	// Granting a badge wears it, so the last one granted is the one worn.
	for i, code := range []string{"HC1", "ADM"} {
		if err := q.TakeOffAvatarBadge(ctx, id); err != nil {
			t.Fatalf("TakeOffAvatarBadge: %v", err)
		}
		if _, err := q.GrantAvatarBadge(ctx, store.GrantAvatarBadgeParams{AvatarID: id, Code: code, GrantedAt: now.Add(time.Duration(i) * time.Minute)}); err != nil {
			t.Fatalf("GrantAvatarBadge: %v", err)
		}
	}
	if err := q.SetAvatarSoundEnabled(ctx, store.SetAvatarSoundEnabledParams{AvatarID: id, SoundEnabled: false}); err != nil {
		t.Fatalf("SetAvatarSoundEnabled: %v", err)
	}
	group, err := q.CreateAccessGroup(ctx, store.CreateAccessGroupParams{Name: "Guards", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatalf("CreateAccessGroup: %v", err)
	}
	if err := q.AddAccessGroupAttribute(ctx, store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: "fuse_kick"}); err != nil {
		t.Fatalf("AddAccessGroupAttribute: %v", err)
	}
	if err := q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userOf(t, db, id), GrantedAt: now}); err != nil {
		t.Fatalf("AddAccessGroupMember: %v", err)
	}

	h, err := Login(ctx, db, &session{}, "ticket-1", "")
	if err != nil {
		t.Fatalf("Login: %v", err)
	}
	online, _ := habbo.Get(id)
	for _, got := range []habbo.Habbo{h, online} {
		if !slices.Equal(got.Badges, []string{"HC1", "ADM"}) || got.Worn != [5]string{"ADM"} {
			t.Errorf("badges %v, worn %q; want HC1 and ADM, wearing ADM in slot 1", got.Badges, got.Worn)
		}
		if got.SoundEnabled {
			t.Error("the sound is on, want the saved setting, off")
		}
		if want := []string{"fuse_trade", "fuse_buy_credits", "fuse_kick"}; !slices.Equal(got.Fuses, want) {
			t.Errorf("fuses %v, want %v", got.Fuses, want)
		}
	}
}

func TestANewHabboLogsInWithTheSoundOn(t *testing.T) {
	db := openDB(t)
	frank(t, db, "ticket-1")
	h, err := Login(t.Context(), db, &session{}, "ticket-1", "")
	if err != nil || !h.SoundEnabled || len(h.Badges) != 0 || h.Worn != [5]string{} {
		t.Errorf("Login() = %+v, %v; want the sound on and no badge", h, err)
	}
}

func TestSetSoundEnabledSavesTheSettingThenTheCopy(t *testing.T) {
	db := openDB(t)
	id := frank(t, db, "ticket-1")
	s := &session{}
	if _, err := Login(t.Context(), db, s, "ticket-1", ""); err != nil {
		t.Fatalf("Login: %v", err)
	}

	if err := SetSoundEnabled(t.Context(), db, s, id, false); err != nil {
		t.Fatalf("SetSoundEnabled: %v", err)
	}
	if data := gameData(t, db, id); data.SoundEnabled {
		t.Error("the store still has the sound on")
	}
	if h, _ := habbo.Get(id); h.SoundEnabled {
		t.Error("the online habbo still has the sound on")
	}
}

func TestUserAccountReadsTheWalletAndTheNewsletter(t *testing.T) {
	db := openDB(t)
	ctx := t.Context()
	q := store.New(db)
	now := time.Now().UTC()
	user, err := q.CreateUser(ctx, store.CreateUserParams{Email: "wallet@example.com", BornOn: time.Date(2000, 1, 2, 0, 0, 0, 0, time.UTC), Newsletter: true, CreatedIP: "127.0.0.1", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}
	if err := q.CreateWallet(ctx, store.CreateWalletParams{UserID: user.ID, Credits: 120, UpdatedAt: now}); err != nil {
		t.Fatalf("CreateWallet: %v", err)
	}
	if err := q.UpdateWalletTicketsAndFilm(ctx, store.UpdateWalletTicketsAndFilmParams{Tickets: 3, Film: 5, UpdatedAt: now, UserID: user.ID}); err != nil {
		t.Fatalf("UpdateWalletTicketsAndFilm: %v", err)
	}

	got, err := UserAccount(ctx, db, user.ID)
	if want := (Account{Credits: 120, Tickets: 3, Film: 5, Newsletter: true}); err != nil || got != want {
		t.Errorf("UserAccount() = %+v, %v; want %+v", got, err, want)
	}
}

func TestTheClubSplitsItsDaysByTheMonth(t *testing.T) {
	now := time.Date(2026, 11, 10, 12, 0, 0, 0, time.UTC)
	day := 24 * time.Hour
	period := func(from, to time.Duration) store.ListClubSubscriptionsRow {
		return store.ListClubSubscriptionsRow{StartsAt: now.Add(from), EndsAt: now.Add(to)}
	}
	for name, c := range map[string]struct {
		periods      []store.ListClubSubscriptionsRow
		daysPerMonth int
		want         Club
	}{
		"no club":                {nil, 31, Club{}},
		"40 days, months of 31":  {[]store.ListClubSubscriptionsRow{period(-10*day, 40*day)}, 31, Club{DaysLeft: 9, PrepaidPeriods: 1}},
		"40 days, months of 30":  {[]store.ListClubSubscriptionsRow{period(-10*day, 40*day)}, 30, Club{DaysLeft: 10, PrepaidPeriods: 1}},
		"a day begun":            {[]store.ListClubSubscriptionsRow{period(-day, 39*day+time.Hour)}, 31, Club{DaysLeft: 9, PrepaidPeriods: 1}},
		"one whole month left":   {[]store.ListClubSubscriptionsRow{period(-day, 31*day)}, 31, Club{DaysLeft: 31}},
		"a period after another": {[]store.ListClubSubscriptionsRow{period(-40*day, -9*day), period(-9*day, 22*day)}, 31, Club{DaysLeft: 22, ElapsedPeriods: 1}},
		"ended":                  {[]store.ListClubSubscriptionsRow{period(-70*day, -8*day)}, 31, Club{ElapsedPeriods: 2}},
	} {
		if got := clubAt(c.periods, now, c.daysPerMonth); got != c.want {
			t.Errorf("%s: %+v, want %+v", name, got, c.want)
		}
	}
}
