package setup

import (
	"encoding/json/v2"
	"errors"
	"io/fs"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/cms"
	storeconfig "github.com/kronothepenguin/project-reborn/packages/config/store"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func testConfig(path string, port int) *config.Config {
	return &config.Config{Store: storeconfig.Store{Path: path}, CMS: cms.CMS{Port: port}}
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
	assertAbsent(t, configFile)
}

func TestConfigureWritesConfigAndCreatesTheDatabase(t *testing.T) {
	s := configure(t)

	installation, ok := s.Current()
	if !ok || installation.Config.CMS.Port != 17400 || installation.Settings == nil {
		t.Fatalf("Current() = %+v, %t, want the written configuration", installation, ok)
	}
	data, err := os.ReadFile(configFile)
	if err != nil {
		t.Fatalf("read %s: %v", configFile, err)
	}
	var written config.Config
	if err := json.Unmarshal(data, &written); err != nil {
		t.Fatalf("decode %s: %v", configFile, err)
	}
	if written != *testConfig("habbo.db", 17400) {
		t.Errorf("%s = %+v", configFile, written)
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
	assertAbsent(t, configFile, "habbo.db")
}

func TestConfigureLeavesNoConfigWhenTheDatabaseCannotOpen(t *testing.T) {
	s := openState(t)
	if err := s.Configure(t.Context(), testConfig(filepath.Join("missing", "habbo.db"), 17400)); err == nil {
		t.Fatal("Configure() created a database in a missing directory")
	}
	assertAbsent(t, configFile)
	if _, ok := s.Current(); ok {
		t.Error("Current() reports a configuration after a failed Configure")
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
	a := auth.New(installation.DB, installation.Settings)
	r := httptest.NewRequest(http.MethodPost, "/", nil)
	session, err := a.Login(httptest.NewRecorder(), r, "admin-1", admin.Password, false)
	if err != nil {
		t.Fatalf("the administrator cannot sign in: %v", err)
	}
	attributes, err := a.Attributes(t.Context(), session.UserID)
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
	if err := db.QueryRowContext(t.Context(), `SELECT credits FROM wallets WHERE avatar_id = ?`, avatar.ID).Scan(&credits); err != nil || credits != adminCredits {
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
	if err != nil || name != "Administrators" || !staffListed || display != avatar.ID {
		t.Errorf("membership = %q, staff listed %t, display habbo %d, %v", name, staffListed, display, err)
	}

	if err := s.CreateAdministrator(t.Context(), admin); !errors.Is(err, ErrInstalled) {
		t.Errorf("a second CreateAdministrator = %v, want ErrInstalled", err)
	}
}

func TestCreateAdministratorValidates(t *testing.T) {
	s := configure(t)
	for name, c := range map[string]struct {
		change func(*Administrator)
		want   error
	}{
		"empty name":          {func(a *Administrator) { a.Name = "" }, ErrHabboName},
		"name with a space":   {func(a *Administrator) { a.Name = "Admin One" }, ErrHabboName},
		"long name":           {func(a *Administrator) { a.Name = strings.Repeat("a", 25) }, ErrHabboName},
		"malformed email":     {func(a *Administrator) { a.Email = "admin" }, ErrEmail},
		"email with a name":   {func(a *Administrator) { a.Email = "Admin <admin@example.com>" }, ErrEmail},
		"future birth date":   {func(a *Administrator) { a.BornOn = time.Now().AddDate(1, 0, 0) }, ErrBornOn},
		"birth date pre-1900": {func(a *Administrator) { a.BornOn = time.Date(1899, time.December, 31, 0, 0, 0, 0, time.UTC) }, ErrBornOn},
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

func TestHabboNames(t *testing.T) {
	for name, valid := range map[string]bool{
		"Admin":                 true,
		"a":                     true,
		"Admin-1":               true,
		"-=?!@:.,":              true,
		strings.Repeat("a", 24): true,
		strings.Repeat("a", 25): false,
		"":                      false,
		"two words":             false,
		"ñandú":                 false,
		"under_score":           false,
	} {
		if habboName.MatchString(name) != valid {
			t.Errorf("habbo name %q: valid = %t, want %t", name, !valid, valid)
		}
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
