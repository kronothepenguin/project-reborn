package auth

import (
	"errors"
	"net/http"
	"strings"
	"testing"
)

func TestHashPasswordWritesArgon2idPHC(t *testing.T) {
	hash := HashPassword("correct horse")
	if !strings.HasPrefix(hash, "$argon2id$v=19$m=19456,t=2,p=1$") {
		t.Errorf("HashPassword() = %q, want the argon2id PHC prefix with m=19456, t=2, p=1", hash)
	}
	if HashPassword("correct horse") == hash {
		t.Error("two hashes of one password are equal, so the salt is not random")
	}
}

func TestVerifyPassword(t *testing.T) {
	hash := HashPassword("correct horse")
	for password, want := range map[string]bool{"correct horse": true, "Correct horse": false, "": false} {
		ok, err := VerifyPassword(hash, password)
		if err != nil || ok != want {
			t.Errorf("VerifyPassword(%q) = %t, %v, want %t", password, ok, err, want)
		}
	}
}

func TestVerifyPasswordRejectsMalformedHashes(t *testing.T) {
	valid := HashPassword("x")
	withoutKey, _, _ := strings.CutLast(valid, "$")
	for _, hash := range []string{
		"",
		"5f4dcc3b5aa765d61d8327deb882cf99",
		strings.Replace(valid, "argon2id", "argon2i", 1),
		strings.Replace(valid, "v=19", "v=16", 1),
		strings.Replace(valid, "t=2", "t=0", 1),
		strings.Replace(valid, "p=1", "p=0", 1),
		strings.Replace(valid, "m=19456", "m=1", 1),
		withoutKey + "$!!!",
	} {
		if _, err := VerifyPassword(hash, "x"); err == nil {
			t.Errorf("VerifyPassword(%q) accepted a malformed hash", hash)
		}
	}
}

func TestNeedsRehash(t *testing.T) {
	if NeedsRehash(HashPassword("x")) {
		t.Error("a hash with the current parameters needs a rehash")
	}
	old := hashWith("x", argonParams{memory: 8 * 1024, time: 1, threads: 1})
	if !NeedsRehash(old) {
		t.Error("a hash with older parameters does not need a rehash")
	}
	if ok, err := VerifyPassword(old, "x"); err != nil || !ok {
		t.Errorf("a hash with older parameters no longer verifies: %t, %v", ok, err)
	}
}

func TestValidatePassword(t *testing.T) {
	f := newFixture(t)
	for password, want := range map[string]error{
		"12345":                 ErrPasswordTooShort,
		"123456":                nil,
		strings.Repeat("a", 25): nil,
		strings.Repeat("a", 26): ErrPasswordTooLong,
		strings.Repeat("ñ", 25): nil,
	} {
		err := ValidatePassword(password)
		if !errors.Is(err, want) {
			t.Errorf("ValidatePassword(%d characters) = %v, want %v", len([]rune(password)), err, want)
		}
		if want != nil && !errors.Is(err, ErrPasswordLength) {
			t.Errorf("ValidatePassword() error = %v, want it to match ErrPasswordLength", err)
		}
	}

	f.set(t, "auth.passwordMinLength", 8)
	if err := ValidatePassword("1234567"); !errors.Is(err, ErrPasswordLength) {
		t.Errorf("ValidatePassword() = %v after raising the minimum to 8, want ErrPasswordLength", err)
	}
}

func TestCheckPassword(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)

	for password, want := range map[string]bool{testPassword: true, "wrong-secret": false, "": false} {
		ok, err := CheckPassword(t.Context(), f.db, userID, password)
		if err != nil || ok != want {
			t.Errorf("CheckPassword(%q) = %t, %v, want %t", password, ok, err, want)
		}
	}
}

func TestChangePasswordEndsEverySessionAndReset(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	first := f.mustLogin(t, "Admin", false)
	second := f.mustLogin(t, "Admin", true)
	token := f.reset(t)

	if err := ChangePassword(t.Context(), f.db, userID, "brand-new-1"); err != nil {
		t.Fatalf("ChangePassword: %v", err)
	}
	for _, cookie := range []*http.Cookie{first, second} {
		if _, ok, _ := f.visit(t, cookie); ok {
			t.Error("a session survived the change")
		}
	}
	if err := ResetPassword(t.Context(), f.db, token, "another-one-2"); !errors.Is(err, ErrInvalidReset) {
		t.Errorf("ResetPassword after the change = %v, want ErrInvalidReset", err)
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", testPassword, false); !errors.Is(err, ErrInvalidCredentials) {
		t.Errorf("Login with the old password = %v, want ErrInvalidCredentials", err)
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", "brand-new-1", false); err != nil {
		t.Errorf("Login with the new password = %v, want a session", err)
	}
}

func TestChangePasswordValidates(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)

	if err := ChangePassword(t.Context(), f.db, userID, "short"); !errors.Is(err, ErrPasswordTooShort) {
		t.Errorf("ChangePassword(short) = %v, want ErrPasswordTooShort", err)
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", testPassword, false); err != nil {
		t.Errorf("Login after the refused change = %v, want a session", err)
	}
}
