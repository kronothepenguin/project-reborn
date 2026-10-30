package store

import (
	"os"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/config"
)

// config.Get reads config.json once per process, so this is the only test of
// the package that may call it.
func TestFromConfigOpensTheConfiguredDatabase(t *testing.T) {
	t.Chdir(t.TempDir())
	if err := os.WriteFile(config.Filename, []byte(`{"store": {"path": "configured.db"}}`+"\n"), 0o644); err != nil {
		t.Fatalf("write %s: %v", config.Filename, err)
	}

	db := FromConfig()
	defer db.Close()
	if err := db.PingContext(t.Context()); err != nil {
		t.Errorf("ping: %v", err)
	}
	if _, err := os.Stat("configured.db"); err != nil {
		t.Errorf("the configured database file: %v", err)
	}
}
