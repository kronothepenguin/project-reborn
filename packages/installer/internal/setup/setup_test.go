package setup

import (
	"encoding/json/v2"
	"errors"
	"io/fs"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/cms"
	"github.com/kronothepenguin/project-reborn/packages/config/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/config/proxy"
	storeconfig "github.com/kronothepenguin/project-reborn/packages/config/store"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

func testConfig(path string, port int) *config.Config {
	return &config.Config{
		Store:        storeconfig.Store{Path: path},
		CMS:          cms.CMS{Host: cms.DefaultHost(), Port: port},
		Housekeeping: housekeeping.Housekeeping{Host: housekeeping.DefaultHost(), Port: housekeeping.DefaultPort()},
		Proxy:        proxy.Proxy{Enabled: proxy.DefaultEnabled(), Trusted: proxy.DefaultTrusted()},
	}
}

func testAdministrator() Administrator {
	return Administrator{
		Name:     "Admin-1",
		Email:    "admin@example.com",
		BornOn:   time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		Password: "secret123",
		IP:       "127.0.0.1",
	}
}

func openState(t *testing.T) *State {
	t.Helper()
	t.Chdir(t.TempDir())
	s, err := Open(t.Context())
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() {
		if installation, ok := s.Current(); ok {
			installation.DB.Close()
		}
	})
	return s
}

func configure(t *testing.T) *State {
	t.Helper()
	s := openState(t)
	if err := s.Configure(t.Context(), testConfig("habbo.db", 17400)); err != nil {
		t.Fatalf("Configure: %v", err)
	}
	return s
}

func assertAbsent(t *testing.T, paths ...string) {
	t.Helper()
	for _, path := range paths {
		if _, err := os.Stat(path); !errors.Is(err, fs.ErrNotExist) {
			t.Errorf("%s exists (stat: %v)", path, err)
		}
	}
}

func TestOpenWithoutConfigWritesNothing(t *testing.T) {
	s := openState(t)
	if _, ok := s.Current(); ok {
		t.Error("Current() reports a configuration without config.json")
	}
	assertAbsent(t, config.Filename)
}

func TestConfigureWritesConfigAndCreatesTheDatabase(t *testing.T) {
	s := configure(t)

	installation, ok := s.Current()
	if !ok || installation.Config.CMS.Port != 17400 || settings.GetInt("cms.port") != 17400 {
		t.Fatalf("Current() = %+v, %t, want the written configuration", installation, ok)
	}
	data, err := os.ReadFile(config.Filename)
	if err != nil {
		t.Fatalf("read %s: %v", config.Filename, err)
	}
	var written config.Config
	if err := json.Unmarshal(data, &written); err != nil {
		t.Fatalf("decode %s: %v", config.Filename, err)
	}
	if !reflect.DeepEqual(written, *testConfig("habbo.db", 17400)) {
		t.Errorf("%s = %+v", config.Filename, written)
	}
	if _, err := os.Stat("habbo.db"); err != nil {
		t.Errorf("database file: %v", err)
	}
	if err := s.Configure(t.Context(), testConfig("other.db", 17401)); !errors.Is(err, ErrConfigured) {
		t.Errorf("a second Configure = %v, want ErrConfigured", err)
	}
}

func TestConfigureRefusesAnInvalidConfig(t *testing.T) {
	s := openState(t)
	err := s.Configure(t.Context(), testConfig("habbo.db", 0))
	if err == nil || !strings.Contains(err.Error(), "cms.port") {
		t.Fatalf("Configure() = %v, want a cms.port error", err)
	}
	assertAbsent(t, config.Filename, "habbo.db")
}

func TestConfigureLeavesNoConfigWhenTheDatabaseCannotOpen(t *testing.T) {
	s := openState(t)
	if err := s.Configure(t.Context(), testConfig(filepath.Join("missing", "habbo.db"), 17400)); err == nil {
		t.Fatal("Configure() created a database in a missing directory")
	}
	assertAbsent(t, config.Filename)
	if _, ok := s.Current(); ok {
		t.Error("Current() reports a configuration after a failed Configure")
	}
}

