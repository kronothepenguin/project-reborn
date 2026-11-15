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

func TestAnSSOTicketIsSpentOnceWhileItsSessionHoldsItsHabbo(t *testing.T) {
	q := New(openTestDB(t))
	ctx := t.Context()
	user, first := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	second, err := q.CreateAvatar(ctx, CreateAvatarParams{UserID: user.ID, Name: "KronoStaff", Figure: "hd-180-1", Gender: "M", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateAvatar: %v", err)
	}
	if err := q.CreateSession(ctx, CreateSessionParams{
		ID: "digest", UserID: user.ID, AvatarID: first.ID, IP: "127.0.0.1", UserAgent: "test",
		CreatedAt: testNow, LastSeenAt: testNow, ExpiresAt: testNow.Add(time.Hour),
	}); err != nil {
		t.Fatalf("CreateSession: %v", err)
	}
	ticket := func(id string, avatarID int64) {
		t.Helper()
		if err := q.CreateSSOTicket(ctx, CreateSSOTicketParams{ID: id, SessionID: "digest", AvatarID: avatarID, IP: "127.0.0.1", CreatedAt: testNow}); err != nil {
			t.Fatalf("CreateSSOTicket %s: %v", id, err)
		}
	}
	spend := func(id string, now time.Time) (int64, error) {
		return q.SpendSSOTicket(ctx, SpendSSOTicketParams{ID: id, Now: now})
	}

	ticket("one", first.ID)
	if got, err := q.GetSessionSSOTicket(ctx, "digest"); err != nil || got.ID != "one" {
		t.Errorf("the session's ticket = %q, %v; want one", got.ID, err)
	}
	if avatarID, err := spend("one", testNow); err != nil || avatarID != first.ID {
		t.Errorf("spending one = %d, %v; want %d", avatarID, err, first.ID)
	}
	if _, err := spend("one", testNow); !IsNotFound(err) {
		t.Errorf("spending one again = %v, want not found", err)
	}
	if _, err := q.GetSessionSSOTicket(ctx, "digest"); !IsNotFound(err) {
		t.Errorf("the session's spent ticket = %v, want not found", err)
	}

	ticket("two", first.ID)
	if _, err := q.SwitchSessionAvatar(ctx, SwitchSessionAvatarParams{ID: "digest", AvatarID: second.ID}); err != nil {
		t.Fatalf("SwitchSessionAvatar: %v", err)
	}
	if _, err := q.GetSessionSSOTicket(ctx, "digest"); !IsNotFound(err) {
		t.Errorf("a ticket for the habbo the session left = %v, want not found", err)
	}
	if _, err := spend("two", testNow); !IsNotFound(err) {
		t.Errorf("spending a ticket for the habbo the session left = %v, want not found", err)
	}

	ticket("three", second.ID)
	if _, err := spend("three", testNow.Add(time.Hour)); !IsNotFound(err) {
		t.Errorf("spending a ticket of an expired session = %v, want not found", err)
	}
	if err := q.DeleteSession(ctx, "digest"); err != nil {
		t.Fatalf("DeleteSession: %v", err)
	}
	if _, err := spend("three", testNow); !IsNotFound(err) {
		t.Errorf("spending a ticket of a deleted session = %v, want not found", err)
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

func TestStaffLogsNameTheActorAndTheTarget(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	q := New(db)
	actor, first := createUserWithHabbo(t, q, "actor@example.com", "First")
	if _, err := q.CreateAvatar(ctx, CreateAvatarParams{
		UserID: actor.ID, Name: "Second", Figure: "hd-180-1", Gender: "M",
		CreatedAt: testNow.Add(time.Hour), UpdatedAt: testNow.Add(time.Hour),
	}); err != nil {
		t.Fatalf("CreateAvatar: %v", err)
	}
	target, targetHabbo := createUserWithHabbo(t, q, "target@example.com", "Target")

	write := func(params CreateStaffLogParams) {
		t.Helper()
		params.Action, params.IP, params.CreatedAt = "settings.update", "10.0.0.1", testNow
		if err := q.CreateStaffLog(ctx, params); err != nil {
			t.Fatalf("CreateStaffLog: %v", err)
		}
	}
	user := func(id int64) sql.NullInt64 { return sql.NullInt64{Int64: id, Valid: true} }
	write(CreateStaffLogParams{UserID: user(actor.ID)})
	write(CreateStaffLogParams{UserID: user(actor.ID), TargetUserID: user(target.ID)})
	write(CreateStaffLogParams{UserID: user(actor.ID), TargetAvatarID: user(first.ID)})
	write(CreateStaffLogParams{UserID: user(actor.ID), TargetUserID: user(target.ID), TargetAvatarID: user(targetHabbo.ID)})

	count, err := q.CountStaffLogs(ctx)
	if err != nil || count != 4 {
		t.Fatalf("CountStaffLogs = %d, %v, want 4", count, err)
	}
	rows, err := q.ListStaffLogs(ctx, ListStaffLogsParams{RowLimit: 10})
	if err != nil {
		t.Fatalf("ListStaffLogs: %v", err)
	}
	var names [][2]string
	for _, row := range rows {
		names = append(names, [2]string{row.UserName, row.TargetName})
	}
	want := [][2]string{{"First", "Target"}, {"First", "First"}, {"First", "Target"}, {"First", ""}}
	if !slices.Equal(names, want) {
		t.Errorf("names newest first = %v, want %v", names, want)
	}

	page, err := q.ListStaffLogs(ctx, ListStaffLogsParams{RowLimit: 1, RowOffset: 3})
	if err != nil || len(page) != 1 || page[0].ID != rows[3].ID {
		t.Errorf("ListStaffLogs with an offset = %+v, %v, want the oldest row", page, err)
	}
}

func TestPreviousLoginIsTheOneBeforeTheNewest(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	q := New(db)
	user, _ := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	other, _ := createUserWithHabbo(t, q, "other@example.com", "Other")

	attempt := func(userID int64, ip string, succeeded bool, at time.Time) {
		t.Helper()
		err := q.CreateLoginAttempt(ctx, CreateLoginAttemptParams{
			UserID:    sql.NullInt64{Int64: userID, Valid: true},
			IP:        ip,
			Succeeded: succeeded,
			CreatedAt: at,
		})
		if err != nil {
			t.Fatalf("CreateLoginAttempt: %v", err)
		}
	}

	attempt(user.ID, "10.0.0.1", true, testNow.Add(-3*time.Hour))
	if _, err := q.GetPreviousLogin(ctx, user.ID); !IsNotFound(err) {
		t.Fatalf("GetPreviousLogin after one sign-in: %v, want not found", err)
	}

	attempt(user.ID, "10.0.0.2", true, testNow.Add(-2*time.Hour))
	attempt(user.ID, "10.0.0.3", false, testNow.Add(-90*time.Minute))
	attempt(other.ID, "10.0.0.4", true, testNow.Add(-80*time.Minute))
	attempt(user.ID, "10.0.0.5", true, testNow.Add(-time.Hour))
	attempt(user.ID, "10.0.0.6", false, testNow.Add(-time.Minute))

	got, err := q.GetPreviousLogin(ctx, user.ID)
	if err != nil {
		t.Fatalf("GetPreviousLogin: %v", err)
	}
	if got.IP != "10.0.0.2" || !got.CreatedAt.Equal(testNow.Add(-2*time.Hour)) {
		t.Errorf("GetPreviousLogin = %+v, want the sign-in from 10.0.0.2", got)
	}
}
