package auth

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"sync"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
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

// CheckPassword reports whether password is the user's.
func CheckPassword(ctx context.Context, db *sql.DB, userID int64, password string) (bool, error) {
	credential, err := store.New(db).GetCredential(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("auth: check password: %w", err)
	}
	return VerifyPassword(credential.PasswordHash, password)
}

// ChangePassword sets password for the user and ends every session and open
// reset of theirs, the visitor's own session included, as a password change did
// in Holo.
func ChangePassword(ctx context.Context, db *sql.DB, userID int64, password string) error {
	if err := ValidatePassword(password); err != nil {
		return err
	}
	hash := HashPassword(password)

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("auth: change password: %w", err)
	}
	defer tx.Rollback()
	q := store.New(tx)
	if err := q.UpsertCredential(ctx, store.UpsertCredentialParams{UserID: userID, PasswordHash: hash, UpdatedAt: clock().UTC()}); err != nil {
		return fmt.Errorf("auth: change password: %w", err)
	}
	if err := q.DeleteUserPasswordResets(ctx, userID); err != nil {
		return fmt.Errorf("auth: change password: %w", err)
	}
	if err := q.DeleteUserSessions(ctx, userID); err != nil {
		return fmt.Errorf("auth: change password: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("auth: change password: %w", err)
	}
	return nil
}

// ValidatePassword checks the length of a new password against
// auth.passwordMinLength and auth.passwordMaxLength, counted in characters.
func ValidatePassword(password string) error {
	n := utf8.RuneCountInString(password)
	switch {
	case n < settings.GetInt("auth.passwordMinLength"):
		return ErrPasswordTooShort
	case n > settings.GetInt("auth.passwordMaxLength"):
		return ErrPasswordTooLong
	}
	return nil
}
