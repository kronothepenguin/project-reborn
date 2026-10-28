// Package virtual is the in-memory representation of entities and their state.
// It never keeps a database connection: every function that touches the
// database receives the *sql.DB.
package virtual

import (
	"context"
	"database/sql"
	"encoding/json/v2"
	"errors"
	"fmt"
	"log/slog"
	"maps"
	"reflect"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Settings maps key paths to values: the declared defaults, then every
// config.json value, then the rows of the settings table.
//
// Set and Reload never edit the map the getters read: they build a copy with the
// new values and swap it in with one atomic store, so a getter always sees the
// latest values without taking a lock. mu only serializes Set and Reload, which
// hold it while they use the database. With an RWMutex the getters would wait on
// that database call, and a request reading a setting while it holds the store's
// only connection would deadlock.
type Settings struct {
	base   map[string]any
	values atomic.Pointer[map[string]any]
	mu     sync.Mutex
}

func LoadSettings(ctx context.Context, cfg *config.Config, db *sql.DB) (*Settings, error) {
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("virtual: settings: %w", err)
	}
	base := make(map[string]any)
	for key, d := range catalogue {
		base[key] = d.def
	}
	dump("", reflect.ValueOf(*cfg), base)

	s := &Settings{base: base}
	if err := s.Reload(ctx, db); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Settings) GetInt(key string) int {
	return s.get[int](key)
}

func (s *Settings) GetBool(key string) bool {
	return s.get[bool](key)
}

func (s *Settings) GetString(key string) string {
	return s.get[string](key)
}

func (s *Settings) GetIntOr(key string, fallback int) int {
	return s.getOr(key, fallback)
}

func (s *Settings) GetBoolOr(key string, fallback bool) bool {
	return s.getOr(key, fallback)
}

func (s *Settings) GetStringOr(key string, fallback string) string {
	return s.getOr(key, fallback)
}

func (s *Settings) Reload(ctx context.Context, db *sql.DB) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	rows, err := store.New(db).ListSettings(ctx)
	if err != nil {
		return fmt.Errorf("virtual: settings: %w", err)
	}

	values := maps.Clone(s.base)
	fromRows := make(map[string]bool)
	for _, row := range rows {
		value, err := s.decode(row)
		if err != nil {
			ignore(row.Key, err)
			continue
		}
		values[row.Key] = value
		fromRows[row.Key] = true
	}
	// A broken rule cannot tell which of its rows is wrong, so each of them goes
	// back to its default; the defaults satisfy every rule.
	for _, r := range rules {
		if err := r.check(values); err != nil {
			for _, key := range r.keys {
				if fromRows[key] {
					values[key] = s.base[key]
					ignore(key, err)
				}
			}
		}
	}
	s.values.Store(&values)
	return nil
}

// Set validates value for a declared key and writes its row, or deletes the row
// when value equals the default. A userID of 0 records no user, for writes made
// before the first user exists.
func (s *Settings) Set(ctx context.Context, db *sql.DB, userID int64, key string, value any) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	d, err := s.declaration(key)
	if err != nil {
		return fmt.Errorf("virtual: settings: %s: %w", key, err)
	}
	if err := d.validate(value); err != nil {
		return fmt.Errorf("virtual: settings: %s: %w", key, err)
	}
	next := maps.Clone(*s.values.Load())
	next[key] = value
	for _, r := range rules {
		if err := r.check(next); err != nil {
			return fmt.Errorf("virtual: settings: %w", err)
		}
	}
	literal, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("virtual: settings: %s: %w", key, err)
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
		return fmt.Errorf("virtual: settings: %s: %w", key, err)
	}
	s.values.Store(&next)
	return nil
}

func (s *Settings) declaration(key string) (declaration, error) {
	if d, ok := catalogue[key]; ok {
		return d, nil
	}
	if _, ok := s.base[key]; ok {
		return declaration{}, errors.New("comes from config.json")
	}
	return declaration{}, errors.New("not a declared setting")
}

func (s *Settings) decode(row store.Setting) (any, error) {
	d, err := s.declaration(row.Key)
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

func (s *Settings) get[T int | bool | string](key string) T {
	value, ok := (*s.values.Load())[key].(T)
	if !ok {
		slog.Warn("virtual: setting is missing or of another type", "key", key, "want", fmt.Sprintf("%T", value))
	}
	return value
}

func (s *Settings) getOr[T int | bool | string](key string, fallback T) T {
	if value, ok := (*s.values.Load())[key].(T); ok {
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
	slog.Warn("virtual: settings row ignored", "key", key, "reason", reason)
}
