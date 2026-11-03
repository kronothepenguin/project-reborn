package store

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/config"
	_ "modernc.org/sqlite"
)

// Open returns a pool with a single connection. Inside a transaction use only
// the queries bound to it (New(db).WithTx(tx)): touching db there waits forever
// for the connection the transaction already holds.
//
// A database with no table gets every update at once. Open writes nothing to
// any other database: its waiting updates are applied by an administrator, or
// at start when they are automatic.
func Open(path string) (*sql.DB, error) {
	db, err := connect(path)
	if err != nil {
		return nil, err
	}
	if err := createIfNew(context.Background(), db); err != nil {
		db.Close()
		return nil, fmt.Errorf("store: open %q: %w", path, err)
	}
	return db, nil
}

func createIfNew(ctx context.Context, db *sql.DB) error {
	var tables int
	err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite\_%' ESCAPE '\'`).Scan(&tables)
	if err != nil || tables > 0 {
		return err
	}
	updates, err := Updates()
	if err != nil {
		return err
	}
	_, err = ApplyUpdates(ctx, db, updates)
	return err
}

func connect(path string) (*sql.DB, error) {
	// Without _time_format=sqlite, modernc writes time.Time with t.String(),
	// which SQLite date functions and ordering cannot use. _timezone=UTC
	// converts every written time to UTC, so stored DATETIME text compares in
	// time order whatever zone the caller used.
	dsn := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(%d)&_time_format=sqlite&_timezone=UTC", path, busyTimeout)
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
	return db, nil
}

func Must(db *sql.DB, err error) *sql.DB {
	if err != nil {
		panic(err)
	}
	return db
}

// FromConfig opens the database that config.json names and panics when it
// cannot, like Must. Runners use it to get the db they pass to the apps.
func FromConfig() *sql.DB {
	return Must(Open(config.Get().Store.Path))
}
