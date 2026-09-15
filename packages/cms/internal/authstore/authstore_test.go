package authstore

import (
	"errors"
	"path/filepath"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func newTestStore(t *testing.T) (*Store, *store.Store) {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "store.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() {
		if err := db.Close(); err != nil {
			t.Errorf("Close: %v", err)
		}
	})
	return New(db), db
}

func seedUser(t *testing.T, db *store.Store, username string) int64 {
	t.Helper()
	id, err := db.CreateUser(t.Context(), store.CreateUserParams{
		Username:          username,
		UsernameCanonical: username,
		PasswordHash:      "not-a-real-hash",
		Email:             username + "@example.com",
		EmailCanonical:    username + "@example.com",
		BirthDate:         631152000,
		Avatar:            "female",
		TermsAcceptedAt:   1700000000,
		CreatedAt:         1700000000,
	})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}
	return id
}

func newSession(accountID int64, id string, created time.Time) *auth.Session {
	return &auth.Session{
		ID:                id,
		AccountID:         accountID,
		CreatedAt:         created,
		LastSeenAt:        created,
		IdleExpiresAt:     created.Add(30 * time.Minute),
		AbsoluteExpiresAt: created.Add(12 * time.Hour),
		Remember:          true,
		UserAgent:         "test-agent",
		Address:           "127.0.0.1:1234",
	}
}

func TestCreateAndValidateRoundTrip(t *testing.T) {
	adapter, db := newTestStore(t)
	userID := seedUser(t, db, "newhabbo")
	created := time.Unix(1_700_000_000, 0).UTC()
	record := newSession(userID, "digest-one", created)

	if err := adapter.Create(t.Context(), record); err != nil {
		t.Fatalf("Create: %v", err)
	}

	got, err := adapter.Validate(t.Context(), "digest-one")
	if err != nil {
		t.Fatalf("Validate: %v", err)
	}
	if got.ID != record.ID {
		t.Errorf("ID = %q, want %q", got.ID, record.ID)
	}
	if got.AccountID != userID {
		t.Errorf("AccountID = %d, want %d", got.AccountID, userID)
	}
	if !got.CreatedAt.Equal(created) {
		t.Errorf("CreatedAt = %v, want %v", got.CreatedAt, created)
	}
	if !got.IdleExpiresAt.Equal(record.IdleExpiresAt) {
		t.Errorf("IdleExpiresAt = %v, want %v", got.IdleExpiresAt, record.IdleExpiresAt)
	}
	if !got.AbsoluteExpiresAt.Equal(record.AbsoluteExpiresAt) {
		t.Errorf("AbsoluteExpiresAt = %v, want %v", got.AbsoluteExpiresAt, record.AbsoluteExpiresAt)
	}
	if !got.Remember {
		t.Error("Remember = false, want true")
	}
	if !got.RevokedAt.IsZero() {
		t.Errorf("RevokedAt = %v, want zero", got.RevokedAt)
	}
	if got.UserAgent != "test-agent" || got.Address != "127.0.0.1:1234" {
		t.Errorf("UserAgent/Address = %q/%q, want test-agent/127.0.0.1:1234", got.UserAgent, got.Address)
	}
}

func TestValidateAbsentAndRevoked(t *testing.T) {
	adapter, db := newTestStore(t)
	userID := seedUser(t, db, "newhabbo")

	if _, err := adapter.Validate(t.Context(), "missing"); !errors.Is(err, auth.ErrNotFound) {
		t.Fatalf("Validate(missing) error = %v, want auth.ErrNotFound", err)
	}

	record := newSession(userID, "digest-two", time.Unix(1_700_000_000, 0).UTC())
	if err := adapter.Create(t.Context(), record); err != nil {
		t.Fatalf("Create: %v", err)
	}
	if err := adapter.Revoke(t.Context(), record.ID); err != nil {
		t.Fatalf("Revoke: %v", err)
	}

	got, err := adapter.Validate(t.Context(), record.ID)
	if err != nil {
		t.Fatalf("Validate(revoked) error = %v, want the record so the library can deny", err)
	}
	if got.RevokedAt.IsZero() {
		t.Fatal("Validate(revoked) returned a record with zero RevokedAt")
	}
}

func TestTouchUpdatesOnlyActivity(t *testing.T) {
	adapter, db := newTestStore(t)
	userID := seedUser(t, db, "newhabbo")
	created := time.Unix(1_700_000_000, 0).UTC()
	record := newSession(userID, "digest-three", created)
	if err := adapter.Create(t.Context(), record); err != nil {
		t.Fatalf("Create: %v", err)
	}

	touched := *record
	touched.LastSeenAt = created.Add(5 * time.Minute)
	touched.IdleExpiresAt = created.Add(35 * time.Minute)
	touched.RevokedAt = created.Add(time.Hour)
	touched.UserAgent = "changed-agent"
	if err := adapter.Touch(t.Context(), &touched); err != nil {
		t.Fatalf("Touch: %v", err)
	}

	got, err := adapter.Validate(t.Context(), record.ID)
	if err != nil {
		t.Fatalf("Validate: %v", err)
	}
	if !got.LastSeenAt.Equal(touched.LastSeenAt) {
		t.Errorf("LastSeenAt = %v, want %v", got.LastSeenAt, touched.LastSeenAt)
	}
	if !got.IdleExpiresAt.Equal(touched.IdleExpiresAt) {
		t.Errorf("IdleExpiresAt = %v, want %v", got.IdleExpiresAt, touched.IdleExpiresAt)
	}
	if got.UserAgent != "test-agent" {
		t.Errorf("Touch changed UserAgent to %q", got.UserAgent)
	}
	if !got.RevokedAt.IsZero() {
		t.Errorf("Touch changed RevokedAt to %v", got.RevokedAt)
	}
}

