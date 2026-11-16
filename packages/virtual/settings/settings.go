// Package settings is the in-memory copy of the settings, one per process, for
// the programs that do not read packages/settings on use yet: every config.json
// value, then each declared setting as packages/settings reads it from the
// store. It never keeps a database connection; the functions that use the
// database receive it.
package settings

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"maps"
	"reflect"
	"slices"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/kronothepenguin/project-reborn/packages/config"
	stored "github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Setting is one declared setting as a form shows it.
type Setting = stored.Setting

// Load, Reload and Set never edit the map the getters read: they build a copy
// with the new values and swap it in with one atomic store, so a getter always
// sees the latest values without taking a lock. mu only serializes the
// writers, which hold it while they use the database. With an RWMutex the
// getters would wait on that database call, and a request reading a setting
// while it holds the store's only connection would deadlock.
var (
	mu       sync.Mutex
	base     map[string]any
	declared atomic.Pointer[[]Setting]
	values   atomic.Pointer[map[string]any]
)

var errNotLoaded = errors.New("settings: not loaded")

// Load builds the settings from cfg and the rows of db. It may run again, as
// it does when several apps of one process each load them.
func Load(ctx context.Context, cfg *config.Config, db *sql.DB) error {
	if err := cfg.Validate(); err != nil {
		return fmt.Errorf("settings: %w", err)
	}
	next := make(map[string]any)
	dump("", reflect.ValueOf(*cfg), next)

	mu.Lock()
	defer mu.Unlock()
	loaded, list, err := merge(ctx, db, next)
	if err != nil {
		return err
	}
	base = next
	declared.Store(&list)
	values.Store(&loaded)
	return nil
}

func Reload(ctx context.Context, db *sql.DB) error {
	mu.Lock()
	defer mu.Unlock()
	if base == nil {
		return errNotLoaded
	}
	loaded, _, err := merge(ctx, db, base)
	if err != nil {
		return err
	}
	values.Store(&loaded)
	return nil
}

// Set writes one setting through packages/settings and applies it at once.
func Set(ctx context.Context, db *sql.DB, userID int64, key string, value any) error {
	mu.Lock()
	defer mu.Unlock()
	if base == nil {
		return errNotLoaded
	}
	if err := stored.Set(ctx, store.New(db), userID, key, value); err != nil {
		return err
	}
	next := maps.Clone(*values.Load())
	next[key] = value
	values.Store(&next)
	return nil
}

// Declared lists the declared settings with their current values, sorted by key,
// without the values of config.json or of the secrets.
func Declared() []Setting {
	loaded := current()
	var list []Setting
	if listed := declared.Load(); listed != nil {
		list = slices.Clone(*listed)
	}
	for i, setting := range list {
		if !setting.Secret {
			list[i].Value = loaded[setting.Key]
		}
	}
	return list
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

// merge adds every declared setting, as packages/settings reads it, to base.
// A secret comes without its value from Declared, so it is read on its own.
func merge(ctx context.Context, db *sql.DB, base map[string]any) (map[string]any, []Setting, error) {
	q := store.New(db)
	list, err := stored.Declared(ctx, q)
	if err != nil {
		return nil, nil, err
	}
	merged := maps.Clone(base)
	for _, setting := range list {
		merged[setting.Key] = setting.Value
		if !setting.Secret {
			continue
		}
		switch setting.Default.(type) {
		case int:
			merged[setting.Key] = stored.Int(ctx, q, setting.Key)
		case bool:
			merged[setting.Key] = stored.Bool(ctx, q, setting.Key)
		default:
			merged[setting.Key] = stored.String(ctx, q, setting.Key)
		}
	}
	return merged, list, nil
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
