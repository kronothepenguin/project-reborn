// Package setup is the installation itself: config.json, the database it
// names, and the first administrator.
package setup

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io/fs"
	"net/mail"
	"os"
	"path/filepath"
	"regexp"
	"sync"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual"
)

// configFile is the file packages/config reads from the working directory.
const configFile = "config.json"

// The administrator's habbo starts as the one Holo's installer created.
const (
	adminFigure  = "hr-802-61.hd-190-1.ch-260-62.lg-280-110.sh-295-91.fa-1207-103"
	adminGender  = "M"
	adminCredits = 5000
)

var habboName = regexp.MustCompile(`^[A-Za-z0-9\-=?!@:.,]{1,24}$`)

var (
	ErrConfigured    = errors.New("setup: config.json is already written")
	ErrNotConfigured = errors.New("setup: config.json is not written yet")
	ErrInstalled     = errors.New("setup: the hotel already has an administrator")
	ErrHabboName     = errors.New("setup: invalid habbo name")
	ErrEmail         = errors.New("setup: invalid email address")
	ErrBornOn        = errors.New("setup: invalid birth date")
)

type Installation struct {
	Config   *config.Config
	DB       *sql.DB
	Settings *virtual.Settings
}

// State holds the installation once config.json exists. The database only
// appears during the config step, so State opens it instead of receiving it.
type State struct {
	mu           sync.Mutex
	installation Installation
}

// Open continues an installation: with a config.json in the working directory
// it opens the database the file names. Without one it must not call
// config.Load, which would write a config.json with the defaults.
func Open(ctx context.Context) (*State, error) {
	if _, err := os.Stat(configFile); errors.Is(err, fs.ErrNotExist) {
		return &State{}, nil
	} else if err != nil {
		return nil, fmt.Errorf("setup: %w", err)
	}
	cfg, err := config.Load()
	if err != nil {
		return nil, err
	}
	installation, err := open(ctx, cfg)
	if err != nil {
		return nil, err
	}
	return &State{installation: installation}, nil
}

func open(ctx context.Context, cfg *config.Config) (Installation, error) {
	db, err := store.Open(cfg.Store.Path)
	if err != nil {
		return Installation{}, fmt.Errorf("setup: %w", err)
	}
	settings, err := virtual.LoadSettings(ctx, cfg, db)
	if err != nil {
		db.Close()
		return Installation{}, fmt.Errorf("setup: %w", err)
	}
	return Installation{Config: cfg, DB: db, Settings: settings}, nil
}

// ConfigPath is the absolute path of the config.json the installer writes.
func ConfigPath() string {
	path, err := filepath.Abs(configFile)
	if err != nil {
		return configFile
	}
	return path
}

// Current returns the installation and whether config.json is written.
func (s *State) Current() (Installation, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.installation, s.installation.DB != nil
}

// Configure creates the database cfg names and writes cfg as config.json. The
// database is opened first, so a path that cannot be opened leaves no
// config.json behind.
func (s *State) Configure(ctx context.Context, cfg *config.Config) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.installation.DB != nil {
		return ErrConfigured
	}
	if err := cfg.Validate(); err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	installation, err := open(ctx, cfg)
	if err != nil {
		return err
	}
	if err := config.Create(cfg); err != nil {
		installation.DB.Close()
		return err
	}
	s.installation = installation
	return nil
}

// Installed reports whether the database has an administrator, a user who can
// manage access groups.
func (s *State) Installed(ctx context.Context) (bool, error) {
	installation, ok := s.Current()
	if !ok {
		return false, nil
	}
	return installed(ctx, store.New(installation.DB))
}

func installed(ctx context.Context, q *store.Queries) (bool, error) {
	holders, err := q.ListAttributeHolders(ctx, string(auth.HousekeepingAccessGroups))
	if err != nil {
		return false, fmt.Errorf("setup: %w", err)
	}
	return len(holders) > 0, nil
}

type Administrator struct {
	Name     string
	Email    string
	BornOn   time.Time
	Password string
	IP       string
}

// CreateAdministrator creates, in one transaction, the administrator's user,
// credentials and habbo with its profile, home and wallet, and the
// Administrators group, which holds every attribute and shows the habbo on the
// staff page.
func (s *State) CreateAdministrator(ctx context.Context, admin Administrator) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	db, settings := s.installation.DB, s.installation.Settings
	if db == nil {
		return ErrNotConfigured
	}
	now := time.Now().UTC()
	if err := admin.validate(now, auth.New(db, settings)); err != nil {
		return err
	}
	q := store.New(db)
	done, err := installed(ctx, q)
	if err != nil {
		return err
	}
	if done {
		return ErrInstalled
	}
	hash := auth.HashPassword(admin.Password)

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	defer tx.Rollback()
	if err := createAdministrator(ctx, q.WithTx(tx), admin, hash, now); err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	return nil
}

func createAdministrator(ctx context.Context, q *store.Queries, admin Administrator, hash string, now time.Time) error {
	user, err := q.CreateUser(ctx, store.CreateUserParams{
		Email:     admin.Email,
		BornOn:    admin.BornOn,
		CreatedIP: admin.IP,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return err
	}
	if err := q.UpsertCredential(ctx, store.UpsertCredentialParams{UserID: user.ID, PasswordHash: hash, UpdatedAt: now}); err != nil {
		return err
	}
	avatar, err := q.CreateAvatar(ctx, store.CreateAvatarParams{
		UserID:    user.ID,
		Name:      admin.Name,
		Figure:    adminFigure,
		Gender:    adminGender,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return err
	}
	profile, err := q.CreateProfile(ctx, store.CreateProfileParams{AvatarID: avatar.ID, CreatedAt: now, UpdatedAt: now})
	if err != nil {
		return err
	}
	if _, err := q.CreateProfileHome(ctx, store.CreateProfileHomeParams{ProfileID: profile.ID, UpdatedAt: now}); err != nil {
		return err
	}
	if err := q.CreateWallet(ctx, store.CreateWalletParams{AvatarID: avatar.ID, Credits: adminCredits, UpdatedAt: now}); err != nil {
		return err
	}
	err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
		AvatarID:  avatar.ID,
		Credits:   adminCredits,
		Reason:    "registration",
		Detail:    "installer",
		CreatedAt: now,
	})
	if err != nil {
		return err
	}
	group, err := q.CreateAccessGroup(ctx, store.CreateAccessGroupParams{
		Name:        "Administrators",
		Description: "Holds every attribute. Created by the installer.",
		StaffListed: true,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		return err
	}
	for _, entry := range auth.Catalogue() {
		err := q.AddAccessGroupAttribute(ctx, store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: string(entry.Attribute)})
		if err != nil {
			return err
		}
	}
	return q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{
		AccessGroupID:   group.ID,
		UserID:          user.ID,
		DisplayAvatarID: sql.NullInt64{Int64: avatar.ID, Valid: true},
		GrantedAt:       now,
	})
}

func (a Administrator) validate(now time.Time, policy *auth.Auth) error {
	if !habboName.MatchString(a.Name) {
		return ErrHabboName
	}
	if address, err := mail.ParseAddress(a.Email); err != nil || address.Address != a.Email {
		return ErrEmail
	}
	if a.BornOn.Year() < 1900 || a.BornOn.After(now) {
		return ErrBornOn
	}
	return policy.ValidatePassword(a.Password)
}
