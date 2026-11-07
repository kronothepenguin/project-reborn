package main

import (
	"bytes"
	"embed"
	"errors"
	"fmt"
	"go/format"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strings"
	"text/template"
)

// all: keeps templates whose names start with a dot, such as .air.toml.tmpl.
//
//go:embed all:templates
var templatesFS embed.FS

// walkTemplates calls fn with each template of the project's kind and the file
// it renders to, relative to the repository root.
func walkTemplates(p project, fn func(tmpl, target string) error) error {
	dir := path.Join("templates", p.Kind)
	return fs.WalkDir(templatesFS, dir, func(tmpl string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}

		target := strings.TrimSuffix(strings.TrimPrefix(tmpl, dir+"/"), ".tmpl")
		target = strings.ReplaceAll(target, "[[name]]", p.Name)

		return fn(tmpl, filepath.FromSlash(target))
	})
}

func write(root string, p project) (err error) {
	defer func() {
		if err == nil {
			return
		}

		errs := []error{err}
		for _, dir := range p.dirs() {
			errs = append(errs, os.RemoveAll(filepath.Join(root, dir)))
		}
		err = errors.Join(errs...)
	}()

	return walkTemplates(p, func(tmpl, target string) error {
		target = filepath.Join(root, target)
		if err := os.MkdirAll(filepath.Dir(target), 0755); err != nil {
			return err
		}

		b, err := fs.ReadFile(templatesFS, tmpl)
		if err != nil {
			return err
		}

		t, err := template.New(tmpl).Parse(string(b))
		if err != nil {
			return err
		}

		var out bytes.Buffer
		if err := t.Execute(&out, p); err != nil {
			return err
		}
		data := out.Bytes()
		// The order of the imports depends on the name, and gofmt sorts them.
		if filepath.Ext(target) == ".go" {
			if data, err = format.Source(data); err != nil {
				return fmt.Errorf("%s: %w", tmpl, err)
			}
		}
		return os.WriteFile(target, data, 0644)
	})
}
