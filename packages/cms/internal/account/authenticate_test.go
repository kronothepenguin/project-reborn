package account

import (
	"errors"
	"path/filepath"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	testUsername = "NewHabbo"
	testPassword = "secret123"
)

func newTestService(t *testing.T, policy LoginPolicy) (*Service, *store.Store, int64) {
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

	hasher := NewHasher(4)
	hash, err := hasher.Hash(testPassword)
	if err != nil {
		t.Fatalf("Hash: %v", err)
	}
	id, err := db.CreateUser(t.Context(), store.CreateUserParams{
		Username:          testUsername,
		UsernameCanonical: Canonical(testUsername),
		PasswordHash:      hash,
		Email:             "new@example.com",
		EmailCanonical:    "new@example.com",
		BirthDate:         631152000,
		Avatar:            "female",
		TermsAcceptedAt:   1700000000,
		CreatedAt:         1700000000,
	})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}
	return NewService(db, hasher, policy), db, id
}

func TestAuthenticateSuccessUpdatesLastSignedIn(t *testing.T) {
	service, db, userID := newTestService(t, LoginPolicy{MaxFailures: 3, Window: 15 * time.Minute, Lock: 15 * time.Minute})
	now := time.Unix(1_700_000_000, 0).UTC()
	service.now = func() time.Time { return now }

	user, err := service.Authenticate(t.Context(), "newhabbo", testPassword, "10.0.0.1:1234")
	if err != nil {
		t.Fatalf("Authenticate: %v", err)
	}
	if user.ID != userID {
		t.Errorf("user.ID = %d, want %d", user.ID, userID)
	}
	if user.Username != testUsername {
		t.Errorf("user.Username = %q, want %q", user.Username, testUsername)
	}

	stored, err := db.GetUserByID(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetUserByID: %v", err)
	}
	if stored.LastSignedInAt != now.Unix() {
		t.Errorf("LastSignedInAt = %d, want %d", stored.LastSignedInAt, now.Unix())
	}
}

func TestAuthenticateClearsAccountKeyButNotAddressKey(t *testing.T) {
	service, db, _ := newTestService(t, LoginPolicy{MaxFailures: 5, Window: 15 * time.Minute, Lock: 15 * time.Minute})
	now := time.Unix(1_700_000_000, 0).UTC()
	service.now = func() time.Time { return now }

	if _, err := service.Authenticate(t.Context(), testUsername, "wrong-password", "10.0.0.1:1234"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("Authenticate(wrong) error = %v, want ErrInvalidCredentials", err)
	}

	if _, err := service.Authenticate(t.Context(), testUsername, testPassword, "10.0.0.1:1234"); err != nil {
		t.Fatalf("Authenticate(correct): %v", err)
	}

	if _, err := db.GetLoginAttempt(t.Context(), "u:"+Canonical(testUsername)); !store.IsNotFound(err) {
		t.Errorf("account key survived a successful sign-in: %v", err)
	}
	if _, err := db.GetLoginAttempt(t.Context(), "ip:10.0.0.1"); err != nil {
		t.Errorf("address key was cleared too: %v", err)
	}
}

func TestAuthenticateRecordsFailuresForBothKeys(t *testing.T) {
	service, db, _ := newTestService(t, LoginPolicy{MaxFailures: 5, Window: 15 * time.Minute, Lock: 15 * time.Minute})
	now := time.Unix(1_700_000_000, 0).UTC()
	service.now = func() time.Time { return now }

	if _, err := service.Authenticate(t.Context(), testUsername, "wrong-password", "10.0.0.1:1234"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("Authenticate error = %v, want ErrInvalidCredentials", err)
	}

	for _, key := range []string{"u:" + Canonical(testUsername), "ip:10.0.0.1"} {
		attempt, err := db.GetLoginAttempt(t.Context(), key)
		if err != nil {
			t.Fatalf("GetLoginAttempt(%q): %v", key, err)
		}
		if attempt.Failures != 1 {
			t.Errorf("%s failures = %d, want 1", key, attempt.Failures)
		}
		if attempt.LockedUntil != 0 {
			t.Errorf("%s locked_until = %d, want 0", key, attempt.LockedUntil)
		}
	}
}