func TestAnInstalledHotelHasHolosRanks(t *testing.T) {
	s := configure(t)
	if err := s.CreateAdministrator(t.Context(), testAdministrator()); err != nil {
		t.Fatalf("CreateAdministrator: %v", err)
	}
	installation, _ := s.Current()
	q := store.New(installation.DB)
	groups, err := q.ListAccessGroups(t.Context())
	if err != nil {
		t.Fatalf("ListAccessGroups: %v", err)
	}

	want := map[string]struct {
		level, attributes, members int64
	}{
		"Administrator": {7, int64(len(auth.Catalogue())), 1},
		"Moderator":     {6, 13, 0},
		"Gold Hobba":    {5, 0, 0},
		"Silver Hobba":  {4, 0, 0},
		"HabboX":        {3, 0, 0},
	}
	if len(groups) != len(want) {
		t.Fatalf("%d groups, want %d", len(groups), len(want))
	}
	for _, group := range groups {
		rank, ok := want[group.Name]
		if !ok {
			t.Errorf("unexpected group %q", group.Name)
			continue
		}
		attributes, err := q.ListAccessGroupAttributes(t.Context(), group.ID)
		if err != nil {
			t.Fatalf("ListAccessGroupAttributes: %v", err)
		}
		if group.Level != rank.level || int64(len(attributes)) != rank.attributes || group.MemberCount != rank.members || !group.StaffListed {
			t.Errorf("%s = level %d, %d attributes, %d members, listed %t; want %+v", group.Name, group.Level, len(attributes), group.MemberCount, group.StaffListed, rank)
		}
		if group.Name != "Moderator" {
			continue
		}
		for _, kept := range []auth.Attribute{
			auth.HousekeepingSettings, auth.HousekeepingAccessGroups, auth.HousekeepingNews, auth.HousekeepingUsersEdit,
			auth.HousekeepingLogs, auth.HousekeepingUsersPrivate,
		} {
			if slices.Contains(attributes, string(kept)) {
				t.Errorf("the Moderator holds %s", kept)
			}
		}
	}
}

func TestCreateAdministrator(t *testing.T) {
	s := configure(t)
	admin := testAdministrator()
	if err := s.CreateAdministrator(t.Context(), admin); err != nil {
		t.Fatalf("CreateAdministrator: %v", err)
	}
	if installed, err := s.Installed(t.Context()); err != nil || !installed {
		t.Fatalf("Installed() = %t, %v, want true", installed, err)
	}

	installation, _ := s.Current()
	r := httptest.NewRequest(http.MethodPost, "/", nil)
	session, err := auth.Login(httptest.NewRecorder(), r, installation.DB, "admin-1", admin.Password, false)
	if err != nil {
		t.Fatalf("the administrator cannot sign in: %v", err)
	}
	attributes, err := auth.Attributes(t.Context(), installation.DB, session.UserID)
	if err != nil {
		t.Fatalf("Attributes: %v", err)
	}
	for _, entry := range auth.Catalogue() {
		if !slices.Contains(attributes, entry.Attribute) {
			t.Errorf("the administrator lacks %s", entry.Attribute)
		}
	}

	q := store.New(installation.DB)
	user, err := q.GetUser(t.Context(), session.UserID)
	if err != nil || user.Email != admin.Email || !user.BornOn.Equal(admin.BornOn) || user.CreatedIP != admin.IP {
		t.Errorf("user = %+v, %v", user, err)
	}
	avatar, err := q.GetAvatar(t.Context(), session.AvatarID)
	if err != nil || avatar.Name != admin.Name || avatar.Figure != adminFigure || avatar.Gender != adminGender {
		t.Errorf("habbo = %+v, %v", avatar, err)
	}

	var credits, ledger, homes int
	var reason, detail string
	db := installation.DB
	if err := db.QueryRowContext(t.Context(), `SELECT credits FROM wallets WHERE user_id = ?`, avatar.UserID).Scan(&credits); err != nil || credits != adminCredits {
		t.Errorf("wallet credits = %d, %v, want %d", credits, err, adminCredits)
	}
	err = db.QueryRowContext(t.Context(), `SELECT credits, reason, detail FROM wallet_transactions WHERE avatar_id = ?`, avatar.ID).Scan(&ledger, &reason, &detail)
	if err != nil || ledger != adminCredits || reason != "registration" || detail != "installer" {
		t.Errorf("ledger row = %d %q %q, %v", ledger, reason, detail, err)
	}
	err = db.QueryRowContext(t.Context(),
		`SELECT COUNT(*) FROM homes JOIN profiles ON homes.profile_id = profiles.id WHERE profiles.avatar_id = ?`, avatar.ID).Scan(&homes)
	if err != nil || homes != 1 {
		t.Errorf("profile homes = %d, %v, want 1", homes, err)
	}

	var name string
	var staffListed bool
	var display int64
	err = db.QueryRowContext(t.Context(),
		`SELECT access_groups.name, access_groups.staff_listed, access_group_members.display_avatar_id
		 FROM access_groups JOIN access_group_members ON access_group_members.access_group_id = access_groups.id
		 WHERE access_group_members.user_id = ?`, user.ID).Scan(&name, &staffListed, &display)
	if err != nil || name != "Administrator" || !staffListed || display != avatar.ID {
		t.Errorf("membership = %q, staff listed %t, display habbo %d, %v", name, staffListed, display, err)
	}

	if err := s.CreateAdministrator(t.Context(), admin); !errors.Is(err, ErrInstalled) {
		t.Errorf("a second CreateAdministrator = %v, want ErrInstalled", err)
	}
}

