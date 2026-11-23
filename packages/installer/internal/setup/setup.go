// Package setup is the installation itself: config.json, the database it
// names, and the first administrator.
package setup

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"sync"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/reborn"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The administrator's habbo starts as the one Holo's installer created.
const (
	adminFigure  = "hr-802-61.hd-190-1.ch-260-62.lg-280-110.sh-295-91.fa-1207-103"
	adminGender  = "M"
	adminCredits = 5000
)

var (
	ErrConfigured    = errors.New("setup: config.json is already written")
	ErrNotConfigured = errors.New("setup: config.json is not written yet")
	ErrInstalled     = errors.New("setup: the hotel already has an administrator")
	ErrNoGroup       = errors.New("setup: no access group holds housekeeping.accessGroups")
)

type Installation struct {
	Config *config.Config
	DB     *sql.DB
}

// State holds the installation once config.json exists. Run alone, the
// database only appears during the config step, so State opens it there.
type State struct {
	mu           sync.Mutex
	installation Installation
	// passed counts the steps passed in this run, in the order of Steps.
	passed int
	// done is closed once the administrator exists.
	done chan struct{}
}

// Open continues an installation. With db, config.json exists and the
// installation uses db, as reborn hands it. Without db, a config.json in the
// working directory names the database it opens; without one it must not call
// config.Load, which would write a config.json with the defaults.
func Open(ctx context.Context, db *sql.DB) (*State, error) {
	if db == nil {
		if _, err := os.Stat(config.Filename); errors.Is(err, fs.ErrNotExist) {
			return &State{done: make(chan struct{})}, nil
		} else if err != nil {
			return nil, fmt.Errorf("setup: %w", err)
		}
	}
	cfg, err := config.Load()
	if err != nil {
		return nil, err
	}
	var installation Installation
	if db != nil {
		installation = Installation{Config: cfg, DB: db}
	} else {
		installation, err = open(cfg)
	}
	if err != nil {
		return nil, err
	}
	s := &State{installation: installation, done: make(chan struct{})}
	done, err := Installed(ctx, installation.DB)
	if err != nil {
		if db == nil {
			installation.DB.Close()
		}
		return nil, err
	}
	if done {
		close(s.done)
	}
	return s, nil
}

// open creates the database cfg names, or opens it when it exists.
func open(cfg *config.Config) (Installation, error) {
	db, err := store.Open(cfg.Store.Path)
	if err != nil {
		return Installation{}, fmt.Errorf("setup: %w", err)
	}
	return Installation{Config: cfg, DB: db}, nil
}

// ConfigPath is the absolute path of the config.json the installer writes.
func ConfigPath() string {
	path, err := filepath.Abs(config.Filename)
	if err != nil {
		return config.Filename
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
	installation, err := open(cfg)
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

// SaveReborn saves the hotel's address into the reborn section of the existing
// config.json, and the installation holds it from then on.
func (s *State) SaveReborn(address reborn.Reborn) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.installation.Config == nil {
		return ErrNotConfigured
	}
	if err := config.SaveReborn(address); err != nil {
		return err
	}
	cfg := *s.installation.Config
	cfg.Reborn = address
	s.installation.Config = &cfg
	return nil
}

// Installed reports whether the database has an administrator, a user who can
// manage access groups.
func (s *State) Installed(ctx context.Context) (bool, error) {
	installation, ok := s.Current()
	if !ok {
		return false, nil
	}
	return Installed(ctx, installation.DB)
}

// Installed reports whether db has an administrator: someone holds
// housekeeping.accessGroups.
func Installed(ctx context.Context, db *sql.DB) (bool, error) {
	return installed(ctx, store.New(db))
}

// Done is closed once the administrator exists.
func (s *State) Done() <-chan struct{} {
	return s.done
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
// credentials and habbo with its profile, home and wallet. The administrator
// joins the group that the ranks update made to hold every attribute, which
// shows the habbo on the staff page.
func (s *State) CreateAdministrator(ctx context.Context, admin Administrator) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	db := s.installation.DB
	if db == nil {
		return ErrNotConfigured
	}
	now := time.Now().UTC()
	q := store.New(db)
	if err := admin.validate(ctx, q); err != nil {
		return err
	}
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
	close(s.done)
	return nil
}

func createAdministrator(ctx context.Context, q *store.Queries, admin Administrator, hash string, now time.Time) error {
	userID, avatarID, err := auth.CreateAccount(ctx, q, auth.Account{
		Email:        admin.Email,
		BornOn:       admin.BornOn,
		IP:           admin.IP,
		PasswordHash: hash,
		Credits:      adminCredits,
		Detail:       "installer",
		Habbo:        auth.Habbo{Name: admin.Name, Figure: adminFigure, Gender: adminGender},
	})
	if err != nil {
		return err
	}
	administrators, err := administratorsGroup(ctx, q)
	if err != nil {
		return err
	}
	return q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{
		AccessGroupID:   administrators,
		UserID:          userID,
		DisplayAvatarID: sql.NullInt64{Int64: avatarID, Valid: true},
		GrantedAt:       now,
	})
}

// administratorsGroup returns the highest group holding
// housekeeping.accessGroups: on a new hotel, the Administrator of the ranks
// update, which nobody could change before an administrator existed.
func administratorsGroup(ctx context.Context, q *store.Queries) (int64, error) {
	groups, err := q.ListAccessGroups(ctx)
	if err != nil {
		return 0, err
	}
	var found *store.ListAccessGroupsRow
	for i, group := range groups {
		attributes, err := q.ListAccessGroupAttributes(ctx, group.ID)
		if err != nil {
			return 0, err
		}
		if slices.Contains(attributes, string(auth.HousekeepingAccessGroups)) && (found == nil || group.Level > found.Level) {
			found = &groups[i]
		}
	}
	if found == nil {
		return 0, ErrNoGroup
	}
	return found.ID, nil
}

func (a Administrator) validate(ctx context.Context, q *store.Queries) error {
	if err := auth.ValidateHabboName(a.Name); err != nil {
		return err
	}
	if err := auth.ValidateEmail(a.Email); err != nil {
		return err
	}
	if err := auth.ValidateBornOn(a.BornOn); err != nil {
		return err
	}
	return auth.ValidatePassword(ctx, q, a.Password)
}
