package config

import (
	"encoding/json"
	"os"
	"reflect"
	"strings"
	"testing"
)

// keyCase drives the five full-pipeline checks every declared key needs. The
// JSON documents are complete config.json contents.
type keyCase struct {
	key        string
	value      func(*Config) any
	def        any
	explicit   string
	want       any
	wrongType  string
	typeName   string
	outOfRange string
}

func loadWithFile(t *testing.T, content string) (*Config, error) {
	t.Helper()
	t.Chdir(t.TempDir())
	resetLoadState(t)
	writeConfig(t, content)
	return Load()
}

func hasKey(t *testing.T, data []byte, key string) bool {
	t.Helper()
	var node any
	if err := json.Unmarshal(data, &node); err != nil {
		t.Fatalf("decode %s: %v", configFilename, err)
	}
	for part := range strings.SplitSeq(key, ".") {
		object, ok := node.(map[string]any)
		if !ok {
			return false
		}
		if node, ok = object[part]; !ok {
			return false
		}
	}
	return true
}

func runKeyCases(t *testing.T, cases []keyCase) {
	t.Helper()
	for _, c := range cases {
		t.Run(c.key, func(t *testing.T) {
			t.Run("created with the default", func(t *testing.T) {
				t.Chdir(t.TempDir())
				resetLoadState(t)
				cfg, err := Load()
				if err != nil {
					t.Fatalf("Load() error = %v", err)
				}
				if got := c.value(cfg); !reflect.DeepEqual(got, c.def) {
					t.Errorf("%s = %v, want default %v", c.key, got, c.def)
				}
				data, err := os.ReadFile(configFilename)
				if err != nil {
					t.Fatalf("read created %s: %v", configFilename, err)
				}
				if !hasKey(t, data, c.key) {
					t.Errorf("created %s lacks %s:\n%s", configFilename, c.key, data)
				}
			})

			t.Run("missing key keeps the default", func(t *testing.T) {
				cfg, err := loadWithFile(t, "{}\n")
				if err != nil {
					t.Fatalf("Load() error = %v", err)
				}
				if got := c.value(cfg); !reflect.DeepEqual(got, c.def) {
					t.Errorf("%s = %v, want default %v", c.key, got, c.def)
				}
				data, err := os.ReadFile(configFilename)
				if err != nil {
					t.Fatalf("read %s: %v", configFilename, err)
				}
				if string(data) != "{}\n" {
					t.Errorf("%s was rewritten: %q", configFilename, data)
				}
			})

			t.Run("explicit value wins", func(t *testing.T) {
				cfg, err := loadWithFile(t, c.explicit)
				if err != nil {
					t.Fatalf("Load() error = %v", err)
				}
				if got := c.value(cfg); !reflect.DeepEqual(got, c.want) {
					t.Errorf("%s = %v, want %v", c.key, got, c.want)
				}
			})

			t.Run("wrong type fails", func(t *testing.T) {
				_, err := loadWithFile(t, c.wrongType)
				if err == nil {
					t.Fatal("Load() error = nil, want a type error")
				}
				for _, want := range []string{configFilename, c.key, "expected " + c.typeName} {
					if !strings.Contains(err.Error(), want) {
						t.Errorf("Load() error = %q, want it to contain %q", err, want)
					}
				}
			})

			if c.outOfRange == "" {
				return
			}
			t.Run("out of range fails", func(t *testing.T) {
				_, err := loadWithFile(t, c.outOfRange)
				if err == nil {
					t.Fatal("Load() error = nil, want a range error")
				}
				for _, want := range []string{configFilename, c.key + ": must"} {
					if !strings.Contains(err.Error(), want) {
						t.Errorf("Load() error = %q, want it to contain %q", err, want)
					}
				}
			})
		})
	}
}
