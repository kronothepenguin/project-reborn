package settings

import (
	"bytes"
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"maps"
	"os"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

var (
	testConfig *config.Config
	seededAt   = time.Date(2020, time.January, 1, 0, 0, 0, 0, time.UTC)
)

// config.Load reads config.json once per process, so the whole package shares
// one file, loaded before any test runs.
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "virtual-test-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(dir)
	if err := os.Chdir(dir); err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile("config.json", []byte(`{"cms": {"port": 18000}}`+"\n"), 0o644); err != nil {
		log.Fatal(err)
	}
	if testConfig, err = config.Load(); err != nil {
		log.Fatal(err)
	}
	m.Run()
}

func openDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func putRows(t *testing.T, db *sql.DB, rows map[string]string) {
	t.Helper()
	q := store.New(db)
	for key, value := range rows {
		if err := q.UpsertSetting(t.Context(), store.UpsertSettingParams{Key: key, Value: value, UpdatedAt: seededAt}); err != nil {
			t.Fatalf("UpsertSetting %s: %v", key, err)
		}
	}
}

func listRows(t *testing.T, db *sql.DB) map[string]store.Setting {
	t.Helper()
	rows, err := store.New(db).ListSettings(t.Context())
	if err != nil {
		t.Fatalf("ListSettings: %v", err)
	}
	out := make(map[string]store.Setting, len(rows))
	for _, row := range rows {
		out[row.Key] = row
	}
	return out
}

func createUser(t *testing.T, db *sql.DB) int64 {
	t.Helper()
	user, err := store.New(db).CreateUser(t.Context(), store.CreateUserParams{
		Email:     "admin@example.com",
		BornOn:    time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		CreatedIP: "127.0.0.1",
		CreatedAt: seededAt,
		UpdatedAt: seededAt,
	})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}
	return user.ID
}

func load(t *testing.T, db *sql.DB) {
	t.Helper()
	if err := Load(t.Context(), testConfig, db); err != nil {
		t.Fatalf("Load: %v", err)
	}
}

func assertValues(t *testing.T, want map[string]any) {
	t.Helper()
	loaded := current()
	for key, value := range want {
		if loaded[key] != value {
			t.Errorf("%s = %#v, want %#v", key, loaded[key], value)
		}
	}
}

func captureWarnings(t *testing.T) *bytes.Buffer {
	t.Helper()
	var buf bytes.Buffer
	prev, prevOutput, prevFlags := slog.Default(), log.Writer(), log.Flags()
	slog.SetDefault(slog.New(slog.NewTextHandler(&buf, nil)))
	// slog.SetDefault also redirects the log package, which restoring the
	// previous slog logger does not undo.
	t.Cleanup(func() {
		slog.SetDefault(prev)
		log.SetOutput(prevOutput)
		log.SetFlags(prevFlags)
	})
	return &buf
}

func assertWarned(t *testing.T, warnings *bytes.Buffer, keys ...string) {
	t.Helper()
	for _, key := range keys {
		if !strings.Contains(warnings.String(), "key="+key+" ") {
			t.Errorf("no warning for %s in:\n%s", key, warnings)
		}
	}
}

func TestLoadWithoutRowsHoldsDefaultsAndConfig(t *testing.T) {
	load(t, openDB(t))

	loaded := current()
	declared := Declared()
	if len(declared) == 0 {
		t.Fatal("Declared() lists no setting")
	}
	for _, setting := range declared {
		if loaded[setting.Key] != setting.Default {
			t.Errorf("%s = %#v, want the default %#v", setting.Key, loaded[setting.Key], setting.Default)
		}
	}
	assertValues(t, map[string]any{"cms.port": 18000, "store.path": "habbo.db", "proxy.enabled": false})
	fromConfig := make(map[string]any)
	dump("", reflect.ValueOf(*testConfig), fromConfig)
	if len(loaded) != len(declared)+len(fromConfig) {
		t.Errorf("the map holds %d keys, want the %d declared settings and the %d config keys", len(loaded), len(declared), len(fromConfig))
	}
}

func TestRowsOverrideDefaults(t *testing.T) {
	db := openDB(t)
	putRows(t, db, map[string]string{
		"site.maintenance":  `true`,
		"site.name":         `"Row Hotel"`,
		"auth.rememberDays": `7`,
		"cms.refresh":       `5`,
	})
	load(t, db)

	assertValues(t, map[string]any{
		"site.maintenance":  true,
		"site.name":         "Row Hotel",
		"auth.rememberDays": 7,
		"cms.refresh":       5,
		"site.shortName":    "Reborn",
	})
}

func TestDeletedRowRestoresTheDefault(t *testing.T) {
	db := openDB(t)
	putRows(t, db, map[string]string{"site.name": `"Row Hotel"`})
	load(t, db)

	if err := store.New(db).DeleteSetting(t.Context(), "site.name"); err != nil {
		t.Fatalf("DeleteSetting: %v", err)
	}
	if err := Reload(t.Context(), db); err != nil {
		t.Fatalf("Reload: %v", err)
	}
	assertValues(t, map[string]any{"site.name": "Reborn Hotel"})
}

