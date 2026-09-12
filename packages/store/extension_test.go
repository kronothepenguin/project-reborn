package store

import (
	"context"
	"io/fs"
	"os"
	"path/filepath"
	"testing"
	"testing/fstest"
)

func fixtureFS(t *testing.T, names ...string) fs.FS {
	t.Helper()
	files := fstest.MapFS{}
	for _, name := range names {
		data, err := os.ReadFile(filepath.Join("testdata", "schema", name))
		if err != nil {
			t.Fatalf("read fixture %s: %v", name, err)
		}
		files[name] = &fstest.MapFile{Data: data}
	}
	return files
}

func TestExtensionPreservesExistingData(t *testing.T) {
	s := openTestStore(t)
	if err := applySchemas(s.db, fixtureFS(t, "alpha.schema.sql")); err != nil {
		t.Fatalf("apply alpha: %v", err)
	}

	insertWidget(t, s, 1, "existing", "written before extension", 1, 1_700_000_000)

	if err := applySchemas(s.db, fixtureFS(t, "alpha.schema.sql", "beta.schema.sql")); err != nil {
		t.Fatalf("apply alpha+beta: %v", err)
	}

	name, description, active, createdAt := scanWidget(t, s, 1)
	if name != "existing" || description != "written before extension" || active != 1 || createdAt != 1_700_000_000 {
		t.Fatalf("existing widget changed by extension: (%q, %q, %d, %d)", name, description, active, createdAt)
	}

	if _, err := s.db.ExecContext(context.Background(),
		`INSERT INTO gadgets (id, widget_id, label) VALUES (1, 1, 'extension')`); err != nil {
		t.Fatalf("gadgets table not usable after extension: %v", err)
	}
	if got := countRows(t, s, "gadgets"); got != 1 {
		t.Fatalf("gadget rows = %d, want 1", got)
	}
}

func TestUnknownTableUntouched(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")

	first, err := Open(path)
	if err != nil {
		t.Fatalf("first Open: %v", err)
	}
	if _, err := first.db.ExecContext(context.Background(),
		`CREATE TABLE undeclared (id INTEGER PRIMARY KEY, note TEXT NOT NULL)`); err != nil {
		t.Fatalf("create undeclared table: %v", err)
	}
	if _, err := first.db.ExecContext(context.Background(),
		`INSERT INTO undeclared (id, note) VALUES (1, 'keep me')`); err != nil {
		t.Fatalf("insert undeclared row: %v", err)
	}
	if err := first.Close(); err != nil {
		t.Fatalf("first Close: %v", err)
	}

	second, err := Open(path)
	if err != nil {
		t.Fatalf("second Open: %v", err)
	}
	defer second.Close()

	var note string
	if err := second.db.QueryRowContext(context.Background(),
		`SELECT note FROM undeclared WHERE id = 1`).Scan(&note); err != nil {
		t.Fatalf("undeclared table or row was lost on Open: %v", err)
	}
	if note != "keep me" {
		t.Fatalf("undeclared row = %q, want %q", note, "keep me")
	}
}

func TestAllDeclaredStructuresAvailableAfterOneOpen(t *testing.T) {
	s := openTestStore(t)
	applyFixtureSchemas(t, s)

	insertWidget(t, s, 5, "joined", "", 1, 1_700_000_002)
	if _, err := s.db.ExecContext(context.Background(),
		`INSERT INTO gadgets (id, widget_id, label) VALUES (5, 5, 'linked')`); err != nil {
		t.Fatalf("insert gadget: %v", err)
	}

	var label string
	err := s.db.QueryRowContext(context.Background(),
		`SELECT g.label FROM gadgets g JOIN widgets w ON w.id = g.widget_id WHERE w.name = ?`, "joined").Scan(&label)
	if err != nil {
		t.Fatalf("join declared structures: %v", err)
	}
	if label != "linked" {
		t.Fatalf("joined label = %q, want %q", label, "linked")
	}
}
