package store

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
	"time"
)

// TestHelperProcess is not a real test: it is the entry point for subprocesses
// re-executed by tests that need a second process. It does nothing unless
// STORE_HELPER is set to 1.
func TestHelperProcess(t *testing.T) {
	if os.Getenv("STORE_HELPER") != "1" {
		return
	}
	ctx := context.Background()
	path := os.Getenv("STORE_HELPER_PATH")
	mode := os.Getenv("STORE_HELPER_MODE")

	s, err := Open(path)
	if err != nil {
		os.Exit(2)
	}

	switch mode {
	case "crash-mid-transaction":
		tx, err := s.Begin(ctx)
		if err != nil {
			os.Exit(3)
		}
		if _, err := tx.tx.ExecContext(ctx, `INSERT INTO items (id, name) VALUES (99, 'ghost')`); err != nil {
			os.Exit(4)
		}
		os.Exit(0)
	case "hold-write":
		conn, err := s.db.Conn(ctx)
		if err != nil {
			os.Exit(5)
		}
		if _, err := conn.ExecContext(ctx, "BEGIN IMMEDIATE"); err != nil {
			os.Exit(6)
		}
		if err := os.WriteFile(os.Getenv("STORE_HELPER_READY"), []byte("ready"), 0o644); err != nil {
			os.Exit(7)
		}
		time.Sleep(1500 * time.Millisecond)
		os.Exit(0)
	}
	os.Exit(1)
}

func runHelper(t *testing.T, path, mode string, extraEnv ...string) *exec.Cmd {
	t.Helper()
	cmd := exec.Command(os.Args[0], "-test.run=TestHelperProcess")
	cmd.Env = append(os.Environ(),
		"STORE_HELPER=1",
		"STORE_HELPER_MODE="+mode,
		"STORE_HELPER_PATH="+path,
	)
	cmd.Env = append(cmd.Env, extraEnv...)
	return cmd
}

func countItems(t *testing.T, s *Store) int64 {
	t.Helper()
	return countRows(t, s, "items")
}

func TestTransactionCommitVisibility(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")
	writer, err := Open(path)
	if err != nil {
		t.Fatalf("Open writer: %v", err)
	}
	defer writer.Close()
	reader, err := Open(path)
	if err != nil {
		t.Fatalf("Open reader: %v", err)
	}
	defer reader.Close()

	ctx := context.Background()
	if _, err := writer.db.ExecContext(ctx, `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	tx, err := writer.Begin(ctx)
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	if _, err := tx.tx.ExecContext(ctx, `INSERT INTO items (id, name) VALUES (1, 'pending')`); err != nil {
		t.Fatalf("insert in transaction: %v", err)
	}
	if got := countItems(t, reader); got != 0 {
		t.Fatalf("reader saw %d uncommitted row(s), want 0", got)
	}

	if err := tx.Commit(); err != nil {
		t.Fatalf("Commit: %v", err)
	}
	if got := countItems(t, reader); got != 1 {
		t.Fatalf("reader saw %d committed row(s), want 1", got)
	}
}

func TestTransactionRollbackLeavesNoPartialChange(t *testing.T) {
	s := openTestStore(t)
	ctx := context.Background()

	if _, err := s.db.ExecContext(ctx, `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	tx, err := s.Begin(ctx)
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	for _, id := range []int{1, 2, 3} {
		if _, err := tx.tx.ExecContext(ctx, `INSERT INTO items (id, name) VALUES (?, 'temporary')`, id); err != nil {
			t.Fatalf("insert %d: %v", id, err)
		}
	}
	if err := tx.Rollback(); err != nil {
		t.Fatalf("Rollback: %v", err)
	}
	if got := countItems(t, s); got != 0 {
		t.Fatalf("rows after rollback = %d, want 0", got)
	}
}

func TestTransactionTerminalStateErrors(t *testing.T) {
	s := openTestStore(t)
	ctx := context.Background()

	if _, err := s.db.ExecContext(ctx, `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	committed, err := s.Begin(ctx)
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	if err := committed.Commit(); err != nil {
		t.Fatalf("first Commit: %v", err)
	}
	if err := committed.Commit(); !errors.Is(err, sql.ErrTxDone) {
		t.Fatalf("second Commit error = %v, want %v", err, sql.ErrTxDone)
	}
	if err := committed.Rollback(); !errors.Is(err, sql.ErrTxDone) {
		t.Fatalf("Rollback after Commit error = %v, want %v", err, sql.ErrTxDone)
	}

	rolledBack, err := s.Begin(ctx)
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	if err := rolledBack.Rollback(); err != nil {
		t.Fatalf("first Rollback: %v", err)
	}
	if err := rolledBack.Rollback(); !errors.Is(err, sql.ErrTxDone) {
		t.Fatalf("second Rollback error = %v, want %v", err, sql.ErrTxDone)
	}
	if err := rolledBack.Commit(); !errors.Is(err, sql.ErrTxDone) {
		t.Fatalf("Commit after Rollback error = %v, want %v", err, sql.ErrTxDone)
	}
	if got := countItems(t, s); got != 0 {
		t.Fatalf("rows after terminal-state errors = %d, want 0", got)
	}
}

func TestCrashMidTransactionLeavesNoPartialChange(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")

	s, err := Open(path)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer s.Close()
	if _, err := s.db.ExecContext(context.Background(), `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	cmd := runHelper(t, path, "crash-mid-transaction")
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("helper process failed: %v\n%s", err, out)
	}

	if got := countItems(t, s); got != 0 {
		t.Fatalf("crash mid-transaction left %d row(s), want 0", got)
	}
}