// The updates write the store when the installer creates the database.
func TestAnInstalledHotelHasTheHomeStore(t *testing.T) {
	s := configure(t)
	if err := s.CreateAdministrator(t.Context(), testAdministrator()); err != nil {
		t.Fatalf("CreateAdministrator: %v", err)
	}
	installation, _ := s.Current()
	var categories, items int
	if err := installation.DB.QueryRowContext(t.Context(),
		`SELECT (SELECT COUNT(*) FROM home_store_categories), (SELECT COUNT(*) FROM home_store_items)`).Scan(&categories, &items); err != nil {
		t.Fatal(err)
	}
	if categories != 20 || items != 298 {
		t.Errorf("the store holds %d categories and %d items, want 20 and 298", categories, items)
	}
}

func TestCreateAdministratorJoinsTheHighestGroupThatManagesAccess(t *testing.T) {
	s := configure(t)
	installation, _ := s.Current()
	for _, statement := range []string{
		`INSERT INTO access_groups (id, name, level, created_at, updated_at) VALUES (40, 'Deputies', 2, '2026-11-03 21:00:00+00:00', '2026-11-03 21:00:00+00:00')`,
		`INSERT INTO access_group_attributes (access_group_id, attribute) VALUES (40, 'housekeeping.accessGroups')`,
	} {
		if _, err := installation.DB.ExecContext(t.Context(), statement); err != nil {
			t.Fatal(err)
		}
	}
	if err := s.CreateAdministrator(t.Context(), testAdministrator()); err != nil {
		t.Fatalf("CreateAdministrator: %v", err)
	}
	var name string
	if err := installation.DB.QueryRowContext(t.Context(),
		`SELECT access_groups.name FROM access_group_members JOIN access_groups ON access_groups.id = access_group_members.access_group_id`).Scan(&name); err != nil || name != "Administrator" {
		t.Errorf("the administrator joined %q, %v, want Administrator", name, err)
	}
}

func TestCreateAdministratorNeedsAGroupForIt(t *testing.T) {
	s := configure(t)
	installation, _ := s.Current()
	if _, err := installation.DB.ExecContext(t.Context(), `DELETE FROM access_groups`); err != nil {
		t.Fatal(err)
	}
	if err := s.CreateAdministrator(t.Context(), testAdministrator()); !errors.Is(err, ErrNoGroup) {
		t.Fatalf("CreateAdministrator = %v, want ErrNoGroup", err)
	}
	var users int
	if err := installation.DB.QueryRowContext(t.Context(), `SELECT COUNT(*) FROM users`).Scan(&users); err != nil || users != 0 {
		t.Errorf("%d users after the refusal, %v, want none", users, err)
	}
}

