package virtual

import (
	"bytes"
	"database/sql"
	"log"
	"log/slog"
	"maps"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"sync"
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

func load(t *testing.T, db *sql.DB) *Settings {
	t.Helper()
	s, err := LoadSettings(t.Context(), testConfig, db)
	if err != nil {
		t.Fatalf("LoadSettings: %v", err)
	}
	return s
}

func assertValues(t *testing.T, s *Settings, want map[string]any) {
	t.Helper()
	values := *s.values.Load()
	for key, value := range want {
		if values[key] != value {
			t.Errorf("%s = %#v, want %#v", key, values[key], value)
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

func TestCatalogueDefaultsAreValid(t *testing.T) {
	defaults := make(map[string]any)
	for key, d := range catalogue {
		if err := d.validate(d.def); err != nil {
			t.Errorf("the default of %s is invalid: %v", key, err)
		}
		defaults[key] = d.def
	}
	for _, r := range rules {
		if err := r.check(defaults); err != nil {
			t.Errorf("the defaults break a rule: %v", err)
		}
		for _, key := range r.keys {
			if _, ok := catalogue[key]; !ok {
				t.Errorf("a rule reads %s, which is not declared", key)
			}
		}
	}
}

func TestCatalogueKeysAreNotConfigKeys(t *testing.T) {
	fromConfig := make(map[string]any)
	dump("", reflect.ValueOf(*testConfig), fromConfig)
	if len(fromConfig) == 0 {
		t.Fatal("dump found no config keys")
	}
	for key := range fromConfig {
		if _, ok := catalogue[key]; ok {
			t.Errorf("%s is both a config.json key and a declared setting", key)
		}
	}
}

func TestLoadSettingsWithoutRowsHoldsDefaultsAndConfig(t *testing.T) {
	s := load(t, openDB(t))

	values := *s.values.Load()
	for key, d := range catalogue {
		if values[key] != d.def {
			t.Errorf("%s = %#v, want the default %#v", key, values[key], d.def)
		}
	}
	assertValues(t, s, map[string]any{"cms.port": 18000, "store.path": "habbo.db", "proxy.enabled": false})
	fromConfig := make(map[string]any)
	dump("", reflect.ValueOf(*testConfig), fromConfig)
	if len(values) != len(catalogue)+len(fromConfig) {
		t.Errorf("the map holds %d keys, want the %d declared settings and the %d config keys", len(values), len(catalogue), len(fromConfig))
	}
}

func TestLoadSettingsRefusesAnInvalidConfig(t *testing.T) {
	invalid := *testConfig
	invalid.CMS.Port = 0
	_, err := LoadSettings(t.Context(), &invalid, openDB(t))
	if err == nil || !strings.Contains(err.Error(), "cms.port") {
		t.Fatalf("LoadSettings() error = %v, want a cms.port error", err)
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
	s := load(t, db)

	assertValues(t, s, map[string]any{
		"site.maintenance":  true,
		"site.name":         "Row Hotel",
		"auth.rememberDays": 7,
		"cms.refresh":       5,
		"site.shortName":    "Holo",
	})
}

func TestDeletedRowRestoresTheDefault(t *testing.T) {
	db := openDB(t)
	putRows(t, db, map[string]string{"site.name": `"Row Hotel"`})
	s := load(t, db)

	if err := store.New(db).DeleteSetting(t.Context(), "site.name"); err != nil {
		t.Fatalf("DeleteSetting: %v", err)
	}
	if err := s.Reload(t.Context(), db); err != nil {
		t.Fatalf("Reload: %v", err)
	}
	assertValues(t, s, map[string]any{"site.name": "Holo Hotel"})
}

func TestInvalidRowsAreIgnoredAndLogged(t *testing.T) {
	warnings := captureWarnings(t)
	db := openDB(t)
	putRows(t, db, map[string]string{
		"auth.rememberDays":       `"7"`,
		"auth.sessionIdleMinutes": `1`,
		"site.shortName":          `Reborn`,
		"site.maintenance":        `null`,
		"site.url":                `"https://hotel.example.com"`,
	})
	s := load(t, db)

	assertValues(t, s, map[string]any{
		"auth.rememberDays":       100,
		"auth.sessionIdleMinutes": 30,
		"site.shortName":          "Holo",
		"site.maintenance":        false,
		"site.url":                "https://hotel.example.com",
	})
	assertWarned(t, warnings, "auth.rememberDays", "auth.sessionIdleMinutes", "site.shortName", "site.maintenance")
	if strings.Contains(warnings.String(), "key=site.url ") {
		t.Errorf("the valid site.url row was logged as ignored:\n%s", warnings)
	}
}

func TestUndeclaredAndConfigRowsAreIgnoredAndLogged(t *testing.T) {
	warnings := captureWarnings(t)
	db := openDB(t)
	putRows(t, db, map[string]string{
		"site.colour": `"red"`,
		"site":        `{"name": "Section Hotel"}`,
		"store.path":  `"other.db"`,
		"cms.port":    `8080`,
	})
	s := load(t, db)

	assertValues(t, s, map[string]any{"site.name": "Holo Hotel", "store.path": "habbo.db", "cms.port": 18000})
	for _, key := range []string{"site.colour", "site"} {
		if _, ok := (*s.values.Load())[key]; ok {
			t.Errorf("the undeclared %s row was loaded", key)
		}
	}
	assertWarned(t, warnings, "site.colour", "site", "store.path", "cms.port")
	for _, reason := range []string{"comes from config.json", "not a declared setting"} {
		if !strings.Contains(warnings.String(), reason) {
			t.Errorf("no warning gives the reason %q:\n%s", reason, warnings)
		}
	}
}

func TestRowsBreakingARuleGoBackToTheirDefaults(t *testing.T) {
	warnings := captureWarnings(t)
	db := openDB(t)
	putRows(t, db, map[string]string{
		"auth.passwordMinLength": `30`,
		"auth.passwordMaxLength": `20`,
	})
	s := load(t, db)

	assertValues(t, s, map[string]any{"auth.passwordMinLength": 6, "auth.passwordMaxLength": 25})
	assertWarned(t, warnings, "auth.passwordMinLength", "auth.passwordMaxLength")
}

func TestRowBreakingARuleWithADefaultIsIgnored(t *testing.T) {
	warnings := captureWarnings(t)
	db := openDB(t)
	putRows(t, db, map[string]string{"auth.passwordMinLength": `30`})
	s := load(t, db)

	assertValues(t, s, map[string]any{"auth.passwordMinLength": 6, "auth.passwordMaxLength": 25})
	assertWarned(t, warnings, "auth.passwordMinLength")
	if strings.Contains(warnings.String(), "key=auth.passwordMaxLength ") {
		t.Errorf("auth.passwordMaxLength has no row but was logged as ignored:\n%s", warnings)
	}
}

func TestRowsSatisfyingARuleTogetherAreKept(t *testing.T) {
	db := openDB(t)
	putRows(t, db, map[string]string{
		"auth.passwordMinLength": `30`,
		"auth.passwordMaxLength": `40`,
	})
	s := load(t, db)

	assertValues(t, s, map[string]any{"auth.passwordMinLength": 30, "auth.passwordMaxLength": 40})
}

func TestGettersReturnTheValues(t *testing.T) {
	s := load(t, openDB(t))

	if got := s.GetInt("cms.port"); got != 18000 {
		t.Errorf(`GetInt("cms.port") = %d, want 18000`, got)
	}
	if got := s.GetBool("auth.secureCookies"); !got {
		t.Error(`GetBool("auth.secureCookies") = false, want true`)
	}
	if got := s.GetString("site.name"); got != "Holo Hotel" {
		t.Errorf(`GetString("site.name") = %q, want "Holo Hotel"`, got)
	}
}

func TestGettersReturnZeroAndWarnForUnknownKeysAndOtherTypes(t *testing.T) {
	warnings := captureWarnings(t)
	s := load(t, openDB(t))

	if got := s.GetInt("site.colour"); got != 0 {
		t.Errorf(`GetInt("site.colour") = %d, want 0`, got)
	}
	if got := s.GetInt("site.name"); got != 0 {
		t.Errorf(`GetInt("site.name") = %d, want 0`, got)
	}
	if got := s.GetBool("cms.port"); got {
		t.Error(`GetBool("cms.port") = true, want false`)
	}
	if got := s.GetString("site.maintenance"); got != "" {
		t.Errorf(`GetString("site.maintenance") = %q, want ""`, got)
	}
	assertWarned(t, warnings, "site.colour", "site.name", "cms.port", "site.maintenance")
}

func TestOrGettersReturnTheFallbackWithoutWarning(t *testing.T) {
	warnings := captureWarnings(t)
	s := load(t, openDB(t))

	if got := s.GetIntOr("site.colour", 7); got != 7 {
		t.Errorf(`GetIntOr("site.colour", 7) = %d, want 7`, got)
	}
	if got := s.GetIntOr("cms.port", 7); got != 18000 {
		t.Errorf(`GetIntOr("cms.port", 7) = %d, want 18000`, got)
	}
	if got := s.GetBoolOr("site.name", true); !got {
		t.Error(`GetBoolOr("site.name", true) = false, want true`)
	}
	if got := s.GetBoolOr("site.maintenance", true); got {
		t.Error(`GetBoolOr("site.maintenance", true) = true, want the value false`)
	}
	if got := s.GetStringOr("cms.port", "fallback"); got != "fallback" {
		t.Errorf(`GetStringOr("cms.port", "fallback") = %q, want "fallback"`, got)
	}
	if got := s.GetStringOr("site.shortName", "fallback"); got != "Holo" {
		t.Errorf(`GetStringOr("site.shortName", "fallback") = %q, want "Holo"`, got)
	}
	if warnings.Len() != 0 {
		t.Errorf("the …Or getters logged:\n%s", warnings)
	}
}

func TestSetWritesTheRowAndAppliesAtOnce(t *testing.T) {
	db := openDB(t)
	userID := createUser(t, db)
	s := load(t, db)

	for key, value := range map[string]any{"site.maintenance": true, "site.name": "Reborn Hotel", "auth.rememberDays": 7} {
		if err := s.Set(t.Context(), db, userID, key, value); err != nil {
			t.Fatalf("Set %s: %v", key, err)
		}
	}

	assertValues(t, s, map[string]any{"site.maintenance": true, "site.name": "Reborn Hotel", "auth.rememberDays": 7})
	rows := listRows(t, db)
	if len(rows) != 3 {
		t.Errorf("rows = %+v, want the 3 settings that were set", rows)
	}
	for key, literal := range map[string]string{"site.maintenance": `true`, "site.name": `"Reborn Hotel"`, "auth.rememberDays": `7`} {
		row := rows[key]
		if row.Value != literal || row.UpdatedByUserID != (sql.NullInt64{Int64: userID, Valid: true}) || !row.UpdatedAt.After(seededAt) {
			t.Errorf("row %s = %+v, want %s written now by user %d", key, row, literal, userID)
		}
	}
}

func TestSetWithoutUserRecordsNoUser(t *testing.T) {
	db := openDB(t)
	s := load(t, db)

	if err := s.Set(t.Context(), db, 0, "site.maintenance", true); err != nil {
		t.Fatalf("Set: %v", err)
	}
	if row := listRows(t, db)["site.maintenance"]; row.Value != "true" || row.UpdatedByUserID.Valid {
		t.Errorf("row = %+v, want value true with no user", row)
	}
}

func TestSetToTheDefaultDeletesTheRow(t *testing.T) {
	db := openDB(t)
	putRows(t, db, map[string]string{"site.name": `"Row Hotel"`, "site.maintenance": `true`})
	s := load(t, db)

	if err := s.Set(t.Context(), db, 0, "site.name", "Holo Hotel"); err != nil {
		t.Fatalf("Set: %v", err)
	}

	rows := listRows(t, db)
	if row, ok := rows["site.name"]; ok {
		t.Errorf("the site.name row is still stored: %+v", row)
	}
	if _, ok := rows["site.maintenance"]; !ok {
		t.Error("the untouched site.maintenance row was deleted")
	}
	assertValues(t, s, map[string]any{"site.name": "Holo Hotel", "site.maintenance": true})
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
		{"other integer type", "auth.rememberDays", int64(7), "auth.rememberDays: expected int, got int64"},
		{"out of range", "auth.sessionIdleMinutes", 1, "auth.sessionIdleMinutes: must be between 5 and 1440, got 1"},
		{"broken rule", "auth.passwordMinLength", 30, "auth.passwordMaxLength: must be at least auth.passwordMinLength (30), got 25"},
	} {
		t.Run(c.name, func(t *testing.T) {
			db := openDB(t)
			s := load(t, db)
			before := maps.Clone(*s.values.Load())

			err := s.Set(t.Context(), db, 0, c.key, c.value)
			if err == nil || !strings.Contains(err.Error(), c.want) {
				t.Fatalf("Set() error = %v, want it to contain %q", err, c.want)
			}
			if rows := listRows(t, db); len(rows) != 0 {
				t.Errorf("rows written despite the refusal: %+v", rows)
			}
			if !reflect.DeepEqual(*s.values.Load(), before) {
				t.Errorf("the values changed despite the refusal")
			}
		})
	}
}

func TestReloadAppliesRowsWrittenElsewhere(t *testing.T) {
	db := openDB(t)
	s := load(t, db)
	putRows(t, db, map[string]string{"site.maintenance": `true`})

	if s.GetBool("site.maintenance") {
		t.Fatal("a row written after LoadSettings applied before Reload")
	}
	if err := s.Reload(t.Context(), db); err != nil {
		t.Fatalf("Reload: %v", err)
	}
	if !s.GetBool("site.maintenance") {
		t.Error("site.maintenance = false after Reload, want the row value true")
	}
}

func TestGettersDuringSets(t *testing.T) {
	db := openDB(t)
	s := load(t, db)

	var wg sync.WaitGroup
	for range 4 {
		wg.Go(func() {
			for range 100 {
				_ = s.GetBool("site.maintenance")
			}
		})
	}
	for i := range 10 {
		if err := s.Set(t.Context(), db, 0, "site.maintenance", i%2 == 0); err != nil {
			t.Errorf("Set: %v", err)
		}
	}
	wg.Wait()

	if s.GetBool("site.maintenance") {
		t.Error("site.maintenance = true after the last Set put back the default")
	}
	if rows := listRows(t, db); len(rows) != 0 {
		t.Errorf("rows = %+v, want none once the value is back to the default", rows)
	}
}