func TestAuthenticateUnknownUsernameFailsGenericallyAndThrottles(t *testing.T) {
	service, db, _ := newTestService(t, LoginPolicy{MaxFailures: 5, Window: 15 * time.Minute, Lock: 15 * time.Minute})
	now := time.Unix(1_700_000_000, 0).UTC()
	service.now = func() time.Time { return now }

	_, err := service.Authenticate(t.Context(), "ghost", "irrelevant", "10.0.0.2:1234")
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("Authenticate(unknown) error = %v, want ErrInvalidCredentials", err)
	}
	if _, err := db.GetLoginAttempt(t.Context(), "u:ghost"); err != nil {
		t.Errorf("unknown username was not throttled: %v", err)
	}
	if _, err := db.GetLoginAttempt(t.Context(), "ip:10.0.0.2"); err != nil {
		t.Errorf("address was not throttled: %v", err)
	}
}

func TestAuthenticateAddressKeyIgnoresEphemeralPort(t *testing.T) {
	service, db, _ := newTestService(t, LoginPolicy{MaxFailures: 5, Window: 15 * time.Minute, Lock: 15 * time.Minute})
	now := time.Unix(1_700_000_000, 0).UTC()
	service.now = func() time.Time { return now }

	if _, err := service.Authenticate(t.Context(), testUsername, "wrong-password", "203.0.113.9:54321"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("Authenticate error = %v, want ErrInvalidCredentials", err)
	}
	if _, err := db.GetLoginAttempt(t.Context(), "ip:203.0.113.9"); err != nil {
		t.Errorf("address key does not ignore the ephemeral port: %v", err)
	}
}

func TestAuthenticateWindowResetsFailures(t *testing.T) {
	service, db, _ := newTestService(t, LoginPolicy{MaxFailures: 5, Window: 15 * time.Minute, Lock: 15 * time.Minute})
	now := time.Unix(1_700_000_000, 0).UTC()
	service.now = func() time.Time { return now }

	if _, err := service.Authenticate(t.Context(), testUsername, "wrong-password", "10.0.0.1:1234"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("first failure: %v", err)
	}
	now = now.Add(16 * time.Minute)
	if _, err := service.Authenticate(t.Context(), testUsername, "wrong-password", "10.0.0.1:1234"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("second failure: %v", err)
	}

	attempt, err := db.GetLoginAttempt(t.Context(), "u:"+Canonical(testUsername))
	if err != nil {
		t.Fatalf("GetLoginAttempt: %v", err)
	}
	if attempt.Failures != 1 {
		t.Errorf("failures = %d, want a window reset to 1", attempt.Failures)
	}
	if attempt.UpdatedAt != now.Unix() {
		t.Errorf("updated_at = %d, want %d", attempt.UpdatedAt, now.Unix())
	}
}

func TestAuthenticateLocksAndUnlocks(t *testing.T) {
	service, _, _ := newTestService(t, LoginPolicy{MaxFailures: 2, Window: 15 * time.Minute, Lock: 15 * time.Minute})
	now := time.Unix(1_700_000_000, 0).UTC()
	service.now = func() time.Time { return now }

	for i := range 2 {
		if _, err := service.Authenticate(t.Context(), testUsername, "wrong-password", "10.0.0.1:1234"); !errors.Is(err, ErrInvalidCredentials) {
			t.Fatalf("failure %d: %v", i+1, err)
		}
	}

	if _, err := service.Authenticate(t.Context(), testUsername, testPassword, "10.0.0.1:1234"); !errors.Is(err, ErrLocked) {
		t.Fatalf("locked Authenticate error = %v, want ErrLocked", err)
	}

	now = now.Add(16 * time.Minute)
	if _, err := service.Authenticate(t.Context(), testUsername, testPassword, "10.0.0.1:1234"); err != nil {
		t.Fatalf("Authenticate after lock expiry: %v", err)
	}
}
