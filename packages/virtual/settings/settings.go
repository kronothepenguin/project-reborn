// Package settings is the in-memory copy of the settings, one per process: the
// declared defaults, then every config.json value, then the rows of the
// settings table. It never keeps a database connection; the functions that use
// the database receive it.
package settings

import (
	"context"
	"database/sql"
	"encoding/json/v2"
	"errors"
	"fmt"
	"log/slog"
	"maps"
	"reflect"
	"slices"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Load, Reload and Set never edit the map the getters read: they build a copy
// with the new values and swap it in with one atomic store, so a getter always
// sees the latest values without taking a lock. mu only serializes the
// writers, which hold it while they use the database. With an RWMutex the
// getters would wait on that database call, and a request reading a setting
// while it holds the store's only connection would deadlock.
var (
	mu     sync.Mutex
	base   map[string]any
	values atomic.Pointer[map[string]any]
)

var errNotLoaded = errors.New("settings: not loaded")

// Load builds the settings from cfg and the rows of db. It may run again, as
// it does when several apps of one process each load them.
func Load(ctx context.Context, cfg *config.Config, db *sql.DB) error {
	if err := cfg.Validate(); err != nil {
		return fmt.Errorf("settings: %w", err)
	}
	next := make(map[string]any)
	for key, d := range catalogue {
		next[key] = d.def
	}
	dump("", reflect.ValueOf(*cfg), next)

	mu.Lock()
	defer mu.Unlock()
	loaded, err := merge(ctx, db, next)
	if err != nil {
		return err
	}
	base = next
	values.Store(&loaded)
	return nil
}

func Reload(ctx context.Context, db *sql.DB) error {
	mu.Lock()
	defer mu.Unlock()
	if base == nil {
		return errNotLoaded
	}
	loaded, err := merge(ctx, db, base)
	if err != nil {
		return err
	}
	values.Store(&loaded)
	return nil
}

// Set validates value for a declared key and writes its row, or deletes the row
// when value equals the default. A userID of 0 records no user, for writes made
// before the first user exists.
func Set(ctx context.Context, db *sql.DB, userID int64, key string, value any) error {
	mu.Lock()
	defer mu.Unlock()
	if base == nil {
		return errNotLoaded
	}

	d, err := lookup(key)
	if err != nil {
		return fmt.Errorf("settings: %s: %w", key, err)
	}
	if err := d.validate(value); err != nil {
		return fmt.Errorf("settings: %s: %w", key, err)
	}
	next := maps.Clone(*values.Load())
	next[key] = value
	for _, r := range rules {
		if err := r.check(next); err != nil {
			return fmt.Errorf("settings: %w", err)
		}
	}
	literal, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("settings: %s: %w", key, err)
	}

	q := store.New(db)
	if value == d.def {
		err = q.DeleteSetting(ctx, key)
	} else {
		err = q.UpsertSetting(ctx, store.UpsertSettingParams{
			Key:             key,
			Value:           string(literal),
			UpdatedAt:       time.Now().UTC(),
			UpdatedByUserID: sql.NullInt64{Int64: userID, Valid: userID != 0},
		})
	}
	if err != nil {
		return fmt.Errorf("settings: %s: %w", key, err)
	}
	values.Store(&next)
	return nil
}

// Validate reports why Set would refuse values taken together, and writes
// nothing, so that a form can refuse all of its values before it writes one.
func Validate(candidates map[string]any) error {
	mu.Lock()
	defer mu.Unlock()
	if base == nil {
		return errNotLoaded
	}

	next := maps.Clone(*values.Load())
	for _, key := range slices.Sorted(maps.Keys(candidates)) {
		d, err := lookup(key)
		if err != nil {
			return fmt.Errorf("settings: %s: %w", key, err)
		}
		if err := d.validate(candidates[key]); err != nil {
			return fmt.Errorf("settings: %s: %w", key, err)
		}
		next[key] = candidates[key]
	}
	for _, r := range rules {
		if err := r.check(next); err != nil {
			return fmt.Errorf("settings: %w", err)
		}
	}
	return nil
}

