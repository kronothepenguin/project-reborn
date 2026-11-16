package config

import (
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/config/reborn"
)

// Inside reborn, the config step saves the new address into the reborn section
// of the existing config.json, and the other sections keep their values.
func TestSaveRebornWritesOneSection(t *testing.T) {
	useConfigFile(t, `{"store": {"path": "custom.db"}, "cms": {"port": 8080}}`)

	if err := SaveReborn(reborn.Reborn{Host: "0.0.0.0", Port: 8000}); err != nil {
		t.Fatalf("SaveReborn: %v", err)
	}

	data, err := os.ReadFile(Filename)
	if err != nil {
		t.Fatal(err)
	}
	var written Config
	if err := json.Unmarshal(data, &written); err != nil {
		t.Fatal(err)
	}
	if written.Reborn != (reborn.Reborn{Host: "0.0.0.0", Port: 8000}) {
		t.Errorf("reborn = %+v, want the saved address", written.Reborn)
	}
	if written.Store.Path != "custom.db" || written.CMS.Port != 8080 || written.CMS.Host != "localhost" {
		t.Errorf("store %+v, cms %+v, want the file's values and the defaults of the keys it lacked", written.Store, written.CMS)
	}
}

// A value Validate refuses leaves config.json as it was.
func TestSaveRebornRefusesABadAddress(t *testing.T) {
	const content = `{"reborn": {"host": "localhost", "port": 16416}}`
	useConfigFile(t, content)

	if err := SaveReborn(reborn.Reborn{Host: "localhost", Port: 70000}); err == nil {
		t.Error("SaveReborn took port 70000")
	}
	if data, _ := os.ReadFile(Filename); string(data) != content {
		t.Errorf("config.json became %s", data)
	}
}

// SaveReborn writes into an existing config.json only.
func TestSaveRebornNeedsConfigJSON(t *testing.T) {
	t.Chdir(t.TempDir())
	if err := SaveReborn(reborn.Reborn{Host: "localhost", Port: 16416}); !errors.Is(err, fs.ErrNotExist) {
		t.Errorf("SaveReborn = %v, want fs.ErrNotExist", err)
	}
	if _, err := os.Stat(Filename); err == nil {
		t.Error("SaveReborn created config.json")
	}
}
