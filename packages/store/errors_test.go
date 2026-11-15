package store

import (
	"path/filepath"
	"testing"
)

func TestIsBusy(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.db")
	ctx := t.Context()

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

	if _, err := holder.ExecContext(ctx, `CREATE TABLE t (id INTEGER PRIMARY KEY)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	tx, err := holder.BeginTx(ctx, nil)
	if err != nil {
		t.Fatalf("begin holder transaction: %v", err)
	}
	defer tx.Rollback()
	if _, err := tx.ExecContext(ctx, `INSERT INTO t (id) VALUES (1)`); err != nil {
		t.Fatalf("holder write: %v", err)
	}

	if _, err := contender.ExecContext(ctx, `PRAGMA busy_timeout = 250`); err != nil {
		t.Fatalf("set contender busy_timeout: %v", err)
	}
	if _, err := contender.ExecContext(ctx, `INSERT INTO t (id) VALUES (2)`); err == nil {
		t.Fatal("expected busy error")
	} else if !IsBusy(err) {
		t.Errorf("IsBusy(%v) = false, want true", err)
	} else if IsNotFound(err) || IsConflict(err) || IsForeignKey(err) {
		t.Errorf("busy error classified into another class: %v", err)
	}
}
