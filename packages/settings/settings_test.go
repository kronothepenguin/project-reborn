package settings

import (
	"bytes"
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

var seededAt = time.Date(2020, time.January, 1, 0, 0, 0, 0, time.UTC)

func openDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func putRows(t *testing.T, q *store.Queries, rows map[string]string) {
	t.Helper()
	for key, value := range rows {
		if err := q.UpsertSetting(t.Context(), store.UpsertSettingParams{Key: key, Value: value, UpdatedAt: seededAt}); err != nil {
			t.Fatalf("UpsertSetting %s: %v", key, err)
		}
	}
}

func listRows(t *testing.T, q *store.Queries) map[string]store.Setting {
	t.Helper()
	rows, err := q.ListSettings(t.Context())
	if err != nil {
		t.Fatalf("ListSettings: %v", err)
	}
	out := make(map[string]store.Setting, len(rows))
	for _, row := range rows {
		out[row.Key] = row
	}
	return out
}

func createUser(t *testing.T, q *store.Queries) int64 {
	t.Helper()
	user, err := q.CreateUser(t.Context(), store.CreateUserParams{
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

// value reads key with the reader of its declared type.
func value(t *testing.T, q *store.Queries, key string) any {
	t.Helper()
	switch catalogue[key].def.(type) {
	case int:
		return Int(t.Context(), q, key)
	case bool:
		return Bool(t.Context(), q, key)
	default:
		return String(t.Context(), q, key)
	}
}

func assertValues(t *testing.T, q *store.Queries, want map[string]any) {
	t.Helper()
	for key, w := range want {
		if got := value(t, q, key); got != w {
			t.Errorf("%s = %#v, want %#v", key, got, w)
		}
	}
}

// lockedBuffer lets the test read what slog writes while a read may log.
type lockedBuffer struct {
	mu  sync.Mutex
	buf bytes.Buffer
}

func (b *lockedBuffer) Write(p []byte) (int, error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.buf.Write(p)
}

func (b *lockedBuffer) String() string {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.buf.String()
}

func captureWarnings(t *testing.T) *lockedBuffer {
	t.Helper()
	var buf lockedBuffer
	prev, prevOutput, prevFlags := slog.Default(), log.Writer(), log.Flags()
	slog.SetDefault(slog.New(slog.NewTextHandler(&buf, nil)))
	// slog.SetDefault also redirects the log package, which restoring the
	// previous slog logger does not undo.
	t.Cleanup(func() {
		slog.SetDefault(prev)
		log.SetOutput(prevOutput)
		log.SetFlags(prevFlags)
		reported.Clear()
	})
	reported.Clear()
	return &buf
}

func TestASavedSettingIsReadOnTheNextRead(t *testing.T) {
	q := store.New(openDB(t))
	userID := createUser(t, q)
	assertValues(t, q, map[string]any{"site.maintenance": false})

	for key, value := range map[string]any{"site.maintenance": true, "site.name": "Holo Hotel", "auth.rememberDays": 7} {
		if err := Set(t.Context(), q, userID, key, value); err != nil {
			t.Fatalf("Set %s: %v", key, err)
		}
	}

	assertValues(t, q, map[string]any{"site.maintenance": true, "site.name": "Holo Hotel", "auth.rememberDays": 7})
	rows := listRows(t, q)
	for key, literal := range map[string]string{"site.maintenance": `true`, "site.name": `"Holo Hotel"`, "auth.rememberDays": `7`} {
		row := rows[key]
		if row.Value != literal || row.UpdatedByUserID != (sql.NullInt64{Int64: userID, Valid: true}) || !row.UpdatedAt.After(seededAt) {
			t.Errorf("row %s = %+v, want %s written now by user %d", key, row, literal, userID)
		}
	}
}

func TestAHotelWithoutRowsHoldsEveryDefault(t *testing.T) {
	q := store.New(openDB(t))

	for key, d := range catalogue {
		if got := value(t, q, key); got != d.def {
			t.Errorf("%s = %#v, want the default %#v", key, got, d.def)
		}
	}
}

func TestANewHotelIsNamedReborn(t *testing.T) {
	q := store.New(openDB(t))

	assertValues(t, q, map[string]any{"site.name": "Reborn Hotel", "site.shortName": "Reborn"})
}

func TestABadRowReadsAsTheDefaultAndIsLoggedOnce(t *testing.T) {
	warnings := captureWarnings(t)
	q := store.New(openDB(t))
	putRows(t, q, map[string]string{
		"auth.rememberDays":       `"7"`,
		"auth.sessionIdleMinutes": `1`,
		"site.shortName":          `Retro`,
		"site.maintenance":        `null`,
		"mail.password":           `42`,
		"site.url":                `"https://hotel.example.com"`,
	})

	for range 3 {
		assertValues(t, q, map[string]any{
			"auth.rememberDays":       100,
			"auth.sessionIdleMinutes": 30,
			"site.shortName":          "Reborn",
			"site.maintenance":        false,
			"mail.password":           "",
			"site.url":                "https://hotel.example.com",
		})
	}

	for _, key := range []string{"auth.rememberDays", "auth.sessionIdleMinutes", "site.shortName", "site.maintenance", "mail.password"} {
		if n := strings.Count(warnings.String(), "key="+key+" "); n != 1 {
			t.Errorf("%s logged %d times, want once:\n%s", key, n, warnings)
		}
	}
	if strings.Contains(warnings.String(), "key=site.url ") {
		t.Errorf("the valid site.url row was logged:\n%s", warnings)
	}
	if strings.Contains(warnings.String(), "42") {
		t.Errorf("the log holds a row's value:\n%s", warnings)
	}
}

func TestABadRowIsLoggedAgainForANewReason(t *testing.T) {
	warnings := captureWarnings(t)
	q := store.New(openDB(t))
	putRows(t, q, map[string]string{"auth.rememberDays": `"7"`})
	Int(t.Context(), q, "auth.rememberDays")

	putRows(t, q, map[string]string{"auth.rememberDays": `9999`})
	Int(t.Context(), q, "auth.rememberDays")

	if n := strings.Count(warnings.String(), "key=auth.rememberDays"); n != 2 {
		t.Errorf("logged %d times, want each reason once:\n%s", n, warnings)
	}
}

func TestAnUndeclaredOrConfigKeyReadsAsTheZeroValue(t *testing.T) {
	warnings := captureWarnings(t)
	q := store.New(openDB(t))
	putRows(t, q, map[string]string{"site.colour": `"red"`, "cms.port": `8080`})

	if got := String(t.Context(), q, "site.colour"); got != "" {
		t.Errorf("site.colour = %q, want the zero value", got)
	}
	if got := Int(t.Context(), q, "cms.port"); got != 0 {
		t.Errorf("cms.port = %d, want the zero value", got)
	}
	if got := Int(t.Context(), q, "site.name"); got != 0 {
		t.Errorf("site.name read as an int = %d, want the zero value", got)
	}
	for _, reason := range []string{"not a declared setting", "comes from config.json", "is a string, read as int"} {
		if !strings.Contains(warnings.String(), reason) {
			t.Errorf("no warning gives the reason %q:\n%s", reason, warnings)
		}
	}
}

func TestRowsBreakingARuleReadAsStored(t *testing.T) {
	warnings := captureWarnings(t)
	q := store.New(openDB(t))
	putRows(t, q, map[string]string{
		"auth.passwordMinLength": `30`,
		"auth.passwordMaxLength": `20`,
	})

	assertValues(t, q, map[string]any{"auth.passwordMinLength": 30, "auth.passwordMaxLength": 20})
	declared, err := Declared(t.Context(), q)
	if err != nil {
		t.Fatalf("Declared: %v", err)
	}
	for _, s := range declared {
		if want, ok := map[string]any{"auth.passwordMinLength": 30, "auth.passwordMaxLength": 20}[s.Key]; ok && s.Value != want {
			t.Errorf("Declared %s = %#v, want the stored %#v", s.Key, s.Value, want)
		}
	}
	if warnings.String() != "" {
		t.Errorf("a read logged rows that only break a rule:\n%s", warnings)
	}
}

func TestSavingASettingChecksTheRuleWithItsStoredPartner(t *testing.T) {
	q := store.New(openDB(t))
	putRows(t, q, map[string]string{"auth.passwordMaxLength": `40`})

	if err := Set(t.Context(), q, 0, "auth.passwordMinLength", 30); err != nil {
		t.Errorf("Set a minimum under the stored maximum: %v", err)
	}
	err := Set(t.Context(), q, 0, "auth.passwordMaxLength", 20)
	if want := "auth.passwordMaxLength: must be at least auth.passwordMinLength (30), got 20"; err == nil || !strings.Contains(err.Error(), want) {
		t.Errorf("Set a maximum under the stored minimum = %v, want it to contain %q", err, want)
	}
	assertValues(t, q, map[string]any{"auth.passwordMinLength": 30, "auth.passwordMaxLength": 40})
}

func TestValidateChecksAFormWithTheStoredPartnerWithoutWriting(t *testing.T) {
	q := store.New(openDB(t))
	putRows(t, q, map[string]string{"auth.passwordMaxLength": `40`})

	for _, c := range []struct {
		name   string
		values map[string]any
		want   string
	}{
		{"nothing", map[string]any{}, ""},
		{"good values", map[string]any{"site.name": "Hotel", "site.maintenance": true}, ""},
		{"a minimum under the stored maximum", map[string]any{"auth.passwordMinLength": 30}, ""},
		{"a minimum over the stored maximum", map[string]any{"auth.passwordMinLength": 50}, "auth.passwordMaxLength: must be at least auth.passwordMinLength (50), got 40"},
		{"both limits that hold together", map[string]any{"auth.passwordMinLength": 50, "auth.passwordMaxLength": 60}, ""},
		{"one bad value among good ones", map[string]any{"site.name": "Hotel", "auth.sessionIdleMinutes": 1}, "auth.sessionIdleMinutes: must be between 5 and 1440"},
		{"other type", map[string]any{"site.maintenance": "yes"}, "site.maintenance: expected bool"},
		{"config key", map[string]any{"cms.port": 8080}, "cms.port: comes from config.json"},
		{"undeclared key", map[string]any{"site.colour": "red"}, "site.colour: not a declared setting"},
	} {
		t.Run(c.name, func(t *testing.T) {
			err := Validate(t.Context(), q, c.values)
			switch {
			case c.want == "" && err != nil:
				t.Errorf("Validate() = %v, want nil", err)
			case c.want != "" && (err == nil || !strings.Contains(err.Error(), c.want)):
				t.Errorf("Validate() = %v, want it to contain %q", err, c.want)
			}
		})
	}
	if rows := listRows(t, q); len(rows) != 1 {
		t.Errorf("Validate wrote rows: %+v", rows)
	}
}

func TestSettingTheDefaultDeletesTheRow(t *testing.T) {
	q := store.New(openDB(t))
	putRows(t, q, map[string]string{"site.name": `"Row Hotel"`, "site.maintenance": `true`})

	if err := Set(t.Context(), q, 0, "site.name", "Reborn Hotel"); err != nil {
		t.Fatalf("Set: %v", err)
	}

	rows := listRows(t, q)
	if row, ok := rows["site.name"]; ok {
		t.Errorf("the site.name row is still stored: %+v", row)
	}
	if _, ok := rows["site.maintenance"]; !ok {
		t.Error("the untouched site.maintenance row was deleted")
	}
	assertValues(t, q, map[string]any{"site.name": "Reborn Hotel", "site.maintenance": true})
}

func TestSetRefusesABadValueAndWritesNothing(t *testing.T) {
	q := store.New(openDB(t))
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
		{"malformed sender", "mail.from", "not an address", `mail.from: must be an email address, got "not an address"`},
		{"gender outside the list", "registration.defaultGender", "U", `registration.defaultGender: must be one of [M F], got "U"`},
		{"imager with a query", "imaging.avatarUrl", "https://imager.example/avatar?size=b", "imaging.avatarUrl: must be an http or https URL without a query"},
		{"imager on another scheme", "imaging.avatarUrl", "ftp://imager.example/avatar", "imaging.avatarUrl: must be an http or https URL without a query"},
		{"broken rule", "auth.passwordMinLength", 30, "auth.passwordMaxLength: must be at least auth.passwordMinLength (30), got 25"},
	} {
		t.Run(c.name, func(t *testing.T) {
			err := Set(t.Context(), q, 0, c.key, c.value)
			if err == nil || !strings.Contains(err.Error(), c.want) {
				t.Fatalf("Set() error = %v, want it to contain %q", err, c.want)
			}
			if rows := listRows(t, q); len(rows) != 0 {
				t.Errorf("rows written despite the refusal: %+v", rows)
			}
		})
	}
}

func TestDeclaredListsEverySettingWithoutSecrets(t *testing.T) {
	q := store.New(openDB(t))
	putRows(t, q, map[string]string{"site.name": `"Row Hotel"`, "mail.password": `"hunter2"`, "site.colour": `"red"`})

	declared, err := Declared(t.Context(), q)
	if err != nil {
		t.Fatalf("Declared: %v", err)
	}
	if len(declared) != len(catalogue) {
		t.Errorf("Declared() lists %d settings, want %d", len(declared), len(catalogue))
	}
	if !slices.IsSortedFunc(declared, func(a, b Setting) int { return strings.Compare(a.Key, b.Key) }) {
		t.Error("Declared() is not sorted by key")
	}
	byKey := make(map[string]Setting, len(declared))
	for _, setting := range declared {
		byKey[setting.Key] = setting
	}
	if got := byKey["site.name"]; got.Value != "Row Hotel" || got.Default != "Reborn Hotel" || got.Secret {
		t.Errorf("site.name = %+v, want its stored value and its default", got)
	}
	if got := byKey["auth.loginMaxFailures"]; got.Value != 5 || got.Default != 5 {
		t.Errorf("auth.loginMaxFailures = %+v, want the default int", got)
	}
	if got := byKey["mail.password"]; !got.Secret || got.Value != nil {
		t.Errorf("mail.password = %+v, want a secret without its value", got)
	}
	if strings.Contains(fmt.Sprintf("%+v", declared), "hunter2") {
		t.Error("Declared() hands out a secret")
	}
	if got := String(t.Context(), q, "mail.password"); got != "hunter2" {
		t.Errorf("String(mail.password) = %q, the mailer needs the value", got)
	}
}

func TestTheImagerTakesAPath(t *testing.T) {
	q := store.New(openDB(t))

	const url = "http://localhost:8080/imager/avatar"
	if err := Set(t.Context(), q, 0, "imaging.avatarUrl", url); err != nil {
		t.Fatalf("Set: %v", err)
	}
	if got := String(t.Context(), q, "imaging.avatarUrl"); got != url {
		t.Errorf("imaging.avatarUrl = %q, want %q", got, url)
	}
}
