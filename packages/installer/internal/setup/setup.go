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
	"sync"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
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
)

type Installation struct {
	Config *config.Config
	DB     *sql.DB
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
	if _, err := os.Stat(config.Filename); errors.Is(err, fs.ErrNotExist) {
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
	if err := settings.Load(ctx, cfg, db); err != nil {
		db.Close()
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
// credentials and habbo with its profile, home and wallet, Holo's ranks as access
// groups, and the CMS's seed. The administrator joins Administrator, which holds
// every attribute and shows the habbo on the staff page.
func (s *State) CreateAdministrator(ctx context.Context, admin Administrator) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	db := s.installation.DB
	if db == nil {
		return ErrNotConfigured
	}
	now := time.Now().UTC()
	if err := admin.validate(); err != nil {
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
	administrators, err := createRanks(ctx, q, now)
	if err != nil {
		return err
	}
	if err := seed.HomeStore(ctx, q); err != nil {
		return err
	}
	return q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{
		AccessGroupID:   administrators,
		UserID:          userID,
		DisplayAvatarID: sql.NullInt64{Int64: avatarID, Valid: true},
		GrantedAt:       now,
	})
}

// rank is one of Holo's staff ranks, as an access group. Their names come from
// staff.php, and the Moderator's attributes from the pages housekeeping/index.php
// does not keep for rank 7, without housekeeping.usersPrivate.
type rank struct {
	name        string
	description string
	level       int64
	everything  bool
	attributes  []auth.Attribute
}

var ranks = []rank{
	{name: "Administrator", description: "Holds every attribute.", level: 7, everything: true},
	{
		name:        "Moderator",
		description: "Looks after the hotel and its players.",
		level:       6,
		attributes: []auth.Attribute{
			auth.HousekeepingAccess,
			auth.HousekeepingUsers,
			auth.HousekeepingCredits,
			auth.HousekeepingVouchers,
			auth.HousekeepingBans,
			auth.HousekeepingAlerts,
			auth.HousekeepingAlertsBroadcast,
			auth.HousekeepingHelp,
			auth.HousekeepingBanners,
			auth.HousekeepingHomeStore,
			auth.ForumEdit,
			auth.HomesStaffItems,
			auth.SiteMaintenanceBypass,
		},
	},
	{name: "Gold Hobba", description: "Listed on the staff page.", level: 5},
	{name: "Silver Hobba", description: "Listed on the staff page.", level: 4},
	{name: "HabboX", description: "Listed on the staff page.", level: 3},
}

// createRanks writes the example groups, which the administrator can change or
// delete, and returns the id of the one holding every attribute.
func createRanks(ctx context.Context, q *store.Queries, now time.Time) (administrators int64, err error) {
	for _, r := range ranks {
		group, err := q.CreateAccessGroup(ctx, store.CreateAccessGroupParams{
			Name:        r.name,
			Description: r.description,
			StaffListed: true,
			Level:       r.level,
			CreatedAt:   now,
			UpdatedAt:   now,
		})
		if err != nil {
			return 0, err
		}
		attributes := r.attributes
		if r.everything {
			administrators = group.ID
			for _, entry := range auth.Catalogue() {
				attributes = append(attributes, entry.Attribute)
			}
		}
		for _, attribute := range attributes {
			err := q.AddAccessGroupAttribute(ctx, store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: string(attribute)})
			if err != nil {
				return 0, err
			}
		}
	}
	return administrators, nil
}

func (a Administrator) validate() error {
	if err := auth.ValidateHabboName(a.Name); err != nil {
		return err
	}
	if err := auth.ValidateEmail(a.Email); err != nil {
		return err
	}
	if err := auth.ValidateBornOn(a.BornOn); err != nil {
		return err
	}
	return auth.ValidatePassword(a.Password)
}
