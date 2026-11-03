package config

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"
)

// Key is one key path of config.json, such as cms.port, and its JSON value.
type Key struct {
	Path  string
	Value json.RawMessage
}

var ErrNotNew = errors.New("only the keys config.json lacks can be set")

// Differences compares config.json with the keys the programs read: missing
// holds the keys the file lacks, with their defaults, and unused the keys
// nothing reads, with the file's values. A program reading the file uses the
// default of a missing key and skips an unused one, so neither stops it.
func Differences() (missing, unused []Key, err error) {
	file, declared, err := keyPaths()
	if err != nil {
		return nil, nil, err
	}
	for _, path := range sortedPaths(declared) {
		if _, ok := file[path]; !ok {
			missing = append(missing, Key{Path: path, Value: declared[path]})
		}
	}
	for _, path := range sortedPaths(file) {
		if _, ok := declared[path]; !ok {
			unused = append(unused, Key{Path: path, Value: file[path]})
		}
	}
	return missing, unused, nil
}

// Rewrite writes config.json again: its keys with the values they have, the
// keys it lacks with values (their defaults when values has none), and none of
// the keys nothing reads. Only keys the file lacks may be given values, the
// result must pass Validate, and a temporary file renamed over config.json
// keeps a crash from leaving half a file. With nothing missing or unused, the
// file stays as it is.
func Rewrite(values map[string]json.RawMessage) error {
	file, declared, err := keyPaths()
	if err != nil {
		return err
	}
	merged := make(map[string]json.RawMessage, len(declared))
	changed := false
	for path, value := range declared {
		if current, ok := file[path]; ok {
			merged[path] = current
			continue
		}
		changed = true
		merged[path] = value
		if given, ok := values[path]; ok {
			merged[path] = given
		}
	}
	for path := range values {
		if _, ok := file[path]; ok || declared[path] == nil {
			return fmt.Errorf("config: %s: %s: %w", Filename, path, ErrNotNew)
		}
	}
	for path := range file {
		if _, ok := declared[path]; !ok {
			changed = true
		}
	}
	if !changed {
		return nil
	}

	nested, err := json.Marshal(unflatten(merged))
	if err != nil {
		return fmt.Errorf("config: %s: %w", Filename, err)
	}
	cfg := defaults()
	if err := json.Unmarshal(nested, cfg); err != nil {
		return fmt.Errorf("config: %s: %w", Filename, jsonError(err))
	}
	if err := cfg.Validate(); err != nil {
		return fmt.Errorf("config: %s: %w", Filename, err)
	}
	data, err := encode(cfg)
	if err != nil {
		return fmt.Errorf("config: %s: %w", Filename, err)
	}
	return replace(data)
}

func replace(data []byte) error {
	tmp, err := os.CreateTemp(filepath.Dir(Filename), Filename+".*")
	if err != nil {
		return fmt.Errorf("config: %s: %w", Filename, err)
	}
	defer os.Remove(tmp.Name())
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return fmt.Errorf("config: %s: %w", Filename, err)
	}
	if err := tmp.Chmod(0o644); err != nil {
		tmp.Close()
		return fmt.Errorf("config: %s: %w", Filename, err)
	}
	if err := tmp.Close(); err != nil {
		return fmt.Errorf("config: %s: %w", Filename, err)
	}
	if err := os.Rename(tmp.Name(), Filename); err != nil {
		return fmt.Errorf("config: %s: %w", Filename, err)
	}
	return nil
}

// keyPaths flattens config.json and the declared defaults into key paths. An
// object is a section, and anything else, a list included, is one value.
func keyPaths() (file, declared map[string]json.RawMessage, err error) {
	data, err := os.ReadFile(Filename)
	if err != nil {
		return nil, nil, fmt.Errorf("config: %s: %w", Filename, err)
	}
	file = make(map[string]json.RawMessage)
	if err := flatten("", data, file); err != nil {
		return nil, nil, fmt.Errorf("config: %s: %w", Filename, jsonError(err))
	}
	defaultData, err := json.Marshal(defaults())
	if err != nil {
		return nil, nil, fmt.Errorf("config: %s: %w", Filename, err)
	}
	declared = make(map[string]json.RawMessage)
	if err := flatten("", defaultData, declared); err != nil {
		return nil, nil, fmt.Errorf("config: %s: %w", Filename, err)
	}
	return file, declared, nil
}

func flatten(prefix string, data []byte, into map[string]json.RawMessage) error {
	var section map[string]json.RawMessage
	if trimmed := bytes.TrimSpace(data); len(trimmed) == 0 || trimmed[0] != '{' {
		into[prefix] = json.RawMessage(trimmed)
		return nil
	}
	if err := json.Unmarshal(data, &section); err != nil {
		return err
	}
	for name, value := range section {
		path := name
		if prefix != "" {
			path = prefix + "." + name
		}
		if err := flatten(path, value, into); err != nil {
			return err
		}
	}
	return nil
}

func unflatten(paths map[string]json.RawMessage) map[string]any {
	root := make(map[string]any)
	for path, value := range paths {
		parts := strings.Split(path, ".")
		section := root
		for _, part := range parts[:len(parts)-1] {
			next, ok := section[part].(map[string]any)
			if !ok {
				next = make(map[string]any)
				section[part] = next
			}
			section = next
		}
		section[parts[len(parts)-1]] = value
	}
	return root
}

func sortedPaths(paths map[string]json.RawMessage) []string {
	sorted := make([]string, 0, len(paths))
	for path := range paths {
		sorted = append(sorted, path)
	}
	slices.Sort(sorted)
	return sorted
}