// Another program may have created the database and taken registrations before
// the installer first runs. A registered habbo is no administrator.
func TestCreateAdministratorOnADatabaseWithUsers(t *testing.T) {
	s := configure(t)
	installation, _ := s.Current()
	now := time.Now().UTC()
	user, err := store.New(installation.DB).CreateUser(t.Context(), store.CreateUserParams{
		Email:     "first@example.com",
		BornOn:    time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		CreatedIP: "127.0.0.1",
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}

	if done, err := s.Installed(t.Context()); err != nil || done {
		t.Fatalf("Installed() = %t, %v, want false", done, err)
	}
	if err := s.CreateAdministrator(t.Context(), testAdministrator()); err != nil {
		t.Fatalf("CreateAdministrator: %v", err)
	}
	if _, err := store.New(installation.DB).GetUser(t.Context(), user.ID); err != nil {
		t.Errorf("the registered user is gone: %v", err)
	}
	if err := s.CreateAdministrator(t.Context(), testAdministrator()); !errors.Is(err, ErrInstalled) {
		t.Errorf("a second CreateAdministrator = %v, want ErrInstalled", err)
	}
}

func TestCreateAdministratorValidates(t *testing.T) {
	s := configure(t)
	for name, c := range map[string]struct {
		change func(*Administrator)
		want   error
	}{
		"empty name":          {func(a *Administrator) { a.Name = "" }, auth.ErrHabboName},
		"name with a space":   {func(a *Administrator) { a.Name = "Admin One" }, auth.ErrHabboName},
		"long name":           {func(a *Administrator) { a.Name = strings.Repeat("a", 25) }, auth.ErrHabboName},
		"malformed email":     {func(a *Administrator) { a.Email = "admin" }, auth.ErrEmail},
		"email with a name":   {func(a *Administrator) { a.Email = "Admin <admin@example.com>" }, auth.ErrEmail},
		"future birth date":   {func(a *Administrator) { a.BornOn = time.Now().AddDate(1, 0, 0) }, auth.ErrBornOn},
		"birth date pre-1920": {func(a *Administrator) { a.BornOn = time.Date(1919, time.December, 31, 0, 0, 0, 0, time.UTC) }, auth.ErrBornOn},
		"short password":      {func(a *Administrator) { a.Password = "short" }, auth.ErrPasswordLength},
	} {
		admin := testAdministrator()
		c.change(&admin)
		if err := s.CreateAdministrator(t.Context(), admin); !errors.Is(err, c.want) {
			t.Errorf("%s: CreateAdministrator() = %v, want %v", name, err, c.want)
		}
	}
	if installed, err := s.Installed(t.Context()); err != nil || installed {
		t.Errorf("Installed() = %t, %v after rejected administrators, want false", installed, err)
	}
}

func TestCreateAdministratorNeedsConfig(t *testing.T) {
	s := openState(t)
	if err := s.CreateAdministrator(t.Context(), testAdministrator()); !errors.Is(err, ErrNotConfigured) {
		t.Errorf("CreateAdministrator() = %v, want ErrNotConfigured", err)
	}
}

// Only this test opens an existing config.json: config.Load reads the file
// once per process, so a second such test would get this one's configuration.
func TestOpenContinuesAnInstallation(t *testing.T) {
	s := configure(t)
	installation, _ := s.Current()
	installation.DB.Close()

	reopened, err := Open(t.Context())
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	got, ok := reopened.Current()
	if !ok || got.Config.CMS.Port != 17400 || got.Config.Store.Path != "habbo.db" {
		t.Fatalf("Open() continued with %+v, %t, want the written configuration", got.Config, ok)
	}
	got.DB.Close()
}
