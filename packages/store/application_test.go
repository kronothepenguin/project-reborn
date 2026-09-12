package store

import (
	"context"
	"os"
	"path/filepath"
	"testing"
)

func applyFixtureSchemas(t *testing.T, s *Store) {
	t.Helper()
	if err := applySchemas(s.db, os.DirFS("testdata/schema")); err != nil {
		t.Fatalf("apply fixture schemas: %v", err)
	}
}

func insertWidget(t *testing.T, s *Store, id int64, name, description string, active int64, createdAt int64) {
	t.Helper()
	_, err := s.db.ExecContext(context.Background(),
		`INSERT INTO widgets (id, name, description, is_active, created_at) VALUES (?, ?, ?, ?, ?)`,
		id, name, description, active, createdAt)
	if err != nil {
		t.Fatalf("insert widget: %v", err)
	}
}

func scanWidget(t *testing.T, s *Store, id int64) (name, description string, active, createdAt int64) {
	t.Helper()
	err := s.db.QueryRowContext(context.Background(),
		`SELECT name, description, is_active, created_at FROM widgets WHERE id = ?`, id).
		Scan(&name, &description, &active, &createdAt)
	if err != nil {
		t.Fatalf("read widget: %v", err)
	}
	return name, description, active, createdAt
}

func countRows(t *testing.T, s *Store, table string) int64 {
	t.Helper()
	var count int64
	if err := s.db.QueryRowContext(context.Background(), "SELECT COUNT(*) FROM "+table).Scan(&count); err != nil {
		t.Fatalf("count %s: %v", table, err)
	}
	return count
}

func TestApplicationRoundTrip(t *testing.T) {
	s := openTestStore(t)
	applyFixtureSchemas(t, s)

	insertWidget(t, s, 1, "first", "a widget", 1, 1_700_000_000)

	name, description, active, createdAt := scanWidget(t, s, 1)
	if name != "first" || description != "a widget" || active != 1 || createdAt != 1_700_000_000 {
		t.Fatalf("read values = (%q, %q, %d, %d), want (first, a widget, 1, 1700000000)", name, description, active, createdAt)
	}

	if _, err := s.db.ExecContext(context.Background(),
		`UPDATE widgets SET name = ?, is_active = ? WHERE id = ?`, "renamed", 0, 1); err != nil {
		t.Fatalf("update widget: %v", err)
	}
	name, _, active, _ = scanWidget(t, s, 1)
	if name != "renamed" || active != 0 {
		t.Fatalf("after update = (%q, %d), want (renamed, 0)", name, active)
	}

	if _, err := s.db.ExecContext(context.Background(), `DELETE FROM widgets WHERE id = ?`, 1); err != nil {
		t.Fatalf("delete widget: %v", err)
	}
	if got := countRows(t, s, "widgets"); got != 0 {
		t.Fatalf("rows after delete = %d, want 0", got)
	}
}

func TestValueRoundTrip(t *testing.T) {
	s := openTestStore(t)
	applyFixtureSchemas(t, s)

	description := "café ☕ – naïve Ünicode"
	insertWidget(t, s, -7, "unicode", description, 0, 1234567890)

	name, gotDescription, active, createdAt := scanWidget(t, s, -7)
	if name != "unicode" {
		t.Errorf("name = %q, want %q", name, "unicode")
	}
	if gotDescription != description {
		t.Errorf("description = %q, want %q", gotDescription, description)
	}
	if active != 0 {
		t.Errorf("is_active = %d, want 0", active)
	}
	if createdAt != 1234567890 {
		t.Errorf("created_at = %d, want 1234567890", createdAt)
	}
}

func TestForeignKeyViolationIsAtomic(t *testing.T) {
	s := openTestStore(t)
	applyFixtureSchemas(t, s)

	insertWidget(t, s, 1, "parent", "", 1, 1)

	_, err := s.db.ExecContext(context.Background(),
		`INSERT INTO gadgets (id, widget_id, label) VALUES (1, 999, 'orphan')`)
	if err == nil {
		t.Fatal("expected foreign-key violation")
	}
	if !IsForeignKey(err) {
		t.Fatalf("IsForeignKey(%v) = false, want true", err)
	}
	if got := countRows(t, s, "gadgets"); got != 0 {
		t.Fatalf("gadget rows after failed insert = %d, want 0", got)
	}

	if _, err := s.db.ExecContext(context.Background(),
		`INSERT INTO gadgets (id, widget_id, label) VALUES (2, 1, 'attached')`); err != nil {
		t.Fatalf("valid gadget insert: %v", err)
	}
	if got := countRows(t, s, "gadgets"); got != 1 {
		t.Fatalf("gadget rows after valid insert = %d, want 1", got)
	}
}

func TestDataPersistsAcrossOpen(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")

	first, err := Open(path)
	if err != nil {
		t.Fatalf("first Open: %v", err)
	}
	applyFixtureSchemas(t, first)
	insertWidget(t, first, 42, "persisted", "survives reopen", 1, 1_700_000_001)
	if err := first.Close(); err != nil {
		t.Fatalf("first Close: %v", err)
	}

	second, err := Open(path)
	if err != nil {
		t.Fatalf("second Open: %v", err)
	}
	defer second.Close()

	name, description, active, createdAt := scanWidget(t, second, 42)
	if name != "persisted" || description != "survives reopen" || active != 1 || createdAt != 1_700_000_001 {
		t.Fatalf("values after reopen = (%q, %q, %d, %d), want persisted values",
			name, description, active, createdAt)
	}
}

func TestUniqueViolationIsConflictAndAtomic(t *testing.T) {
	s := openTestStore(t)
	applyFixtureSchemas(t, s)

	insertWidget(t, s, 1, "unique-name", "", 1, 1)

	_, err := s.db.ExecContext(context.Background(),
		`INSERT INTO widgets (id, name, description, is_active, created_at) VALUES (2, 'unique-name', '', 1, 1)`)
	if err == nil {
		t.Fatal("expected unique violation")
	}
	if !IsConflict(err) {
		t.Fatalf("IsConflict(%v) = false, want true", err)
	}
	if got := countRows(t, s, "widgets"); got != 1 {
		t.Fatalf("widget rows after conflict = %d, want 1", got)
	}
}

func TestMissingRowIsNotFound(t *testing.T) {
	s := openTestStore(t)
	applyFixtureSchemas(t, s)

	var name string
	err := s.db.QueryRowContext(context.Background(), `SELECT name FROM widgets WHERE id = ?`, 999).Scan(&name)
	if err == nil {
		t.Fatal("expected missing row")
	}
	if !IsNotFound(err) {
		t.Fatalf("IsNotFound(%v) = false, want true", err)
	}
	if IsConflict(err) || IsForeignKey(err) || IsBusy(err) {
		t.Fatalf("missing row classified into another class: %v", err)
	}
}

func TestPingGeneratedOperation(t *testing.T) {
	s := openTestStore(t)

	ok, err := s.Ping(context.Background())
	if err != nil {
		t.Fatalf("Ping: %v", err)
	}
	if ok != 1 {
		t.Fatalf("Ping = %d, want 1", ok)
	}
}