// Setting is one declared setting as a form shows it. Value is an int, a bool or
// a string, and it is nil for a secret, which never leaves this package.
type Setting struct {
	Key    string
	Value  any
	Secret bool
}

// Declared lists the declared settings with their current values, sorted by key,
// without the values of config.json.
func Declared() []Setting {
	loaded := current()
	declared := make([]Setting, 0, len(catalogue))
	for _, key := range slices.Sorted(maps.Keys(catalogue)) {
		setting := Setting{Key: key, Secret: catalogue[key].secret}
		if !setting.Secret {
			setting.Value = loaded[key]
		}
		declared = append(declared, setting)
	}
	return declared
}

func GetInt(key string) int {
	return get[int](key)
}

func GetBool(key string) bool {
	return get[bool](key)
}

func GetString(key string) string {
	return get[string](key)
}

func GetIntOr(key string, fallback int) int {
	return getOr(key, fallback)
}

func GetBoolOr(key string, fallback bool) bool {
	return getOr(key, fallback)
}

func GetStringOr(key string, fallback string) string {
	return getOr(key, fallback)
}

func merge(ctx context.Context, db *sql.DB, base map[string]any) (map[string]any, error) {
	rows, err := store.New(db).ListSettings(ctx)
	if err != nil {
		return nil, fmt.Errorf("settings: %w", err)
	}

	merged := maps.Clone(base)
	fromRows := make(map[string]bool)
	for _, row := range rows {
		value, err := decode(row)
		if err != nil {
			ignore(row.Key, err)
			continue
		}
		merged[row.Key] = value
		fromRows[row.Key] = true
	}
	// A broken rule cannot tell which of its rows is wrong, so each of them goes
	// back to its default; the defaults satisfy every rule.
	for _, r := range rules {
		if err := r.check(merged); err != nil {
			for _, key := range r.keys {
				if fromRows[key] {
					merged[key] = base[key]
					ignore(key, err)
				}
			}
		}
	}
	return merged, nil
}

// lookup reads base, so its callers hold mu.
func lookup(key string) (declaration, error) {
	if d, ok := catalogue[key]; ok {
		return d, nil
	}
	if _, ok := base[key]; ok {
		return declaration{}, errors.New("comes from config.json")
	}
	return declaration{}, errors.New("not a declared setting")
}

func decode(row store.Setting) (any, error) {
	d, err := lookup(row.Key)
	if err != nil {
		return nil, err
	}
	value, err := d.decode(row.Value)
	if err != nil {
		return nil, err
	}
	if err := d.validate(value); err != nil {
		return nil, err
	}
	return value, nil
}

func current() map[string]any {
	if loaded := values.Load(); loaded != nil {
		return *loaded
	}
	return nil
}

func get[T int | bool | string](key string) T {
	value, ok := current()[key].(T)
	if !ok {
		slog.Warn("settings: missing or of another type", "key", key, "want", fmt.Sprintf("%T", value))
	}
	return value
}

func getOr[T int | bool | string](key string, fallback T) T {
	if value, ok := current()[key].(T); ok {
		return value
	}
	return fallback
}

// dump stores every config value under the key path of its JSON tags (cms.port).
func dump(prefix string, v reflect.Value, out map[string]any) {
	for field, value := range v.Fields() {
		if !field.IsExported() {
			continue
		}
		name, _, _ := strings.Cut(field.Tag.Get("json"), ",")
		if field.Type.Kind() == reflect.Struct {
			dump(prefix+name+".", value, out)
			continue
		}
		out[prefix+name] = value.Interface()
	}
}

// ignore never logs the row's value: rows can hold secrets such as passwords.
func ignore(key string, reason error) {
	slog.Warn("settings: row ignored", "key", key, "reason", reason)
}
