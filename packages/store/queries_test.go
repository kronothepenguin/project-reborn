package store

import (
	"database/sql"
	"slices"
	"testing"
	"time"
)

var testNow = time.Date(2026, time.October, 27, 21, 0, 0, 0, time.UTC)

func createUserWithHabbo(t *testing.T, q *Queries, email, name string) (User, Avatar) {
	t.Helper()
	ctx := t.Context()

	user, err := q.CreateUser(ctx, CreateUserParams{
		Email:     email,
		BornOn:    time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		CreatedIP: "127.0.0.1",
		CreatedAt: testNow,
		UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatalf("CreateUser %s: %v", email, err)
	}
	if err := q.UpsertCredential(ctx, UpsertCredentialParams{UserID: user.ID, PasswordHash: "hash-" + name, UpdatedAt: testNow}); err != nil {
		t.Fatalf("UpsertCredential: %v", err)
	}
	avatar, err := q.CreateAvatar(ctx, CreateAvatarParams{
		UserID:    user.ID,
		Name:      name,
		Figure:    "hd-180-1.ch-215-82.lg-270-82",
		Gender:    "M",
		CreatedAt: testNow,
		UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatalf("CreateAvatar %s: %v", name, err)
	}
	return user, avatar
}

func TestRegistrationThroughGeneratedQueries(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	q := New(db)

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		t.Fatalf("begin: %v", err)
	}
	defer tx.Rollback()
	qtx := q.WithTx(tx)

	user, avatar := createUserWithHabbo(t, qtx, "krono@example.com", "Krono")
	profile, err := qtx.CreateProfile(ctx, CreateProfileParams{AvatarID: avatar.ID, CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateProfile: %v", err)
	}
	home, err := qtx.CreateProfileHome(ctx, CreateProfileHomeParams{ProfileID: profile.ID, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateProfileHome: %v", err)
	}
	if err := qtx.CreateWallet(ctx, CreateWalletParams{AvatarID: avatar.ID, Credits: 100, UpdatedAt: testNow}); err != nil {
		t.Fatalf("CreateWallet: %v", err)
	}
	if err := qtx.CreateWalletTransaction(ctx, CreateWalletTransactionParams{AvatarID: avatar.ID, Credits: 100, Reason: "registration", CreatedAt: testNow}); err != nil {
		t.Fatalf("CreateWalletTransaction: %v", err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatalf("commit: %v", err)
	}

	if !home.ProfileID.Valid || home.ProfileID.Int64 != profile.ID || home.GroupID.Valid {
		t.Errorf("home = %+v, want it owned by profile %d only", home, profile.ID)
	}
	got, err := q.GetAvatarByName(ctx, "KRONO")
	if err != nil || got.ID != avatar.ID {
		t.Errorf("GetAvatarByName(KRONO) = %+v, %v; want habbo %d", got, err, avatar.ID)
	}
	habbos, err := q.ListUserAvatars(ctx, user.ID)
	if err != nil || len(habbos) != 1 {
		t.Errorf("ListUserAvatars = %v, %v; want one habbo", habbos, err)
	}
	if n, err := q.CountUsersCreatedFromIP(ctx, CountUsersCreatedFromIPParams{CreatedIP: "127.0.0.1", Since: testNow.Add(-time.Hour)}); err != nil || n != 1 {
		t.Errorf("CountUsersCreatedFromIP = %d, %v; want 1", n, err)
	}
	if !user.BornOn.Equal(time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC)) {
		t.Errorf("BornOn = %v, want 1990-05-01", user.BornOn)
	}
}

func TestLoginLookupIgnoresCase(t *testing.T) {
	q := New(openTestDB(t))
	user, avatar := createUserWithHabbo(t, q, "krono@example.com", "Krono")

	login, err := q.GetLoginByHabboName(t.Context(), "kRONO")
	if err != nil {
		t.Fatalf("GetLoginByHabboName: %v", err)
	}
	if login.AvatarID != avatar.ID || login.UserID != user.ID || login.Name != "Krono" || login.PasswordHash != "hash-Krono" {
		t.Errorf("login = %+v, want habbo %d of user %d with its hash", login, avatar.ID, user.ID)
	}
	if _, err := q.GetLoginByHabboName(t.Context(), "Nobody"); !IsNotFound(err) {
		t.Errorf("unknown habbo: err = %v, want not found", err)
	}
}

func TestSwitchSessionAvatarRequiresOwnership(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	user, first := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	second, err := q.CreateAvatar(ctx, CreateAvatarParams{UserID: user.ID, Name: "KronoStaff", Figure: "hd-180-1", Gender: "M", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateAvatar: %v", err)
	}
	_, stranger := createUserWithHabbo(t, q, "other@example.com", "Other")

	if err := q.CreateSession(ctx, CreateSessionParams{
		ID: "digest", UserID: user.ID, AvatarID: first.ID, IP: "127.0.0.1", UserAgent: "test",
		CreatedAt: testNow, LastSeenAt: testNow, ExpiresAt: testNow.Add(time.Hour),
	}); err != nil {
		t.Fatalf("CreateSession: %v", err)
	}

	if n, err := q.SwitchSessionAvatar(ctx, SwitchSessionAvatarParams{ID: "digest", AvatarID: stranger.ID}); err != nil || n != 0 {
		t.Errorf("switch to another user's habbo = %d rows, %v; want 0", n, err)
	}
	if n, err := q.SwitchSessionAvatar(ctx, SwitchSessionAvatarParams{ID: "digest", AvatarID: second.ID}); err != nil || n != 1 {
		t.Errorf("switch to own habbo = %d rows, %v; want 1", n, err)
	}
	session, err := q.GetActiveSession(ctx, GetActiveSessionParams{ID: "digest", Now: testNow})
	if err != nil || session.AvatarID != second.ID {
		t.Errorf("active habbo = %d, %v; want %d", session.AvatarID, err, second.ID)
	}
}

func TestSessionsExpireAndArePurged(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	user, avatar := createUserWithHabbo(t, q, "krono@example.com", "Krono")

	if err := q.CreateSession(ctx, CreateSessionParams{
		ID: "digest", UserID: user.ID, AvatarID: avatar.ID, IP: "127.0.0.1", UserAgent: "test",
		CreatedAt: testNow, LastSeenAt: testNow, ExpiresAt: testNow.Add(time.Minute),
	}); err != nil {
		t.Fatalf("CreateSession: %v", err)
	}

	if _, err := q.GetActiveSession(ctx, GetActiveSessionParams{ID: "digest", Now: testNow.Add(30 * time.Second)}); err != nil {
		t.Errorf("session before expiry: %v", err)
	}
	if _, err := q.GetActiveSession(ctx, GetActiveSessionParams{ID: "digest", Now: testNow.Add(2 * time.Minute)}); !IsNotFound(err) {
		t.Errorf("session after expiry: err = %v, want not found", err)
	}
	if n, err := q.PurgeExpiredSessions(ctx, testNow.Add(2*time.Minute)); err != nil || n != 1 {
		t.Errorf("PurgeExpiredSessions = %d, %v; want 1", n, err)
	}
}

func TestActiveBanRules(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, _ := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	userID := sql.NullInt64{Int64: user.ID, Valid: true}

	ban := func(query string, args ...any) {
		t.Helper()
		if _, err := db.ExecContext(ctx, query, args...); err != nil {
			t.Fatalf("%s: %v", query, err)
		}
	}
	active := func(userID sql.NullInt64, ip string) (Ban, error) {
		return q.GetActiveBan(ctx, GetActiveBanParams{UserID: userID, IP: ip, Now: testNow})
	}

	if _, err := active(userID, "10.0.0.1"); !IsNotFound(err) {
		t.Fatalf("no bans: err = %v, want not found", err)
	}

	ban(`INSERT INTO bans (user_id, reason, created_at, expires_at) VALUES (?, 'expired', ?, ?)`, user.ID, testNow.Add(-48*time.Hour), testNow.Add(-24*time.Hour))
	ban(`INSERT INTO bans (user_id, reason, created_at, expires_at, lifted_at) VALUES (?, 'lifted', ?, ?, ?)`, user.ID, testNow.Add(-time.Hour), testNow.Add(24*time.Hour), testNow.Add(-time.Minute))
	ban(`INSERT INTO bans (user_id, reason, created_at, expires_at) VALUES (?, 'future', ?, ?)`, user.ID, testNow.Add(time.Hour), testNow.Add(48*time.Hour))
	if b, err := active(userID, "10.0.0.1"); !IsNotFound(err) {
		t.Fatalf("expired, lifted or not-yet-started bans counted as active: %+v, %v", b, err)
	}

	ban(`INSERT INTO bans (user_id, reason, created_at, expires_at) VALUES (?, 'timed', ?, ?)`, user.ID, testNow.Add(-time.Hour), testNow.Add(24*time.Hour))
	ban(`INSERT INTO bans (user_id, reason, created_at) VALUES (?, 'permanent', ?)`, user.ID, testNow.Add(-time.Hour))
	if b, err := active(userID, "10.0.0.1"); err != nil || b.Reason != "permanent" {
		t.Errorf("active ban = %+v, %v; want the permanent one", b, err)
	}

	ban(`INSERT INTO bans (ip, reason, created_at, expires_at) VALUES ('10.0.0.9', 'ip', ?, ?)`, testNow.Add(-time.Hour), testNow.Add(time.Hour))
	if b, err := active(sql.NullInt64{}, "10.0.0.9"); err != nil || b.Reason != "ip" {
		t.Errorf("IP ban for an unknown habbo = %+v, %v; want the IP ban", b, err)
	}
}

func TestFailedLoginsAreCountedInTheWindow(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	user, avatar := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	userID := sql.NullInt64{Int64: user.ID, Valid: true}
	avatarID := sql.NullInt64{Int64: avatar.ID, Valid: true}

	for _, attempt := range []CreateLoginAttemptParams{
		{UserID: userID, AvatarID: avatarID, IP: "10.0.0.1", Succeeded: false, CreatedAt: testNow.Add(-time.Hour)},
		{UserID: userID, AvatarID: avatarID, IP: "10.0.0.1", Succeeded: false, CreatedAt: testNow.Add(-time.Minute)},
		{UserID: userID, AvatarID: avatarID, IP: "10.0.0.1", Succeeded: true, CreatedAt: testNow.Add(-30 * time.Second)},
		{IP: "10.0.0.1", Succeeded: false, CreatedAt: testNow.Add(-10 * time.Second)},
	} {
		if err := q.CreateLoginAttempt(ctx, attempt); err != nil {
			t.Fatalf("CreateLoginAttempt: %v", err)
		}
	}

	since := testNow.Add(-15 * time.Minute)
	if n, err := q.CountFailedLoginsByIP(ctx, CountFailedLoginsByIPParams{IP: "10.0.0.1", Since: since}); err != nil || n != 2 {
		t.Errorf("CountFailedLoginsByIP = %d, %v; want 2", n, err)
	}
	if n, err := q.CountFailedLoginsByUser(ctx, CountFailedLoginsByUserParams{UserID: user.ID, Since: since}); err != nil || n != 1 {
		t.Errorf("CountFailedLoginsByUser = %d, %v; want 1", n, err)
	}
}

func TestUserAttributesAreTheUnionOfTheirGroups(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	user, avatar := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	other, _ := createUserWithHabbo(t, q, "other@example.com", "Other")

	admins, err := q.CreateAccessGroup(ctx, CreateAccessGroupParams{Name: "Administrators", StaffListed: true, CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateAccessGroup: %v", err)
	}
	mods, err := q.CreateAccessGroup(ctx, CreateAccessGroupParams{Name: "Moderators", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateAccessGroup: %v", err)
	}
	for _, grant := range []AddAccessGroupAttributeParams{
		{AccessGroupID: admins.ID, Attribute: "housekeeping.access"},
		{AccessGroupID: admins.ID, Attribute: "housekeeping.accessGroups"},
		{AccessGroupID: mods.ID, Attribute: "housekeeping.access"},
		{AccessGroupID: mods.ID, Attribute: "housekeeping.bans"},
		{AccessGroupID: mods.ID, Attribute: "housekeeping.bans"},
	} {
		if err := q.AddAccessGroupAttribute(ctx, grant); err != nil {
			t.Fatalf("AddAccessGroupAttribute %+v: %v", grant, err)
		}
	}
	for _, member := range []AddAccessGroupMemberParams{
		{AccessGroupID: admins.ID, UserID: user.ID, DisplayAvatarID: sql.NullInt64{Int64: avatar.ID, Valid: true}, GrantedAt: testNow},
		{AccessGroupID: mods.ID, UserID: user.ID, GrantedAt: testNow},
		{AccessGroupID: mods.ID, UserID: other.ID, GrantedAt: testNow},
	} {
		if err := q.AddAccessGroupMember(ctx, member); err != nil {
			t.Fatalf("AddAccessGroupMember %+v: %v", member, err)
		}
	}

	attributes, err := q.ListUserAttributes(ctx, user.ID)
	if want := []string{"housekeeping.access", "housekeeping.accessGroups", "housekeeping.bans"}; err != nil || !slices.Equal(attributes, want) {
		t.Errorf("ListUserAttributes = %v, %v; want %v", attributes, err, want)
	}
	holders, err := q.ListAttributeHolders(ctx, "housekeeping.accessGroups")
	if err != nil || !slices.Equal(holders, []int64{user.ID}) {
		t.Errorf("ListAttributeHolders = %v, %v; want [%d]", holders, err, user.ID)
	}

	if err := q.RemoveAccessGroupMember(ctx, RemoveAccessGroupMemberParams{AccessGroupID: admins.ID, UserID: user.ID}); err != nil {
		t.Fatalf("RemoveAccessGroupMember: %v", err)
	}
	attributes, err = q.ListUserAttributes(ctx, user.ID)
	if want := []string{"housekeeping.access", "housekeeping.bans"}; err != nil || !slices.Equal(attributes, want) {
		t.Errorf("after leaving Administrators: ListUserAttributes = %v, %v; want %v", attributes, err, want)
	}
}

func TestSettingsUpsertAndDelete(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()

	for _, setting := range []UpsertSettingParams{
		{Key: "site.name", Value: `"Habbo"`, UpdatedAt: testNow},
		{Key: "club.price1Month", Value: `20`, UpdatedAt: testNow},
		{Key: "site.name", Value: `"Reborn"`, UpdatedAt: testNow.Add(time.Minute)},
	} {
		if err := q.UpsertSetting(ctx, setting); err != nil {
			t.Fatalf("UpsertSetting %+v: %v", setting, err)
		}
	}

	settings, err := q.ListSettings(ctx)
	if err != nil {
		t.Fatalf("ListSettings: %v", err)
	}
	if len(settings) != 2 || settings[0].Key != "club.price1Month" || settings[1].Key != "site.name" || settings[1].Value != `"Reborn"` {
		t.Errorf("ListSettings = %+v, want club.price1Month then site.name = \"Reborn\"", settings)
	}

	if err := q.DeleteSetting(ctx, "site.name"); err != nil {
		t.Fatalf("DeleteSetting: %v", err)
	}
	if settings, err := q.ListSettings(ctx); err != nil || len(settings) != 1 {
		t.Errorf("after delete: ListSettings = %+v, %v; want one row", settings, err)
	}
}

func TestPasswordResetsExpire(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	user, _ := createUserWithHabbo(t, q, "krono@example.com", "Krono")

	if err := q.CreatePasswordReset(ctx, CreatePasswordResetParams{ID: "reset-digest", UserID: user.ID, CreatedAt: testNow, ExpiresAt: testNow.Add(time.Hour)}); err != nil {
		t.Fatalf("CreatePasswordReset: %v", err)
	}
	if reset, err := q.GetActivePasswordReset(ctx, GetActivePasswordResetParams{ID: "reset-digest", Now: testNow.Add(time.Minute)}); err != nil || reset.UserID != user.ID {
		t.Errorf("reset before expiry = %+v, %v; want the user's reset", reset, err)
	}
	if _, err := q.GetActivePasswordReset(ctx, GetActivePasswordResetParams{ID: "reset-digest", Now: testNow.Add(2 * time.Hour)}); !IsNotFound(err) {
		t.Errorf("reset after expiry: err = %v, want not found", err)
	}
	if err := q.DeleteUserPasswordResets(ctx, user.ID); err != nil {
		t.Fatalf("DeleteUserPasswordResets: %v", err)
	}
	if _, err := q.GetActivePasswordReset(ctx, GetActivePasswordResetParams{ID: "reset-digest", Now: testNow}); !IsNotFound(err) {
		t.Errorf("reset after delete: err = %v, want not found", err)
	}
}
