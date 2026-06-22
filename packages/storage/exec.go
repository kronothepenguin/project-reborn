package storage

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"os"
)

//go:embed schema/*.sql
var SchemaFS embed.FS

func ExecSchema(db DBTX) error {
	return ExecFS(db, SchemaFS)
}

func ExecFS(db DBTX, fsys fs.FS) error {
	return fs.WalkDir(fsys, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		content, err := fs.ReadFile(fsys, path)
		if err != nil {
			return fmt.Errorf("%s: %v", path, err)
		}

		_, err = db.ExecContext(context.Background(), string(content))
		if err != nil {
			return fmt.Errorf("%s: %v", path, err)
		}

		return nil
	})
}

func ExecFiles(db DBTX, files ...string) error {
	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			return err
		}
		if _, err := db.ExecContext(context.Background(), string(content)); err != nil {
			return err
		}
	}
	return nil
}
