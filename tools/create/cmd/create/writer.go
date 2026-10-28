package main

import (
	"embed"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

// all: keeps templates whose names start with a dot, such as .air.toml.tmpl.
//
//go:embed all:templates
var templatesFS embed.FS

func write(root, name string, appPort, astroPort int) (err error) {
	defer func() {
		if err == nil {
			return
		}

		err = errors.Join(
			err,
			os.RemoveAll(filepath.Join(root, "apps", name)),
			os.RemoveAll(filepath.Join(root, "packages", name)),
		)
	}()

	data := map[string]any{
		"Name":      name,
		"AppPort":   appPort,
		"AstroPort": astroPort,
	}

	return fs.WalkDir(templatesFS, "templates", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		filename, err := filepath.Rel("templates", path)
		if err != nil {
			return err
		}

		filename = strings.TrimSuffix(filename, ".tmpl")
		filename = strings.ReplaceAll(filename, "[[name]]", name)

		target := filepath.Join(root, filename)

		dir := filepath.Dir(target)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}

		b, err := fs.ReadFile(templatesFS, path)
		if err != nil {
			return err
		}

		t, err := template.New(path).Parse(string(b))
		if err != nil {
			return err
		}

		f, err := os.OpenFile(target, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
		if err != nil {
			return err
		}
		defer f.Close()

		return t.Execute(f, data)
	})
}
