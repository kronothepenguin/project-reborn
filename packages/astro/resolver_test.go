package astro

import (
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"testing/fstest"
)

func TestResolversRemoveTheSvelteSelectMarker(t *testing.T) {
	const page = `<select name="day"><option>[[ .Day ]]</option><!></select>`
	const want = `<select name="day"><option>7</option></select>`

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		io.WriteString(w, page)
	}))
	defer server.Close()
	baseURL, err := url.Parse(server.URL)
	if err != nil {
		t.Fatalf("parse server URL: %v", err)
	}

	for name, resolve := range map[string]Resolver{
		"fs":     MakeFSResolver(fstest.MapFS{"page.html": {Data: []byte(page)}}),
		"server": MakeServerResolver(baseURL),
	} {
		t.Run(name, func(t *testing.T) {
			tmpl, err := resolve("page.html")
			if err != nil {
				t.Fatalf("resolve: %v", err)
			}
			var got strings.Builder
			if err := tmpl.Execute(&got, map[string]int{"Day": 7}); err != nil {
				t.Fatalf("execute: %v", err)
			}
			if got.String() != want {
				t.Errorf("rendered %q, want %q", got.String(), want)
			}
		})
	}
}
