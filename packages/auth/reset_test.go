package auth

import (
	"context"
	"encoding/base64"
	"errors"
	"sync"
	"testing"
	"time"
)

func (f *fixture) reset(t *testing.T) string {
	t.Helper()
	reset, err := CreateReset(t.Context(), f.db, "Admin", "admin@example.com")
	if err != nil || reset == nil {
		t.Fatalf("CreateReset() = %+v, %v, want a reset", reset, err)
	}
	return reset.Token
}

func TestCreateResetNeedsTheNameAndTheAddressOfOneAccount(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.habbo(t, "other@example.com", "Other", testPassword)

	for _, c := range []struct{ name, email string }{
		{"Admin", "nobody@example.com"},
		{"Nobody", "admin@example.com"},
		{"Other", "admin@example.com"},
		{"Admin", "other@example.com"},
		{"", ""},
	} {
		reset, err := CreateReset(t.Context(), f.db, c.name, c.email)
		if err != nil || reset != nil {
			t.Errorf("CreateReset(%q, %q) = %+v, %v, want no reset and no error", c.name, c.email, reset, err)
		}
	}
	if n := f.count(t, `SELECT COUNT(*) FROM password_resets`); n != 0 {
		t.Errorf("%d resets stored", n)
	}
}

func TestCreateResetReturnsTheStoredNames(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)

	reset, err := CreateReset(t.Context(), f.db, "aDMIN", "ADMIN@example.com")
	if err != nil || reset == nil {
		t.Fatalf("CreateReset() = %+v, %v, want a reset", reset, err)
	}
	if reset.Name != "Admin" || reset.Email != "admin@example.com" {
		t.Errorf("reset = %+v, want the stored name and address", reset)
	}
}

func TestCreateResetStopsAtTheLimit(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.habbo(t, "other@example.com", "Other", testPassword)
	f.set(t, "auth.resetMaxActive", 2)

	f.reset(t)
	f.reset(t)
	reset, err := CreateReset(t.Context(), f.db, "Admin", "admin@example.com")
	if err != nil || reset != nil {
		t.Fatalf("CreateReset at the limit = %+v, %v, want no reset and no error", reset, err)
	}
	if reset, _ := CreateReset(t.Context(), f.db, "Other", "other@example.com"); reset == nil {
		t.Error("the limit of one account stopped another")
	}

	f.advance(60*time.Minute + time.Second)
	f.reset(t)
}

func TestCreateResetKeepsTheLimitForRequestsAtOnce(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)

	var wg sync.WaitGroup
	for range 20 {
		wg.Go(func() {
			if _, err := CreateReset(context.Background(), f.db, "Admin", "admin@example.com"); err != nil {
				t.Errorf("CreateReset: %v", err)
			}
		})
	}
	wg.Wait()
	if n := f.count(t, `SELECT COUNT(*) FROM password_resets`); n != 3 {
		t.Errorf("%d resets stored, want the limit of 3", n)
	}
}

func TestResetPasswordWorksOnce(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)

	token := f.reset(t)
	id, _ := digest(token)
	if f.count(t, `SELECT COUNT(*) FROM password_resets WHERE id = ?`, id) != 1 ||
		f.count(t, `SELECT COUNT(*) FROM password_resets WHERE id = ?`, token) != 0 {
		t.Error("the reset is not stored under the digest of its token")
	}

	if err := ResetPassword(t.Context(), f.db, token, "new-secret"); err != nil {
		t.Fatalf("ResetPassword: %v", err)
	}
	if _, ok, _ := f.visit(t, cookie); ok {
		t.Error("a session survived the reset")
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", testPassword, false); !errors.Is(err, ErrInvalidCredentials) {
		t.Errorf("Login with the old password = %v, want ErrInvalidCredentials", err)
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", "new-secret", false); err != nil {
		t.Errorf("Login with the new password = %v, want a session", err)
	}
	if err := ResetPassword(t.Context(), f.db, token, "another-secret"); !errors.Is(err, ErrInvalidReset) {
		t.Errorf("a second ResetPassword with the token = %v, want ErrInvalidReset", err)
	}
}

func TestResetPasswordEndsTheOtherResetsOfTheUser(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	first := f.reset(t)
	second := f.reset(t)

	if err := ResetPassword(t.Context(), f.db, second, "new-secret"); err != nil {
		t.Fatalf("ResetPassword: %v", err)
	}
	if err := ResetPassword(t.Context(), f.db, first, "another-secret"); !errors.Is(err, ErrInvalidReset) {
		t.Errorf("ResetPassword with an older token = %v, want ErrInvalidReset", err)
	}
}

func TestResetTokensExpire(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	token := f.reset(t)

	f.advance(60*time.Minute + time.Second)
	if err := ResetPassword(t.Context(), f.db, token, "new-secret"); !errors.Is(err, ErrInvalidReset) {
		t.Errorf("ResetPassword after 60 minutes = %v, want ErrInvalidReset", err)
	}
	f.reset(t)
	if n := f.count(t, `SELECT COUNT(*) FROM password_resets`); n != 1 {
		t.Errorf("%d resets stored, want the expired one purged", n)
	}
}

func TestResetPasswordChecksThePasswordFirst(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	token := f.reset(t)

	if err := ResetPassword(t.Context(), f.db, token, "short"); !errors.Is(err, ErrPasswordLength) {
		t.Errorf("ResetPassword with a short password = %v, want ErrPasswordLength", err)
	}
	if err := ResetPassword(t.Context(), f.db, token, "long enough"); err != nil {
		t.Errorf("the token stopped working after a rejected password: %v", err)
	}
}

func TestResetPasswordRejectsMalformedTokens(t *testing.T) {
	f := newFixture(t)
	for _, token := range []string{"", "not-a-token", base64.RawURLEncoding.EncodeToString(make([]byte, 32))} {
		if err := ResetPassword(t.Context(), f.db, token, "long enough"); !errors.Is(err, ErrInvalidReset) {
			t.Errorf("ResetPassword(%q) = %v, want ErrInvalidReset", token, err)
		}
	}
}
