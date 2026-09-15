package account

import (
	"context"
	"errors"
	"fmt"
	"net"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Credential errors classify why a sign-in failed. Callers render the generic
// message for ErrInvalidCredentials and the throttle message for ErrLocked.
var (
	ErrInvalidCredentials = errors.New("account: invalid credentials")
	ErrLocked             = errors.New("account: too many attempts")
)

// LoginPolicy is the failed sign-in throttle configuration.
type LoginPolicy struct {
	MaxFailures int
	Window      time.Duration
	Lock        time.Duration
}

// DefaultLoginPolicy returns the policy documented by FR-013: five failures
// within fifteen minutes lock the key for fifteen minutes.
func DefaultLoginPolicy() LoginPolicy {
	return LoginPolicy{MaxFailures: 5, Window: 15 * time.Minute, Lock: 15 * time.Minute}
}

// Service owns the account credential and sign-in policy over the shared
// store.
type Service struct {
	store  *store.Store
	hasher *Hasher
	policy LoginPolicy
	now    func() time.Time
}

// NewService returns a Service over the shared store. Zero policy values fall
// back to DefaultLoginPolicy.
func NewService(db *store.Store, hasher *Hasher, policy LoginPolicy) *Service {
	return &Service{
		store:  db,
		hasher: hasher,
		policy: normalizePolicy(policy),
		now:    time.Now,
	}
}

// Canonical normalizes a lookup value: trimmed and lower-cased.
func Canonical(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

// clientAddress returns the host part of a host:port address so throttle keys
// count a client's connections together rather than per ephemeral port.
func clientAddress(address string) string {
	if host, _, err := net.SplitHostPort(address); err == nil {
		return host
	}
	return address
}

// Authenticate verifies credentials and applies the failed-sign-in throttle.
// It returns ErrInvalidCredentials for unknown usernames and wrong passwords
// (never revealing which) and ErrLocked while a throttle key is blocked.
func (s *Service) Authenticate(ctx context.Context, username, password, address string) (*store.User, error) {
	accountKey := "u:" + Canonical(username)
	addressKey := "ip:" + clientAddress(address)

	locked, err := s.locked(ctx, accountKey, addressKey)
	if err != nil {
		return nil, err
	}
	if locked {
		return nil, ErrLocked
	}

	user, err := s.store.GetUserByUsername(ctx, Canonical(username))
	if err != nil {
		if store.IsNotFound(err) {
			if err := s.recordFailure(ctx, accountKey, addressKey); err != nil {
				return nil, err
			}
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("account: get user: %w", err)
	}

	if !s.hasher.Compare(user.PasswordHash, password) {
		if err := s.recordFailure(ctx, accountKey, addressKey); err != nil {
			return nil, err
		}
		return nil, ErrInvalidCredentials
	}

	if err := s.store.ClearLoginAttempt(ctx, accountKey); err != nil {
		return nil, fmt.Errorf("account: clear login attempt: %w", err)
	}
	err = s.store.MarkUserSignedIn(ctx, store.MarkUserSignedInParams{
		LastSignedInAt: s.now().Unix(),
		ID:             user.ID,
	})
	if err != nil {
		return nil, fmt.Errorf("account: mark signed in: %w", err)
	}
	return &user, nil
}

// UserByID returns the account with the given id.
func (s *Service) UserByID(ctx context.Context, id int64) (*store.User, error) {
	user, err := s.store.GetUserByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("account: get user %d: %w", id, err)
	}
	return &user, nil
}

// locked reports whether any throttle key is currently locked.
func (s *Service) locked(ctx context.Context, keys ...string) (bool, error) {
	now := s.now().Unix()
	for _, key := range keys {
		attempt, err := s.store.GetLoginAttempt(ctx, key)
		if err != nil {
			if store.IsNotFound(err) {
				continue
			}
			return false, fmt.Errorf("account: get login attempt: %w", err)
		}
		if attempt.LockedUntil > now {
			return true, nil
		}
	}
	return false, nil
}

// recordFailure increments every throttle key and locks a key once it reaches
// the configured failure maximum.
func (s *Service) recordFailure(ctx context.Context, keys ...string) error {
	now := s.now()
	for _, key := range keys {
		err := s.store.UpsertLoginFailure(ctx, store.UpsertLoginFailureParams{
			AttemptKey:  key,
			WindowStart: now.Add(-s.policy.Window).Unix(),
			Now:         now.Unix(),
		})
		if err != nil {
			return fmt.Errorf("account: record failure: %w", err)
		}
		attempt, err := s.store.GetLoginAttempt(ctx, key)
		if err != nil {
			return fmt.Errorf("account: read failure count: %w", err)
		}
		if attempt.Failures >= int64(s.policy.MaxFailures) {
			err := s.store.LockLoginAttempt(ctx, store.LockLoginAttemptParams{
				LockedUntil: now.Add(s.policy.Lock).Unix(),
				Key:         key,
			})
			if err != nil {
				return fmt.Errorf("account: lock attempt: %w", err)
			}
		}
	}
	return nil
}

// normalizePolicy replaces zero values with the defaults.
func normalizePolicy(policy LoginPolicy) LoginPolicy {
	defaults := DefaultLoginPolicy()
	if policy.MaxFailures <= 0 {
		policy.MaxFailures = defaults.MaxFailures
	}
	if policy.Window <= 0 {
		policy.Window = defaults.Window
	}
	if policy.Lock <= 0 {
		policy.Lock = defaults.Lock
	}
	return policy
}
