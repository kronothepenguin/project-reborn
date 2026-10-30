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

// parse removes the marker Svelte's server renderer ends a <select> with when
// its options come from a snippet. It exists for hydration, which these pages
// never get, and html/template would escape it into text inside the <select>.
func parse(name, page string) (*template.Template, error) {
	page = strings.ReplaceAll(page, "<!>", "")
	return template.New(name).Delims("[[", "]]").Parse(page)
}

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

		return parse(name, string(body))
	}
}

func MakeFSResolver(fsys fs.FS) Resolver {
	return func(name string) (*template.Template, error) {
		b, err := fs.ReadFile(fsys, name)
		if err != nil {
			return nil, err
		}

		return parse(name, string(b))
	}
}