func TestUndeclaredAndConfigRowsAreIgnored(t *testing.T) {
	db := openDB(t)
	putRows(t, db, map[string]string{
		"site.colour": `"red"`,
		"site":        `{"name": "Section Hotel"}`,
		"store.path":  `"other.db"`,
		"cms.port":    `8080`,
	})
	load(t, db)

	assertValues(t, map[string]any{"site.name": "Reborn Hotel", "store.path": "habbo.db", "cms.port": 18000})
	for _, key := range []string{"site.colour", "site"} {
		if _, ok := current()[key]; ok {
			t.Errorf("the undeclared %s row was loaded", key)
		}
	}
}

func TestSetWritesTheRowAndAppliesAtOnce(t *testing.T) {
	db := openDB(t)
	userID := createUser(t, db)
	load(t, db)

	for key, value := range map[string]any{"site.maintenance": true, "site.name": "Holo Hotel", "auth.rememberDays": 7} {
		if err := Set(t.Context(), db, userID, key, value); err != nil {
			t.Fatalf("Set %s: %v", key, err)
		}
	}

	assertValues(t, map[string]any{"site.maintenance": true, "site.name": "Holo Hotel", "auth.rememberDays": 7})
	if got := Declared(); !slices.ContainsFunc(got, func(s Setting) bool { return s.Key == "site.name" && s.Value == "Holo Hotel" }) {
		t.Error("Declared() does not show the value just set")
	}
	rows := listRows(t, db)
	if len(rows) != 3 {
		t.Errorf("rows = %+v, want the 3 settings that were set", rows)
	}
	for key, literal := range map[string]string{"site.maintenance": `true`, "site.name": `"Holo Hotel"`, "auth.rememberDays": `7`} {
		row := rows[key]
		if row.Value != literal || row.UpdatedByUserID != (sql.NullInt64{Int64: userID, Valid: true}) || !row.UpdatedAt.After(seededAt) {
			t.Errorf("row %s = %+v, want %s written now by user %d", key, row, literal, userID)
		}
	}
}

func TestSetRefusals(t *testing.T) {
	for _, c := range []struct {
		name  string
		key   string
		value any
		want  string
	}{
		{"config key", "cms.port", 8080, "cms.port: comes from config.json"},
		{"undeclared key", "site.colour", "red", "site.colour: not a declared setting"},
		{"other type", "site.maintenance", "yes", "site.maintenance: expected bool, got string"},
		{"broken rule", "auth.passwordMinLength", 30, "auth.passwordMaxLength: must be at least auth.passwordMinLength (30), got 25"},
	} {
		t.Run(c.name, func(t *testing.T) {
			db := openDB(t)
			load(t, db)
			before := maps.Clone(current())

			err := Set(t.Context(), db, 0, c.key, c.value)
			if err == nil || !strings.Contains(err.Error(), c.want) {
				t.Fatalf("Set() error = %v, want it to contain %q", err, c.want)
			}
			if rows := listRows(t, db); len(rows) != 0 {
				t.Errorf("rows written despite the refusal: %+v", rows)
			}
			if !reflect.DeepEqual(current(), before) {
				t.Errorf("the values changed despite the refusal")
			}
		})
	}
}

func TestDeclaredListsTheSettingsWithoutSecrets(t *testing.T) {
	db := openDB(t)
	putRows(t, db, map[string]string{"site.name": `"Row Hotel"`, "mail.password": `"hunter2"`})
	load(t, db)

	declared := Declared()
	if !slices.IsSortedFunc(declared, func(a, b Setting) int { return strings.Compare(a.Key, b.Key) }) {
		t.Error("Declared() is not sorted by key")
	}
	byKey := make(map[string]Setting, len(declared))
	for _, setting := range declared {
		byKey[setting.Key] = setting
	}
	if got := byKey["site.name"]; got.Value != "Row Hotel" || got.Secret {
		t.Errorf("site.name = %+v, want its current value", got)
	}
	if got := byKey["auth.loginMaxFailures"]; got.Value != 5 {
		t.Errorf("auth.loginMaxFailures = %+v, want an int", got)
	}
	if got := byKey["site.maintenance"]; got.Value != false {
		t.Errorf("site.maintenance = %+v, want a bool", got)
	}
	if got := byKey["mail.password"]; !got.Secret || got.Value != nil {
		t.Errorf("mail.password = %+v, want a secret without its value", got)
	}
	if strings.Contains(fmt.Sprintf("%+v", declared), "hunter2") {
		t.Error("Declared() hands out a secret")
	}
	if got := GetString("mail.password"); got != "hunter2" {
		t.Errorf("GetString(mail.password) = %q, the mailer needs the value", got)
	}
}

func TestReloadAppliesRowsWrittenElsewhere(t *testing.T) {
	db := openDB(t)
	load(t, db)
	putRows(t, db, map[string]string{"site.maintenance": `true`})

	if GetBool("site.maintenance") {
		t.Fatal("a row written after Load applied before Reload")
	}
	if err := Reload(t.Context(), db); err != nil {
		t.Fatalf("Reload: %v", err)
	}
	if !GetBool("site.maintenance") {
		t.Error("site.maintenance = false after Reload, want the row value true")
	}
}
