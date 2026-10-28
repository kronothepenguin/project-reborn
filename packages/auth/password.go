package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"sync"
	"unicode/utf8"

	"golang.org/x/crypto/argon2"
)

type argonParams struct {
	memory  uint32
	time    uint32
	threads uint8
}

// current follows OWASP's argon2id recommendation (19 MiB, two passes, one
// lane). A stored hash made with other parameters is rehashed after a
// successful login.
var current = argonParams{memory: 19 * 1024, time: 2, threads: 1}

const (
	saltLength = 16
	keyLength  = 32
)

// dummyHash is checked when a login names an unknown habbo, so that it takes
// as long as a wrong password.
var dummyHash = sync.OnceValue(func() string { return HashPassword("") })

// HashPassword returns password hashed with argon2id as a PHC string,
// $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>.
func HashPassword(password string) string {
	return hashWith(password, current)
}

func hashWith(password string, p argonParams) string {
	salt := make([]byte, saltLength)
	rand.Read(salt)
	key := argon2.IDKey([]byte(password), salt, p.time, p.memory, p.threads, keyLength)
	return fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s", argon2.Version, p.memory, p.time, p.threads,
		base64.RawStdEncoding.EncodeToString(salt), base64.RawStdEncoding.EncodeToString(key))
}

// VerifyPassword reports whether password matches the PHC string encoded. The
// error reports a malformed hash, never a wrong password.
func VerifyPassword(encoded, password string) (bool, error) {
	p, salt, key, err := decodeHash(encoded)
	if err != nil {
		return false, err
	}
	other := argon2.IDKey([]byte(password), salt, p.time, p.memory, p.threads, uint32(len(key)))
	return subtle.ConstantTimeCompare(key, other) == 1, nil
}

func NeedsRehash(encoded string) bool {
	p, _, key, err := decodeHash(encoded)
	return err != nil || p != current || len(key) != keyLength
}

func decodeHash(encoded string) (argonParams, []byte, []byte, error) {
	var p argonParams
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 || parts[0] != "" || parts[1] != "argon2id" {
		return p, nil, nil, errors.New("auth: password hash is not an argon2id PHC string")
	}
	var version int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil || version != argon2.Version {
		return p, nil, nil, fmt.Errorf("auth: unsupported argon2 version %q", parts[2])
	}
	// argon2.IDKey panics on zero passes or lanes, so a damaged hash must fail
	// here instead.
	_, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &p.memory, &p.time, &p.threads)
	if err != nil || p.time == 0 || p.threads == 0 || p.memory < 8*uint32(p.threads) {
		return p, nil, nil, fmt.Errorf("auth: malformed argon2 parameters %q", parts[3])
	}
	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return p, nil, nil, fmt.Errorf("auth: malformed argon2 salt: %w", err)
	}
	key, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil || len(key) == 0 {
		return p, nil, nil, errors.New("auth: malformed argon2 key")
	}
	return p, salt, key, nil
}

// ValidatePassword checks the length of a new password against
// auth.passwordMinLength and auth.passwordMaxLength, counted in characters.
func (a *Auth) ValidatePassword(password string) error {
	low, high := a.settings.GetInt("auth.passwordMinLength"), a.settings.GetInt("auth.passwordMaxLength")
	if n := utf8.RuneCountInString(password); n < low || n > high {
		return fmt.Errorf("%w: must be %d to %d characters", ErrPasswordLength, low, high)
	}
	return nil
}
