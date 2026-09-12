package store

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func openTestStore(t *testing.T) *Store {
	t.Helper()
	s, err := Open(filepath.Join(t.TempDir(), "store.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() {
		if err := s.Close(); err != nil {
			t.Errorf("Close: %v", err)
		}
	})
	return s
}

func TestOpenCreatesFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "app.db")

	s, err := Open(path)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer s.Close()

	if _, err := os.Stat(path); err != nil {
		t.Fatalf("database file was not created: %v", err)
	}
}

func TestOpenAppliesPragmas(t *testing.T) {
	s := openTestStore(t)
	ctx := context.Background()

	var foreignKeys int
	if err := s.db.QueryRowContext(ctx, "PRAGMA foreign_keys").Scan(&foreignKeys); err != nil {
		t.Fatalf("read foreign_keys pragma: %v", err)
	}
	if foreignKeys != 1 {
		t.Errorf("foreign_keys = %d, want 1", foreignKeys)
	}

	var journalMode string
	if err := s.db.QueryRowContext(ctx, "PRAGMA journal_mode").Scan(&journalMode); err != nil {
		t.Fatalf("read journal_mode pragma: %v", err)
	}
	if journalMode != "wal" {
		t.Errorf("journal_mode = %q, want %q", journalMode, "wal")
	}

	if _, err := s.db.ExecContext(ctx, "CREATE TABLE parent (id INTEGER PRIMARY KEY)"); err != nil {
		t.Fatalf("create parent: %v", err)
	}
	if _, err := s.db.ExecContext(ctx, "CREATE TABLE child (id INTEGER PRIMARY KEY, parent_id INTEGER NOT NULL REFERENCES parent(id))"); err != nil {
		t.Fatalf("create child: %v", err)
	}
	_, err := s.db.ExecContext(ctx, "INSERT INTO child (id, parent_id) VALUES (1, 999)")
	if err == nil {
		t.Fatal("expected foreign-key violation")
	}
	if !IsForeignKey(err) {
		t.Fatalf("IsForeignKey(%v) = false, want true", err)
	}
}

func TestCloseIdempotent(t *testing.T) {
	s, err := Open(filepath.Join(t.TempDir(), "store.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}

	if err := s.Close(); err != nil {
		t.Fatalf("first Close: %v", err)
	}
	if err := s.Close(); err != nil {
		t.Fatalf("second Close: %v", err)
	}
}

func TestOperationsAfterCloseFailClearly(t *testing.T) {
	s, err := Open(filepath.Join(t.TempDir(), "store.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	if err := s.Close(); err != nil {
		t.Fatalf("Close: %v", err)
	}

	_, err = s.Ping(context.Background())
	if err == nil {
		t.Fatal("Ping after Close returned no error")
	}
	if !strings.Contains(err.Error(), "closed") {
		t.Errorf("error after Close = %q, want an error naming the closed database", err)
	}
}

func TestOpenCorruptOrUnwritable(t *testing.T) {
	t.Run("missing parent directory", func(t *testing.T) {
		path := filepath.Join(t.TempDir(), "missing", "app.db")

		_, err := Open(path)
		if err == nil {
			t.Fatal("Open with missing parent directory returned no error")
		}
		if !strings.Contains(err.Error(), path) {
			t.Errorf("error = %q, want it to name the path %q", err, path)
		}
	})

	t.Run("unwritable path", func(t *testing.T) {
		path := filepath.Join(t.TempDir(), "readonly.db")
		if err := os.WriteFile(path, nil, 0o644); err != nil {
			t.Fatalf("write file: %v", err)
		}
		if err := os.Chmod(path, 0o444); err != nil {
			t.Fatalf("chmod file: %v", err)
		}
		t.Cleanup(func() { os.Chmod(path, 0o644) })

		_, err := Open(path)
		if err == nil {
			t.Fatal("Open on unwritable path returned no error")
		}
		if !strings.Contains(err.Error(), path) {
			t.Errorf("error = %q, want it to name the path %q", err, path)
		}
		if _, statErr := os.Stat(path); statErr != nil {
			t.Errorf("unwritable file was removed: %v", statErr)
		}
	})

	t.Run("non-database file", func(t *testing.T) {
		path := filepath.Join(t.TempDir(), "not-a-database.txt")
		content := []byte("this is definitely not a sqlite database")
		if err := os.WriteFile(path, content, 0o644); err != nil {
			t.Fatalf("write file: %v", err)
		}

		_, err := Open(path)
		if err == nil {
			t.Fatal("Open on non-database file returned no error")
		}
		if !strings.Contains(err.Error(), path) {
			t.Errorf("error = %q, want it to name the path %q", err, path)
		}

		got, readErr := os.ReadFile(path)
		if readErr != nil {
			t.Fatalf("read file after Open: %v", readErr)
		}
		if string(got) != string(content) {
			t.Errorf("non-database file was modified: got %q, want %q", got, content)
		}
	})
}
