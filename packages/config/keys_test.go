package config

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

func useConfigFile(t *testing.T, content string) {
	t.Helper()
	t.Chdir(t.TempDir())
	if err := os.WriteFile(Filename, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func paths(keys []Key) []string {
	var out []string
	for _, key := range keys {
		out = append(out, key.Path+"="+string(key.Value))
	}
	return out
}

const olderConfig = `{
  "store": {"path": "custom.db", "legacy": true},
  "cms": {"port": 8080},
  "housekeeping": {"host": "localhost", "port": 18465},
  "theme": "dark"
}`

func TestDifferencesFindsMissingAndUnusedKeys(t *testing.T) {
	useConfigFile(t, olderConfig)
	missing, unused, err := Differences()
	if err != nil {
		t.Fatalf("Differences: %v", err)
	}
	if got, want := paths(missing), []string{`cms.host="localhost"`, `proxy.enabled=false`, `proxy.trusted=["127.0.0.1","::1"]`,
		`reborn.host="localhost"`, `reborn.port=16416`,
		`server.info.host="localhost"`, `server.info.port=30000`, `server.mus.host="localhost"`, `server.mus.port=30001`}; !slices.Equal(got, want) {
		t.Errorf("missing = %v, want %v", got, want)
	}
	if got, want := paths(unused), []string{`store.legacy=true`, `theme="dark"`}; !slices.Equal(got, want) {
		t.Errorf("unused = %v, want %v", got, want)
	}
}

func TestDifferencesFindsNothingInACurrentFile(t *testing.T) {
	useConfigFile(t, `{"store":{"path":"habbo.db"},"cms":{"host":"localhost","port":17387},`+
		`"housekeeping":{"host":"localhost","port":18465},"proxy":{"enabled":false,"trusted":["127.0.0.1"]},`+
		`"server":{"info":{"host":"localhost","port":30000},"mus":{"host":"localhost","port":30001}},`+
		`"reborn":{"host":"localhost","port":16416}}`)
	if missing, unused, err := Differences(); err != nil || len(missing) != 0 || len(unused) != 0 {
		t.Errorf("Differences = %v, %v, %v, want none", paths(missing), paths(unused), err)
	}
	before, _ := os.ReadFile(Filename)
	if err := Rewrite(nil); err != nil {
		t.Fatalf("Rewrite: %v", err)
	}
	if after, _ := os.ReadFile(Filename); string(after) != string(before) {
		t.Error("Rewrite changed a file with nothing to change")
	}
}

func TestRewriteAddsTheNewKeysAndDropsTheUnusedOnes(t *testing.T) {
	useConfigFile(t, olderConfig)
	err := Rewrite(map[string]json.RawMessage{"cms.host": json.RawMessage(`"0.0.0.0"`), "proxy.enabled": json.RawMessage(`true`)})
	if err != nil {
		t.Fatalf("Rewrite: %v", err)
	}

	data, err := os.ReadFile(Filename)
	if err != nil {
		t.Fatal(err)
	}
	cfg := defaults()
	if err := json.Unmarshal(data, cfg); err != nil {
		t.Fatal(err)
	}
	if cfg.Store.Path != "custom.db" || cfg.CMS.Port != 8080 || cfg.CMS.Host != "0.0.0.0" || !cfg.Proxy.Enabled || !slices.Equal(cfg.Proxy.Trusted, []string{"127.0.0.1", "::1"}) {
		t.Errorf("config.json = %s", data)
	}
	if missing, unused, err := Differences(); err != nil || len(missing) != 0 || len(unused) != 0 {
		t.Errorf("after Rewrite: missing %v, unused %v, %v", paths(missing), paths(unused), err)
	}
	if info, err := os.Stat(Filename); err != nil || info.Mode().Perm() != 0o644 {
		t.Errorf("config.json mode = %v, %v, want 644", info.Mode().Perm(), err)
	}
	if leftovers, _ := filepath.Glob(Filename + ".*"); len(leftovers) != 0 {
		t.Errorf("temporary files left: %v", leftovers)
	}
}

func TestRewriteRefusesBadValuesAndKeysThatAreThere(t *testing.T) {
	for _, c := range []struct {
		name   string
		values map[string]json.RawMessage
		want   error
	}{
		{"an invalid host", map[string]json.RawMessage{"cms.host": json.RawMessage(`""`)}, nil},
		{"a wrong type", map[string]json.RawMessage{"proxy.enabled": json.RawMessage(`"yes"`)}, nil},
		{"a key that is there", map[string]json.RawMessage{"cms.port": json.RawMessage(`9090`)}, ErrNotNew},
		{"a key nothing reads", map[string]json.RawMessage{"theme": json.RawMessage(`"light"`)}, ErrNotNew},
	} {
		t.Run(c.name, func(t *testing.T) {
			useConfigFile(t, olderConfig)
			err := Rewrite(c.values)
			if err == nil || c.want != nil && !errors.Is(err, c.want) {
				t.Errorf("Rewrite = %v, want an error", err)
			}
			if data, _ := os.ReadFile(Filename); string(data) != olderConfig {
				t.Errorf("config.json changed after a refusal: %s", data)
			}
		})
	}
}

func TestDifferencesAndRewriteReachKeysThreeLevelsDeep(t *testing.T) {
	useConfigFile(t, `{"server": {"info": {"port": 31000}, "lobby": {"port": 1}}}`)
	missing, unused, err := Differences()
	if err != nil {
		t.Fatalf("Differences: %v", err)
	}
	var server []string
	for _, path := range paths(missing) {
		if strings.HasPrefix(path, "server.") {
			server = append(server, path)
		}
	}
	if want := []string{`server.info.host="localhost"`, `server.mus.host="localhost"`, `server.mus.port=30001`}; !slices.Equal(server, want) {
		t.Errorf("missing server keys = %v, want %v", server, want)
	}
	if got, want := paths(unused), []string{`server.lobby.port=1`}; !slices.Equal(got, want) {
		t.Errorf("unused = %v, want %v", got, want)
	}

	before, _ := os.ReadFile(Filename)
	if err := Rewrite(map[string]json.RawMessage{"server.info.port": json.RawMessage(`32000`)}); !errors.Is(err, ErrNotNew) {
		t.Errorf("Rewrite of server.info.port, which the file has = %v, want ErrNotNew", err)
	}
	err = Rewrite(map[string]json.RawMessage{"server.mus.port": json.RawMessage(`31000`)})
	if err == nil || !strings.Contains(err.Error(), "server.mus.port: must differ from info.port") {
		t.Errorf("Rewrite of server.mus.port on the port of info = %v, want it refused", err)
	}
	if after, _ := os.ReadFile(Filename); string(after) != string(before) {
		t.Errorf("config.json changed after a refusal: %s", after)
	}
	if err := Rewrite(map[string]json.RawMessage{"server.mus.port": json.RawMessage(`31001`)}); err != nil {
		t.Fatalf("Rewrite: %v", err)
	}
	data, err := os.ReadFile(Filename)
	if err != nil {
		t.Fatal(err)
	}
	cfg := defaults()
	if err := json.Unmarshal(data, cfg); err != nil {
		t.Fatal(err)
	}
	if info, mus := cfg.Server.Info, cfg.Server.MUS; info.Host != "localhost" || info.Port != 31000 || mus.Host != "localhost" || mus.Port != 31001 {
		t.Errorf("config.json = %s", data)
	}
	if missing, unused, err := Differences(); err != nil || len(missing) != 0 || len(unused) != 0 {
		t.Errorf("after Rewrite: missing %v, unused %v, %v", paths(missing), paths(unused), err)
	}
}
