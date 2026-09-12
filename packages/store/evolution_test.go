package store

import (
	"context"
	"path/filepath"
	"testing"
)

func schemaSnapshot(t *testing.T, s *Store) []string {
	t.Helper()
	rows, err := s.db.QueryContext(context.Background(),
		`SELECT type || ':' || name || ':' || COALESCE(sql, '') FROM sqlite_master ORDER BY name`)
	if err != nil {
		t.Fatalf("read sqlite_master: %v", err)
	}
	defer rows.Close()

	var snapshot []string
	for rows.Next() {
		var entry string
		if err := rows.Scan(&entry); err != nil {
			t.Fatalf("scan sqlite_master: %v", err)
		}
		snapshot = append(snapshot, entry)
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("iterate sqlite_master: %v", err)
	}
	return snapshot
}

func TestReopenIsNoOp(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")

	first, err := Open(path)
	if err != nil {
		t.Fatalf("first Open: %v", err)
	}
	applyFixtureSchemas(t, first)
	insertWidget(t, first, 1, "stable", "", 1, 1_700_000_000)
	before := schemaSnapshot(t, first)
	if err := first.Close(); err != nil {
		t.Fatalf("first Close: %v", err)
	}

	second, err := Open(path)
	if err != nil {
		t.Fatalf("second Open: %v", err)
	}
	defer second.Close()

	name, _, _, _ := scanWidget(t, second, 1)
	if name != "stable" {
		t.Fatalf("widget after reopen = %q, want %q", name, "stable")
	}

	after := schemaSnapshot(t, second)
	if len(before) != len(after) {
		t.Fatalf("structure entries after reopen = %d, want %d (%v vs %v)", len(after), len(before), after, before)
	}
	for i := range before {
		if before[i] != after[i] {
			t.Fatalf("structure changed on reopen:\nbefore: %v\nafter:  %v", before, after)
		}
	}
}

func TestAdditiveChangeRetainsData(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")

	first, err := Open(path)
	if err != nil {
		t.Fatalf("first Open: %v", err)
	}
	if err := applySchemas(first.db, fixtureFS(t, "alpha.schema.sql")); err != nil {
		t.Fatalf("apply alpha: %v", err)
	}
	insertWidget(t, first, 1, "before", "kept", 1, 1_700_000_003)
	if err := first.Close(); err != nil {
		t.Fatalf("first Close: %v", err)
	}

	second, err := Open(path)
	if err != nil {
		t.Fatalf("second Open: %v", err)
	}
	if err := applySchemas(second.db, fixtureFS(t, "alpha.schema.sql", "beta.schema.sql")); err != nil {
		t.Fatalf("apply extended schemas: %v", err)
	}
	name, description, active, createdAt := scanWidget(t, second, 1)
	if name != "before" || description != "kept" || active != 1 || createdAt != 1_700_000_003 {
		t.Fatalf("data changed by additive schema: (%q, %q, %d, %d)", name, description, active, createdAt)
	}
	if _, err := second.db.ExecContext(context.Background(),
		`INSERT INTO gadgets (id, widget_id, label) VALUES (1, 1, 'new structure')`); err != nil {
		t.Fatalf("new structure not present after additive change: %v", err)
	}
	if err := second.Close(); err != nil {
		t.Fatalf("second Close: %v", err)
	}
}

func TestOlderVersionCoexistsWithNewerStructure(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")

	newer, err := Open(path)
	if err != nil {
		t.Fatalf("newer Open: %v", err)
	}
	if err := applySchemas(newer.db, fixtureFS(t, "alpha.schema.sql", "beta.schema.sql")); err != nil {
		t.Fatalf("apply superset schemas: %v", err)
	}
	insertWidget(t, newer, 1, "parent", "", 1, 1_700_000_004)
	if _, err := newer.db.ExecContext(context.Background(),
		`INSERT INTO gadgets (id, widget_id, label) VALUES (1, 1, 'newer structure')`); err != nil {
		t.Fatalf("insert gadget: %v", err)
	}
	if err := newer.Close(); err != nil {
		t.Fatalf("newer Close: %v", err)
	}

	older, err := Open(path)
	if err != nil {
		t.Fatalf("older Open: %v", err)
	}
	if err := applySchemas(older.db, fixtureFS(t, "alpha.schema.sql")); err != nil {
		t.Fatalf("older apply subset schemas: %v", err)
	}
	defer older.Close()

	var label string
	if err := older.db.QueryRowContext(context.Background(),
		`SELECT label FROM gadgets WHERE id = 1`).Scan(&label); err != nil {
		t.Fatalf("newer structure was disturbed by older version: %v", err)
	}
	if label != "newer structure" {
		t.Fatalf("gadget label = %q, want %q", label, "newer structure")
	}
}
