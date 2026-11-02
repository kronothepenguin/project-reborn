package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

var (
	ErrHabboName = errors.New("auth: invalid habbo name")
	ErrEmail     = errors.New("auth: invalid email address")
	ErrBornOn    = errors.New("auth: invalid birth date")
	ErrLook      = errors.New("auth: invalid figure or gender")
)

// These say why a name is invalid; each of them matches ErrHabboName.
var (
	ErrHabboNameEmpty    = fmt.Errorf("%w: empty", ErrHabboName)
	ErrHabboNameTooLong  = fmt.Errorf("%w: too long", ErrHabboName)
	ErrHabboNameReserved = fmt.Errorf("%w: reserved", ErrHabboName)
)

const (
	maxHabboNameLength = 24
	minEmailLength     = 6
	maxEmailLength     = 254
	maxFigureLength    = 255
	firstBirthYear     = 1920
)

var (
	habboName   = regexp.MustCompile(`^[A-Za-z0-9\-=?!@:.,]+$`)
	emailFormat = regexp.MustCompile(`^[A-Za-z0-9_.\-]+@([A-Za-z0-9]+(-+[A-Za-z0-9]+)*\.)+[A-Za-z]{2,7}$`)
	// A part can leave its colour empty, as in ha-1001-.
	figureFormat = regexp.MustCompile(`^[a-z]{2}-\d+(-\d*)*(\.[a-z]{2}-\d+(-\d*)*)*$`)
)

// ValidateHabboName checks a new habbo's name. Names starting with MOD- are
// refused because they would pass for moderators.
func ValidateHabboName(name string) error {
	switch {
	case name == "":
		return ErrHabboNameEmpty
	case utf8.RuneCountInString(name) > maxHabboNameLength:
		return ErrHabboNameTooLong
	case !habboName.MatchString(name):
		return ErrHabboName
	case strings.HasPrefix(strings.ToUpper(name), "MOD-"):
		return ErrHabboNameReserved
	}
	return nil
}

// ValidateEmail checks an address with Holo's rule.
func ValidateEmail(email string) error {
	if len(email) < minEmailLength || len(email) > maxEmailLength || !emailFormat.MatchString(email) {
		return ErrEmail
	}
	return nil
}

func ValidateBornOn(bornOn time.Time) error {
	if bornOn.Year() < firstBirthYear || bornOn.After(clock()) {
		return ErrBornOn
	}
	return nil
}

// ValidateLook checks a figure in the dot format of the v2 avatar editor, such as
// hd-180-1.ch-215-82.lg-270-82, and a gender of M or F.
func ValidateLook(figure, gender string) error {
	if len(figure) > maxFigureLength || !figureFormat.MatchString(figure) || (gender != "M" && gender != "F") {
		return ErrLook
	}
	return nil
}

// Habbo describes a new habbo.
type Habbo struct {
	Name   string
	Figure string
	Gender string
}

// Account describes a new user with its first habbo. PasswordHash comes from
// HashPassword, which the caller runs before opening its transaction: argon2 is
// slow, and the store's pool has one connection. Detail goes on the ledger row of
// the first credits; an account starting without credits gets no row.
type Account struct {
	Email        string
	BornOn       time.Time
	Newsletter   bool
	IP           string
	PasswordHash string
	Credits      int64
	Detail       string
	Habbo        Habbo
}

// CreateAccount writes a user, its credentials, its wallet and its first habbo. It
// takes the queries of the caller's transaction, since the writes must succeed
// together and a caller can have more of its own. It does not validate the account.
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
	err = q.CreateWallet(ctx, store.CreateWalletParams{UserID: user.ID, Credits: account.Credits, UpdatedAt: now})
	if err != nil {
		return 0, 0, fmt.Errorf("auth: create account: %w", err)
	}
	if account.Credits == 0 {
		return user.ID, avatarID, nil
	}
	err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
		UserID:    user.ID,
		AvatarID:  sql.NullInt64{Int64: avatarID, Valid: true},
		Credits:   account.Credits,
		Reason:    "registration",
		Detail:    account.Detail,
		CreatedAt: now,
	})
	if err != nil {
		return 0, 0, fmt.Errorf("auth: create account: %w", err)
	}
	return user.ID, avatarID, nil
}

// CreateHabbo writes a habbo of userID with its profile and home. Like
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
	return avatar.ID, nil
}
