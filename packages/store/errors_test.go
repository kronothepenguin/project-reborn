package store

import (
	"context"
	"fmt"
	"path/filepath"
	"testing"
)

func TestIsNotFound(t *testing.T) {
	s := openTestStore(t)
	ctx := context.Background()

	var value int
	err := s.db.QueryRowContext(ctx, "SELECT 1 WHERE 0").Scan(&value)
	if err == nil {
		t.Fatal("expected no rows")
	}
	if !IsNotFound(err) {
		t.Errorf("IsNotFound(%v) = false, want true", err)
	}
	if !IsNotFound(fmt.Errorf("querying widget: %w", err)) {
		t.Errorf("IsNotFound did not unwrap a wrapped error")
	}
	if IsConflict(err) || IsForeignKey(err) || IsBusy(err) {
		t.Errorf("not-found error classified into another class: %v", err)
	}
}

func TestIsConflict(t *testing.T) {
	s := openTestStore(t)
	ctx := context.Background()

	if _, err := s.db.ExecContext(ctx, `CREATE TABLE unique_things (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)`); err != nil {
		t.Fatalf("create table: %v", err)
	}
	if _, err := s.db.ExecContext(ctx, `INSERT INTO unique_things (id, name) VALUES (1, 'one')`); err != nil {
		t.Fatalf("insert first row: %v", err)
	}

	if _, err := s.db.ExecContext(ctx, `INSERT INTO unique_things (id, name) VALUES (2, 'one')`); err == nil {
		t.Fatal("expected unique violation")
	} else if !IsConflict(err) {
		t.Errorf("IsConflict(%v) = false, want true", err)
	} else if IsNotFound(err) || IsForeignKey(err) || IsBusy(err) {
		t.Errorf("conflict error classified into another class: %v", err)
	}

	if _, err := s.db.ExecContext(ctx, `INSERT INTO unique_things (id, name) VALUES (1, 'two')`); err == nil {
		t.Fatal("expected primary-key violation")
	} else if !IsConflict(err) {
		t.Errorf("IsConflict(%v) = false for primary-key violation, want true", err)
	}
}

func TestIsForeignKey(t *testing.T) {
	s := openTestStore(t)
	ctx := context.Background()

	if _, err := s.db.ExecContext(ctx, `CREATE TABLE parents (id INTEGER PRIMARY KEY)`); err != nil {
		t.Fatalf("create parent table: %v", err)
	}
	if _, err := s.db.ExecContext(ctx, `CREATE TABLE children (id INTEGER PRIMARY KEY, parent_id INTEGER NOT NULL REFERENCES parents(id))`); err != nil {
		t.Fatalf("create child table: %v", err)
	}

	if _, err := s.db.ExecContext(ctx, `INSERT INTO children (id, parent_id) VALUES (1, 999)`); err == nil {
		t.Fatal("expected foreign-key violation")
	} else if !IsForeignKey(err) {
		t.Errorf("IsForeignKey(%v) = false, want true", err)
	} else if IsNotFound(err) || IsConflict(err) || IsBusy(err) {
		t.Errorf("foreign-key error classified into another class: %v", err)
	}
}

func TestIsBusy(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")
	ctx := context.Background()

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

	if _, err := holder.db.ExecContext(ctx, `CREATE TABLE t (id INTEGER PRIMARY KEY)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	tx, err := holder.db.BeginTx(ctx, nil)
	if err != nil {
		t.Fatalf("begin holder transaction: %v", err)
	}
	defer tx.Rollback()
	if _, err := tx.ExecContext(ctx, `INSERT INTO t (id) VALUES (1)`); err != nil {
		t.Fatalf("holder write: %v", err)
	}

	if _, err := contender.db.ExecContext(ctx, `PRAGMA busy_timeout = 250`); err != nil {
		t.Fatalf("set contender busy_timeout: %v", err)
	}
	if _, err := contender.db.ExecContext(ctx, `INSERT INTO t (id) VALUES (2)`); err == nil {
		t.Fatal("expected busy error")
	} else if !IsBusy(err) {
		t.Errorf("IsBusy(%v) = false, want true", err)
	} else if IsNotFound(err) || IsConflict(err) || IsForeignKey(err) {
		t.Errorf("busy error classified into another class: %v", err)
	}
}
