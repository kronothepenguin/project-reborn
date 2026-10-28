package auth

import (
	"encoding/base64"
	"errors"
	"testing"
	"time"
)

func TestCreateResetForAnUnknownEmailDoesNothing(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)

	token, err := f.auth.CreateReset(t.Context(), "nobody@example.com")
	if err != nil || token != "" {
		t.Errorf("CreateReset() = %q, %v, want no token and no error", token, err)
	}
	if n := f.count(t, `SELECT COUNT(*) FROM password_resets`); n != 0 {
		t.Errorf("%d resets stored for an unknown email", n)
	}
}

func TestResetPasswordWorksOnce(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)

	token, err := f.auth.CreateReset(t.Context(), "ADMIN@example.com")
	if err != nil || token == "" {
		t.Fatalf("CreateReset() = %q, %v, want a token", token, err)
	}
	id, _ := digest(token)
	if f.count(t, `SELECT COUNT(*) FROM password_resets WHERE id = ?`, id) != 1 ||
		f.count(t, `SELECT COUNT(*) FROM password_resets WHERE id = ?`, token) != 0 {
		t.Error("the reset is not stored under the digest of its token")
	}

	if err := f.auth.ResetPassword(t.Context(), token, "new-secret"); err != nil {
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
	if err := f.auth.ResetPassword(t.Context(), token, "another-secret"); !errors.Is(err, ErrInvalidReset) {
		t.Errorf("a second ResetPassword with the token = %v, want ErrInvalidReset", err)
	}
}

func TestResetPasswordEndsTheOtherResetsOfTheUser(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	first, _ := f.auth.CreateReset(t.Context(), "admin@example.com")
	second, _ := f.auth.CreateReset(t.Context(), "admin@example.com")

	if err := f.auth.ResetPassword(t.Context(), second, "new-secret"); err != nil {
		t.Fatalf("ResetPassword: %v", err)
	}
	if err := f.auth.ResetPassword(t.Context(), first, "another-secret"); !errors.Is(err, ErrInvalidReset) {
		t.Errorf("ResetPassword with an older token = %v, want ErrInvalidReset", err)
	}
}

func TestResetTokensExpire(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	token, _ := f.auth.CreateReset(t.Context(), "admin@example.com")

	f.advance(60*time.Minute + time.Second)
	if err := f.auth.ResetPassword(t.Context(), token, "new-secret"); !errors.Is(err, ErrInvalidReset) {
		t.Errorf("ResetPassword after 60 minutes = %v, want ErrInvalidReset", err)
	}
	if _, err := f.auth.CreateReset(t.Context(), "admin@example.com"); err != nil {
		t.Fatalf("CreateReset: %v", err)
	}
	if n := f.count(t, `SELECT COUNT(*) FROM password_resets`); n != 1 {
		t.Errorf("%d resets stored, want the expired one purged", n)
	}
}

func TestResetPasswordChecksThePasswordFirst(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	token, _ := f.auth.CreateReset(t.Context(), "admin@example.com")

	if err := f.auth.ResetPassword(t.Context(), token, "short"); !errors.Is(err, ErrPasswordLength) {
		t.Errorf("ResetPassword with a short password = %v, want ErrPasswordLength", err)
	}
	if err := f.auth.ResetPassword(t.Context(), token, "long enough"); err != nil {
		t.Errorf("the token stopped working after a rejected password: %v", err)
	}
}

func TestResetPasswordRejectsMalformedTokens(t *testing.T) {
	f := newFixture(t)
	for _, token := range []string{"", "not-a-token", base64.RawURLEncoding.EncodeToString(make([]byte, 32))} {
		if err := f.auth.ResetPassword(t.Context(), token, "long enough"); !errors.Is(err, ErrInvalidReset) {
			t.Errorf("ResetPassword(%q) = %v, want ErrInvalidReset", token, err)
		}
	}
}
