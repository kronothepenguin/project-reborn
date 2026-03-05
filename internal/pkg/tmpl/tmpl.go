package tmpl

import (
	"context"
	"errors"
	"html/template"
	"io"
	"io/fs"
	"net/http"
)

var ErrNoFilesFound = errors.New("no files were found")

type Resolver func() (*template.Template, error)

func ParseAllFS(fsys fs.FS) (*template.Template, error) {
	var paths []string
	err := fs.WalkDir(fsys, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		paths = append(paths, path)

		return nil
	})
	if err != nil {
		return nil, err
	}

	if len(paths) == 0 {
		return nil, ErrNoFilesFound
	}

	return template.ParseFS(fsys, paths...)
}

func ExecuteTemplate(ctx context.Context, w io.Writer, name string, data any) {
	err := From(ctx).ExecuteTemplate(w, name, data)
	if err != nil {
		if w, ok := w.(http.ResponseWriter); ok {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		io.WriteString(w, err.Error())
	}
}
