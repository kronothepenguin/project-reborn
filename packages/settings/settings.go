// Package settings holds the list of the hotel's settings, with their defaults,
// checks and the rules that tie two together, and reads and writes them in the
// store on each use. A setting has a row only while its value differs from its
// default. It keeps no copy of the values: every function receives the queries,
// which are the transaction's inside a transaction.
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
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Setting is one declared setting as a form shows it. Value and Default are an
// int, a bool or a string. Value is nil for a secret, which only String reads.
type Setting struct {
	Key     string
	Value   any
	Default any
	Secret  bool
}

// configKeys holds the key paths of config.json (cms.port), which are read from
// config and never stored as settings.
var configKeys = keyPaths("", reflect.TypeFor[config.Config]())

// reported holds the reason last logged for each key, so that a bad row read on
// every request is logged once, and again only when its reason changes.
var reported sync.Map

// String returns the setting's value: its row's, or its default when it has no
// row or a bad one. A key that is not a declared string is logged and returns "".
func String(ctx context.Context, q *store.Queries, key string) string {
	return read[string](ctx, q, key)
}

// Int is String for an int setting.
func Int(ctx context.Context, q *store.Queries, key string) int {
	return read[int](ctx, q, key)
}

// Bool is String for a bool setting.
func Bool(ctx context.Context, q *store.Queries, key string) bool {
	return read[bool](ctx, q, key)
}

// Set checks value for a declared key, with the rules that tie it to another
// setting's stored value, then writes its row, or deletes the row when value
// equals the default. A userID of 0 records no user, for writes made before the
// first user exists. It writes even an unchanged value, so updated_at records
// the last call.
func Set(ctx context.Context, q *store.Queries, userID int64, key string, value any) error {
	d, err := lookup(key)
	if err != nil {
		return fmt.Errorf("settings: %s: %w", key, err)
	}
	if err := d.validate(value); err != nil {
		return fmt.Errorf("settings: %s: %w", key, err)
	}
	if err := checkRules(ctx, q, map[string]any{key: value}); err != nil {
		return err
	}
	literal, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("settings: %s: %w", key, err)
	}

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
	return nil
}

// Validate reports why Set would refuse candidates taken together, and writes
// nothing, so that a form can refuse all of its values before it writes one. A
// rule that ties a candidate to a setting outside candidates reads that
// setting's stored value.
func Validate(ctx context.Context, q *store.Queries, candidates map[string]any) error {
	for _, key := range slices.Sorted(maps.Keys(candidates)) {
		d, err := lookup(key)
		if err != nil {
			return fmt.Errorf("settings: %s: %w", key, err)
		}
		if err := d.validate(candidates[key]); err != nil {
			return fmt.Errorf("settings: %s: %w", key, err)
		}
	}
	return checkRules(ctx, q, candidates)
}

// Declared lists every declared setting with its current value and its default,
// sorted by key, from one query. A bad row gives the default and is logged.
func Declared(ctx context.Context, q *store.Queries) ([]Setting, error) {
	rows, err := q.ListSettings(ctx)
	if err != nil {
		return nil, fmt.Errorf("settings: %w", err)
	}
	literals := make(map[string]string, len(rows))
	for _, row := range rows {
		literals[row.Key] = row.Value
	}

	declared := make([]Setting, 0, len(catalogue))
	for _, key := range slices.Sorted(maps.Keys(catalogue)) {
		d := catalogue[key]
		setting := Setting{Key: key, Value: d.def, Default: d.def, Secret: d.secret}
		if literal, ok := literals[key]; ok {
			setting.Value = decoded(key, d, literal)
		}
		if setting.Secret {
			setting.Value = nil
		}
		declared = append(declared, setting)
	}
	return declared, nil
}

func read[T int | bool | string](ctx context.Context, q *store.Queries, key string) T {
	var zero T
	d, err := lookup(key)
	if err != nil {
		report("settings: read refused", key, err)
		return zero
	}
	def, ok := d.def.(T)
	if !ok {
		report("settings: read refused", key, fmt.Errorf("is a %T, read as %T", d.def, zero))
		return zero
	}
	value, err := stored(ctx, q, key, d)
	if err != nil {
		slog.Error("settings: read failed", "key", key, "err", err)
		return def
	}
	return value.(T)
}

// stored returns the value of key's row, or its default when it has no row or
// a bad one. The error is the query's.
func stored(ctx context.Context, q *store.Queries, key string, d declaration) (any, error) {
	row, err := q.GetSetting(ctx, key)
	if errors.Is(err, sql.ErrNoRows) {
		reported.Delete(key)
		return d.def, nil
	}
	if err != nil {
		return nil, err
	}
	return decoded(key, d, row.Value), nil
}

// decoded turns a row's literal into its value, or into the default when the
// literal is not a valid value of the setting, which it logs.
func decoded(key string, d declaration, literal string) any {
	value, err := d.decode(literal)
	if err == nil {
		err = d.validate(value)
	}
	if err != nil {
		report("settings: row ignored", key, err)
		return d.def
	}
	reported.Delete(key)
	return value
}

// checkRules checks each rule that reads a key of candidates, with the stored
// values of its other keys.
func checkRules(ctx context.Context, q *store.Queries, candidates map[string]any) error {
	for _, r := range rules {
		if !slices.ContainsFunc(r.keys, func(key string) bool { _, ok := candidates[key]; return ok }) {
			continue
		}
		values := make(map[string]any, len(r.keys))
		for _, key := range r.keys {
			if value, ok := candidates[key]; ok {
				values[key] = value
				continue
			}
			value, err := stored(ctx, q, key, catalogue[key])
			if err != nil {
				return fmt.Errorf("settings: %s: %w", key, err)
			}
			values[key] = value
		}
		if err := r.check(values); err != nil {
			return fmt.Errorf("settings: %w", err)
		}
	}
	return nil
}

func lookup(key string) (declaration, error) {
	if d, ok := catalogue[key]; ok {
		return d, nil
	}
	if configKeys[key] {
		return declaration{}, errors.New("comes from config.json")
	}
	return declaration{}, errors.New("not a declared setting")
}

// report logs msg for key once, until its reason changes. It never logs a row's
// value: rows can hold secrets such as passwords.
func report(msg, key string, reason error) {
	if previous, loaded := reported.Swap(key, reason.Error()); !loaded || previous != reason.Error() {
		slog.Warn(msg, "key", key, "reason", reason)
	}
}

// keyPaths lists the key paths of t's JSON tags (cms.port).
func keyPaths(prefix string, t reflect.Type) map[string]bool {
	paths := make(map[string]bool)
	for field := range t.Fields() {
		if !field.IsExported() {
			continue
		}
		name, _, _ := strings.Cut(field.Tag.Get("json"), ",")
		if field.Type.Kind() == reflect.Struct {
			maps.Copy(paths, keyPaths(prefix+name+".", field.Type))
			continue
		}
		paths[prefix+name] = true
	}
	return paths
}
