package astro

import (
	"html/template"
	"io"
	"io/fs"
	"net/http"
	"net/url"
	"strings"
)

type Resolver func(string) (*template.Template, error)

func MakeServerResolver(baseURL *url.URL) Resolver {
	return func(name string) (*template.Template, error) {
		name = strings.TrimSuffix(name, "/index.html")
		name = strings.TrimSuffix(name, ".html")
		if name == "" || name == "index" {
			name = "/"
		}

		u := baseURL.JoinPath(name)

		resp, err := http.Get(u.String())
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}

		return template.New(name).Delims("[[", "]]").Parse(string(body))
	}
}

func MakeFSResolver(fsys fs.FS) Resolver {
	return func(name string) (*template.Template, error) {
		b, err := fs.ReadFile(fsys, name)
		if err != nil {
			return nil, err
		}

		return template.New(name).Delims("[[", "]]").Parse(string(b))
	}
}
