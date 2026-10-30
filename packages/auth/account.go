package auth

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

var (
	ErrHabboName = errors.New("auth: invalid habbo name")
	ErrEmail     = errors.New("auth: invalid email address")
	ErrBornOn    = errors.New("auth: invalid birth date")
)

var habboName = regexp.MustCompile(`^[A-Za-z0-9\-=?!@:.,]{1,24}$`)

// ValidateHabboName checks a new habbo's name. Names starting with MOD- are
// refused because they would pass for moderators.
func ValidateHabboName(name string) error {
	if !habboName.MatchString(name) || strings.HasPrefix(strings.ToUpper(name), "MOD-") {
		return ErrHabboName
	}
	return nil
}

// ValidateEmail accepts a bare address, without a display name.
func ValidateEmail(email string) error {
	if address, err := mail.ParseAddress(email); err != nil || address.Address != email {
		return ErrEmail
	}
	return nil
}

func ValidateBornOn(bornOn time.Time) error {
	if bornOn.Year() < 1900 || bornOn.After(clock()) {
		return ErrBornOn
	}
	return nil
}

// Habbo describes a new habbo. Detail goes on the ledger row of its first
// credits; a habbo starting without credits gets no row.
type Habbo struct {
	Name    string
	Figure  string
	Gender  string
	Credits int64
	Detail  string
}

// Account describes a new user with its first habbo. PasswordHash comes from
// HashPassword, which the caller runs before opening its transaction: argon2 is
// slow, and the store's pool has one connection.
type Account struct {
	Email        string
	BornOn       time.Time
	Newsletter   bool
	IP           string
	PasswordHash string
	Habbo        Habbo
}

// CreateAccount writes a user, its credentials and its first habbo. It takes the
// queries of the caller's transaction, since the writes must succeed together
// and a caller can have more of its own. It does not validate the account.
func CreateAccount(ctx context.Context, q *store.Queries, account Account) (userID, avatarID int64, err error) {
	now := clock().UTC()
	user, err := q.CreateUser(ctx, store.CreateUserParams{
		Email:      account.Email,
		BornOn:     account.BornOn,
		Newsletter: account.Newsletter,
		CreatedIP:  account.IP,
		CreatedAt:  now,
		UpdatedAt:  now,
	})
	if err != nil {
		return 0, 0, fmt.Errorf("auth: create account: %w", err)
	}
	err = q.UpsertCredential(ctx, store.UpsertCredentialParams{UserID: user.ID, PasswordHash: account.PasswordHash, UpdatedAt: now})
	if err != nil {
		return 0, 0, fmt.Errorf("auth: create account: %w", err)
	}
	avatarID, err = CreateHabbo(ctx, q, user.ID, account.Habbo)
	if err != nil {
		return 0, 0, err
	}
	return user.ID, avatarID, nil
}

// CreateHabbo writes a habbo of userID with its profile, home and wallet. Like
// CreateAccount, it takes the queries of the caller's transaction and does not
// validate the habbo.
func CreateHabbo(ctx context.Context, q *store.Queries, userID int64, habbo Habbo) (avatarID int64, err error) {
	now := clock().UTC()
	avatar, err := q.CreateAvatar(ctx, store.CreateAvatarParams{
		UserID:    userID,
		Name:      habbo.Name,
		Figure:    habbo.Figure,
		Gender:    habbo.Gender,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return 0, fmt.Errorf("auth: create habbo: %w", err)
	}
	profile, err := q.CreateProfile(ctx, store.CreateProfileParams{AvatarID: avatar.ID, CreatedAt: now, UpdatedAt: now})
	if err != nil {
		return 0, fmt.Errorf("auth: create habbo: %w", err)
	}
	if _, err := q.CreateProfileHome(ctx, store.CreateProfileHomeParams{ProfileID: profile.ID, UpdatedAt: now}); err != nil {
		return 0, fmt.Errorf("auth: create habbo: %w", err)
	}
	if err := q.CreateWallet(ctx, store.CreateWalletParams{AvatarID: avatar.ID, Credits: habbo.Credits, UpdatedAt: now}); err != nil {
		return 0, fmt.Errorf("auth: create habbo: %w", err)
	}
	if habbo.Credits == 0 {
		return avatar.ID, nil
	}
	err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
		AvatarID:  avatar.ID,
		Credits:   habbo.Credits,
		Reason:    "registration",
		Detail:    habbo.Detail,
		CreatedAt: now,
	})
	if err != nil {
		return 0, fmt.Errorf("auth: create habbo: %w", err)
	}
	return avatar.ID, nil
}
