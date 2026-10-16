package store

import (
	"context"
	"database/sql"
	"fmt"
	"io/fs"

	_ "modernc.org/sqlite"
)

type Store struct {
	*Queries

	db   *sql.DB
	path string
}

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

func (s *Store) Close() error {
	return s.db.Close()
}

func Must(s *Store, err error) *Store {
	if err != nil {
		panic(err)
	}
	return s
}
