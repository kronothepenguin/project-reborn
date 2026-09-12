package store

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestSecondConnectionSeesCommittedChange(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")
	first, err := Open(path)
	if err != nil {
		t.Fatalf("Open first: %v", err)
	}
	defer first.Close()
	second, err := Open(path)
	if err != nil {
		t.Fatalf("Open second: %v", err)
	}
	defer second.Close()

	ctx := context.Background()
	if _, err := first.db.ExecContext(ctx, `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`); err != nil {
		t.Fatalf("create table: %v", err)
	}
	if _, err := first.db.ExecContext(ctx, `INSERT INTO items (id, name) VALUES (1, 'committed')`); err != nil {
		t.Fatalf("insert: %v", err)
	}

	if got := countItems(t, second); got != 1 {
		t.Fatalf("second connection saw %d row(s), want 1", got)
	}
}

func TestConflictingWriteWaitsOrIsBusy(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")
	holder, err := Open(path)
	if err != nil {
		t.Fatalf("Open holder: %v", err)
	}
	defer holder.Close()
	contender, err := Open(path)
	if err != nil {
		t.Fatalf("Open contender: %v", err)
	}
	defer contender.Close()

	ctx := context.Background()
	if _, err := holder.db.ExecContext(ctx, `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	conn, err := holder.db.Conn(ctx)
	if err != nil {
		t.Fatalf("pin holder connection: %v", err)
	}
	t.Cleanup(func() { conn.Close() })
	if _, err := conn.ExecContext(ctx, "BEGIN IMMEDIATE"); err != nil {
		t.Fatalf("holder BEGIN IMMEDIATE: %v", err)
	}

	released := make(chan error, 1)
	go func() {
		time.Sleep(300 * time.Millisecond)
		_, err := conn.ExecContext(ctx, "COMMIT")
		conn.Close()
		released <- err
	}()

	start := time.Now()
	_, writeErr := contender.db.ExecContext(ctx, `INSERT INTO items (id, name) VALUES (1, 'contended')`)
	elapsed := time.Since(start)

	if writeErr != nil {
		if !IsBusy(writeErr) {
			t.Fatalf("conflicting write error = %v, want nil (wait then succeed) or busy", writeErr)
		}
	} else if elapsed < 200*time.Millisecond {
		t.Fatalf("conflicting write returned after %v without waiting for the holder", elapsed)
	}

	if err := <-released; err != nil {
		t.Fatalf("holder COMMIT: %v", err)
	}

	got := countItems(t, contender)
	if writeErr != nil && got != 0 {
		t.Fatalf("busy write left %d partial row(s), want 0", got)
	}
	if writeErr == nil && got != 1 {
		t.Fatalf("waited write left %d row(s), want 1", got)
	}
}

func TestBusyAcrossProcesses(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")
	s, err := Open(path)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer s.Close()

	ctx := context.Background()
	if _, err := s.db.ExecContext(ctx, `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	ready := filepath.Join(t.TempDir(), "helper-ready")
	cmd := runHelper(t, path, "hold-write", "STORE_HELPER_READY="+ready)
	if err := cmd.Start(); err != nil {
		t.Fatalf("start helper process: %v", err)
	}

	deadline := time.Now().Add(5 * time.Second)
	for {
		if _, err := os.Stat(ready); err == nil {
			break
		}
		if time.Now().After(deadline) {
			cmd.Process.Kill()
			cmd.Wait()
			t.Fatal("helper process never acquired the write lock")
		}
		time.Sleep(10 * time.Millisecond)
	}

	if _, err := s.db.ExecContext(ctx, `PRAGMA busy_timeout = 250`); err != nil {
		t.Fatalf("set busy_timeout: %v", err)
	}
	_, writeErr := s.db.ExecContext(ctx, `INSERT INTO items (id, name) VALUES (1, 'contended')`)
	if writeErr == nil {
		t.Fatal("write while another process holds the write lock returned no error")
	}
	if !IsBusy(writeErr) {
		t.Fatalf("cross-process write error = %v, want busy", writeErr)
	}

	if err := cmd.Wait(); err != nil {
		t.Fatalf("helper process failed: %v", err)
	}
	if got := countItems(t, s); got != 0 {
		t.Fatalf("busy write left %d partial row(s), want 0", got)
	}

	if _, err := s.db.ExecContext(ctx, `PRAGMA busy_timeout = 5000`); err != nil {
		t.Fatalf("restore busy_timeout: %v", err)
	}
	if _, err := s.db.ExecContext(ctx, `INSERT INTO items (id, name) VALUES (2, 'after')`); err != nil {
		t.Fatalf("write after helper exit: %v", err)
	}
	if got := countItems(t, s); got != 1 {
		t.Fatalf("rows after recovery = %d, want 1", got)
	}
}
