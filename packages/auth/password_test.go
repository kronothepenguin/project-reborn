package auth

import (
	"errors"
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
	for password, valid := range map[string]bool{
		"12345":                 false,
		"123456":                true,
		strings.Repeat("a", 25): true,
		strings.Repeat("a", 26): false,
		strings.Repeat("ñ", 25): true,
	} {
		err := f.auth.ValidatePassword(password)
		if valid != (err == nil) {
			t.Errorf("ValidatePassword(%d characters) = %v, want valid %t", len([]rune(password)), err, valid)
		}
		if err != nil && !errors.Is(err, ErrPasswordLength) {
			t.Errorf("ValidatePassword() error = %v, want ErrPasswordLength", err)
		}
	}

	f.set(t, "auth.passwordMinLength", 8)
	if err := f.auth.ValidatePassword("1234567"); !errors.Is(err, ErrPasswordLength) {
		t.Errorf("ValidatePassword() = %v after raising the minimum to 8, want ErrPasswordLength", err)
	}
}