func TestRevokeIsIdempotent(t *testing.T) {
	adapter, db := newTestStore(t)
	userID := seedUser(t, db, "newhabbo")
	record := newSession(userID, "digest-four", time.Unix(1_700_000_000, 0).UTC())
	if err := adapter.Create(t.Context(), record); err != nil {
		t.Fatalf("Create: %v", err)
	}

	if err := adapter.Revoke(t.Context(), record.ID); err != nil {
		t.Fatalf("first Revoke: %v", err)
	}
	if err := adapter.Revoke(t.Context(), record.ID); err != nil {
		t.Fatalf("second Revoke: %v", err)
	}
	if err := adapter.Revoke(t.Context(), "never-existed"); err != nil {
		t.Fatalf("Revoke(absent): %v", err)
	}
}

func TestRevokeAccountKeepsSurvivor(t *testing.T) {
	adapter, db := newTestStore(t)
	userID := seedUser(t, db, "newhabbo")
	otherID := seedUser(t, db, "otherhabbo")
	base := time.Unix(1_700_000_000, 0).UTC()

	first := newSession(userID, "digest-a", base)
	second := newSession(userID, "digest-b", base.Add(time.Minute))
	foreign := newSession(otherID, "digest-c", base.Add(2*time.Minute))
	for _, record := range []*auth.Session{first, second, foreign} {
		if err := adapter.Create(t.Context(), record); err != nil {
			t.Fatalf("Create(%s): %v", record.ID, err)
		}
	}

	revoked, err := adapter.RevokeAccount(t.Context(), userID, "digest-b")
	if err != nil {
		t.Fatalf("RevokeAccount: %v", err)
	}
	if len(revoked) != 1 || revoked[0].ID != "digest-a" {
		t.Fatalf("RevokeAccount returned %+v, want only digest-a", revoked)
	}
	if revoked[0].RevokedAt.IsZero() {
		t.Error("returned session has zero RevokedAt")
	}

	survivor, err := adapter.Validate(t.Context(), "digest-b")
	if err != nil {
		t.Fatalf("Validate(survivor): %v", err)
	}
	if !survivor.RevokedAt.IsZero() {
		t.Errorf("survivor RevokedAt = %v, want zero", survivor.RevokedAt)
	}
	revokedFirst, err := adapter.Validate(t.Context(), "digest-a")
	if err != nil {
		t.Fatalf("Validate(revoked): %v", err)
	}
	if revokedFirst.RevokedAt.IsZero() {
		t.Error("digest-a was not revoked")
	}
	foreignRecord, err := adapter.Validate(t.Context(), "digest-c")
	if err != nil {
		t.Fatalf("Validate(foreign): %v", err)
	}
	if !foreignRecord.RevokedAt.IsZero() {
		t.Error("foreign account session was revoked")
	}
}

func TestListOrdersNewestFirst(t *testing.T) {
	adapter, db := newTestStore(t)
	userID := seedUser(t, db, "newhabbo")
	base := time.Unix(1_700_000_000, 0).UTC()

	for _, record := range []*auth.Session{
		newSession(userID, "digest-old", base),
		newSession(userID, "digest-new", base.Add(time.Hour)),
		newSession(userID, "digest-mid", base.Add(30*time.Minute)),
	} {
		if err := adapter.Create(t.Context(), record); err != nil {
			t.Fatalf("Create: %v", err)
		}
	}

	list, err := adapter.List(t.Context(), userID)
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if len(list) != 3 {
		t.Fatalf("List returned %d sessions, want 3", len(list))
	}
	want := []string{"digest-new", "digest-mid", "digest-old"}
	for i, id := range want {
		if list[i].ID != id {
			t.Errorf("List[%d].ID = %q, want %q", i, list[i].ID, id)
		}
	}
}

func TestPurgeRemovesRevokedAndExpiredOnly(t *testing.T) {
	adapter, db := newTestStore(t)
	userID := seedUser(t, db, "newhabbo")
	base := time.Unix(1_700_000_000, 0).UTC()

	active := newSession(userID, "digest-active", base)
	revoked := newSession(userID, "digest-revoked", base)
	expired := newSession(userID, "digest-expired", base)
	expired.IdleExpiresAt = base.Add(-time.Hour)
	expired.AbsoluteExpiresAt = base.Add(-time.Minute)

	for _, record := range []*auth.Session{active, revoked, expired} {
		if err := adapter.Create(t.Context(), record); err != nil {
			t.Fatalf("Create: %v", err)
		}
	}
	if err := adapter.Revoke(t.Context(), revoked.ID); err != nil {
		t.Fatalf("Revoke: %v", err)
	}

	removed, err := adapter.Purge(t.Context(), base)
	if err != nil {
		t.Fatalf("Purge: %v", err)
	}
	if removed != 2 {
		t.Fatalf("Purge removed %d rows, want 2", removed)
	}
	if _, err := adapter.Validate(t.Context(), active.ID); err != nil {
		t.Errorf("active session was purged: %v", err)
	}
	if _, err := adapter.Validate(t.Context(), revoked.ID); !errors.Is(err, auth.ErrNotFound) {
		t.Errorf("revoked session survived purge: %v", err)
	}
	if _, err := adapter.Validate(t.Context(), expired.ID); !errors.Is(err, auth.ErrNotFound) {
		t.Errorf("expired session survived purge: %v", err)
	}
}
