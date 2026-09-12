package store

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"sort"
)

//go:embed schema/*.schema.sql
var schemaFS embed.FS

// applySchemas executes every *.schema.sql file in fsys in lexicographic
// filename order, each as a single multi-statement statement. Files are
// additive and idempotent, so applying them to an existing database is a
// no-op for structures that already exist and never touches undeclared ones.
func applySchemas(db *sql.DB, fsys fs.FS) error {
	names, err := fs.Glob(fsys, "*.schema.sql")
	if err != nil {
		return fmt.Errorf("store: list schemas: %w", err)
	}
	sort.Strings(names)

	for _, name := range names {
		content, err := fs.ReadFile(fsys, name)
		if err != nil {
			return fmt.Errorf("store: read schema %s: %w", name, err)
		}
		if _, err := db.ExecContext(context.Background(), string(content)); err != nil {
			return fmt.Errorf("store: apply schema %s: %w", name, err)
		}
	}
	return nil
}
