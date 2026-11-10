package game

import (
	"database/sql"
	"errors"
	"path/filepath"
	"slices"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

type session struct{ events []any }

func (s *session) Notify(event any) { s.events = append(s.events, event) }

func openDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

// frank makes a user with the habbo Frank, signed in to the CMS on a session
// holding one ticket per name in tickets, and takes Frank offline after the test.
func frank(t *testing.T, db *sql.DB, tickets ...string) int64 {
	t.Helper()
	ctx := t.Context()
	q := store.New(db)
	now := time.Now().UTC()
	user, err := q.CreateUser(ctx, store.CreateUserParams{Email: "frank@example.com", BornOn: time.Date(2000, 1, 2, 0, 0, 0, 0, time.UTC), CreatedIP: "127.0.0.1", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}
	avatar, err := q.CreateAvatar(ctx, store.CreateAvatarParams{UserID: user.ID, Name: "Frank", Figure: "hd-180-1", Gender: "M", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatalf("CreateAvatar: %v", err)
	}
	err = q.CreateSession(ctx, store.CreateSessionParams{ID: "cms-session", UserID: user.ID, AvatarID: avatar.ID, IP: "127.0.0.1", CreatedAt: now, LastSeenAt: now, ExpiresAt: now.Add(time.Hour)})
	if err != nil {
		t.Fatalf("CreateSession: %v", err)
	}
	for _, ticket := range tickets {
		err := q.CreateSSOTicket(ctx, store.CreateSSOTicketParams{ID: ticket, SessionID: "cms-session", AvatarID: avatar.ID, IP: "127.0.0.1", CreatedAt: now})
		if err != nil {
			t.Fatalf("CreateSSOTicket: %v", err)
		}
	}
	t.Cleanup(func() {
		if h, ok := habbo.Get(avatar.ID); ok {
			habbo.Drop(avatar.ID, h.Session)
		}
	})
	return avatar.ID
}

func gameData(t *testing.T, db *sql.DB, avatarID int64) store.AvatarGameData {
	t.Helper()
	data, err := store.New(db).GetAvatarGameData(t.Context(), avatarID)
	if err != nil {
		t.Fatalf("GetAvatarGameData: %v", err)
	}
	return data
}

func TestATicketLogsItsHabboInOnce(t *testing.T) {
	db := openDB(t)
	id := frank(t, db, "ticket-1")
	s, other := &session{}, &session{}

	h, err := Login(t.Context(), db, s, "ticket-1", "")
	if err != nil || h.ID != id || h.Name != "Frank" || h.Session != s {
		t.Fatalf("Login() = %+v, %v, want Frank on the session", h, err)
	}
	if online, ok := habbo.Get(id); !ok || online.Session != s {
		t.Error("Frank is not online on the session")
	}

	for _, ticket := range []string{"ticket-1", "unknown", ""} {
		if _, err := Login(t.Context(), db, other, ticket, ""); !errors.Is(err, ErrInvalidTicket) {
			t.Errorf("Login(%q) = %v, want ErrInvalidTicket", ticket, err)
		}
	}
	if online, _ := habbo.Get(id); online.Session != s || len(s.events) != 0 {
		t.Errorf("a refused login touched Frank's session: %+v", s.events)
	}
}

func TestLoginSavesTheMachineIDAndTheLastTimeOnline(t *testing.T) {
	db := openDB(t)
	id := frank(t, db, "ticket-1", "ticket-2")

	before := time.Now().UTC()
	if _, err := Login(t.Context(), db, &session{}, "ticket-1", "machine-1"); err != nil {
		t.Fatalf("Login: %v", err)
	}
	after := time.Now().UTC()
	data := gameData(t, db, id)
	if data.MachineID != (sql.NullString{String: "machine-1", Valid: true}) {
		t.Errorf("machine id = %v, want machine-1", data.MachineID)
	}
	if !data.LastOnlineAt.Valid || data.LastOnlineAt.Time.Before(before) || data.LastOnlineAt.Time.After(after) {
		t.Errorf("last time online = %v, want the login's", data.LastOnlineAt)
	}

	if _, err := Login(t.Context(), db, &session{}, "ticket-2", ""); err != nil {
		t.Fatalf("Login: %v", err)
	}
	if data := gameData(t, db, id); data.MachineID.String != "machine-1" {
		t.Errorf("a login without a machine id left %v, want machine-1 kept", data.MachineID)
	}
}

func TestASecondLoginEndsTheFirstSession(t *testing.T) {
	db := openDB(t)
	id := frank(t, db, "ticket-1", "ticket-2")
	first, second := &session{}, &session{}
	if _, err := Login(t.Context(), db, first, "ticket-1", ""); err != nil {
		t.Fatalf("Login: %v", err)
	}

	if _, err := Login(t.Context(), db, second, "ticket-2", ""); err != nil {
		t.Fatalf("second Login: %v", err)
	}
	if !slices.Equal(first.events, []any{ConcurrentLogin{}}) || len(second.events) != 0 {
		t.Errorf("events = %v and %v, want ConcurrentLogin for the first session only", first.events, second.events)
	}
	if online, _ := habbo.Get(id); online.Session != second {
		t.Error("Frank is not online on the second session")
	}

	if err := Logout(t.Context(), db, first, id); err != nil {
		t.Fatalf("Logout: %v", err)
	}
	if online, ok := habbo.Get(id); !ok || online.Session != second {
		t.Error("the replaced session logged Frank out")
	}
}

func TestLogoutWritesTheLastTimeOnline(t *testing.T) {
	db := openDB(t)
	id := frank(t, db, "ticket-1")
	s := &session{}
	if _, err := Login(t.Context(), db, s, "ticket-1", ""); err != nil {
		t.Fatalf("Login: %v", err)
	}
	earlier := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	err := store.New(db).SetAvatarLastOnline(t.Context(), store.SetAvatarLastOnlineParams{AvatarID: id, LastOnlineAt: sql.NullTime{Time: earlier, Valid: true}})
	if err != nil {
		t.Fatal(err)
	}

	before := time.Now().UTC()
	if err := Logout(t.Context(), db, s, id); err != nil {
		t.Fatalf("Logout: %v", err)
	}
	if _, ok := habbo.Get(id); ok {
		t.Error("Frank is still online after logging out")
	}
	if data := gameData(t, db, id); !data.LastOnlineAt.Valid || data.LastOnlineAt.Time.Before(before) {
		t.Errorf("last time online = %v, want the logout's", data.LastOnlineAt)
	}
}
