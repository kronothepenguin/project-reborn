// Package account holds the CMS credential, validation, and sign-in policy.
package account

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// DefaultCost is the bcrypt work factor used in production.
const DefaultCost = 12

// Hasher hashes and compares passwords with bcrypt. The cost is injectable so
// tests can use a cheap factor without changing production security.
type Hasher struct {
	cost int
}

// NewHasher returns a Hasher with the given bcrypt cost; a non-positive cost
// selects DefaultCost.
func NewHasher(cost int) *Hasher {
	if cost <= 0 {
		cost = DefaultCost
	}
	return &Hasher{cost: cost}
}

// Hash returns the bcrypt hash of password.
func (h *Hasher) Hash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
	if err != nil {
		return "", fmt.Errorf("account: hash password: %w", err)
	}
	return string(hash), nil
}

// Compare reports whether password matches the stored hash.
func (h *Hasher) Compare(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
