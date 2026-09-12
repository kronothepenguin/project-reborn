package store

import (
	"context"
	"database/sql"
	"fmt"
	"io/fs"

	_ "modernc.org/sqlite"
)

// Store is the single owner of the SQLite database file: one connection pool
// per process with foreign keys, WAL journaling, and a busy timeout always on.
// It embeds the generated typed operations, which consumers call directly.
type Store struct {
	*Queries

	db   *sql.DB
	path string
}

// Open opens the SQLite file at path, creating it when absent, enables
// foreign keys, WAL journaling and a 5s busy timeout on every connection,
// applies all declared schemas in lexicographic filename order, and returns
// a ready Store. The parent directory must already exist.
func Open(path string) (*Store, error) {
	dsn := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)", path)
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

	return &Store{Queries: New(db), db: db, path: path}, nil
}

// Close releases the database handle. It is safe to call more than once.
func (s *Store) Close() error {
	return s.db.Close()
}
