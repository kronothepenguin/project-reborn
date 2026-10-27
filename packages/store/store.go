package store

import (
	"context"
	"database/sql"
	"fmt"
	"io/fs"

	_ "modernc.org/sqlite"
)

// Open returns a pool with a single connection. Inside a transaction use only
// the queries bound to it (New(db).WithTx(tx)): touching db there waits forever
// for the connection the transaction already holds.
func Open(path string) (*sql.DB, error) {
	// Without _time_format=sqlite, modernc writes time.Time with t.String(),
	// which SQLite date functions and ordering cannot use.
	dsn := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)&_time_format=sqlite", path)
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("store: open %q: %w", path, err)
	}
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)

	if err := db.PingContext(context.Background()); err != nil {
		db.Close()
		return nil, fmt.Errorf("store: open %q: %w", path, err)
	}

	schemas, err := fs.Sub(schemaFS, "schema")
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("store: open %q: %w", path, err)
	}
	if err := applySchemas(db, schemas); err != nil {
		db.Close()
		return nil, fmt.Errorf("store: open %q: %w", path, err)
	}

	return db, nil
}

func Must(db *sql.DB, err error) *sql.DB {
	if err != nil {
		panic(err)
	}
	return db
}
