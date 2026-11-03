package router

import (
	"html/template"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func printPage(name string) (*template.Template, error) {
	return template.New(name).Delims("[[", "]]").Parse(name + ` [[ printf "%+v" . ]]`)
}

func TestAFailedAutomaticUpdateClosesEveryPage(t *testing.T) {
	db, err := store.Connect(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	broken, err := store.ParseUpdates(fstest.MapFS{
		"0001-broken.sql": {Data: []byte("-- Broken.\n-- automatic\nINSERT INTO nowhere (id) VALUES (1);\n")},
	})
	if err != nil {
		t.Fatal(err)
	}

	for _, c := range []struct {
		name    string
		updates []store.Update
		failed  bool
	}{
		{"a failure", broken, true},
		{"no failure", nil, false},
	} {
		t.Run(c.name, func(t *testing.T) {
			check := store.NewUpdateCheck(db, c.updates)
			if err := check.ApplyAutomatic(t.Context()); (err != nil) != c.failed {
				t.Fatalf("ApplyAutomatic = %v", err)
			}
			r := New(Deps{Resolver: printPage, DB: db, Queries: store.New(db), Updates: check})
			served := false
			next := http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) { served = true })

			for _, path := range []string{"/", "/me", "/register"} {
				served = false
				rec := httptest.NewRecorder()
				r.UpdateFailed(next).ServeHTTP(rec, httptest.NewRequest("GET", path, nil))
				if c.failed && (served || rec.Code != http.StatusServiceUnavailable || !strings.Contains(rec.Body.String(), "update-failed.html {ShortName:")) {
					t.Errorf("%s after a failure: served %t, %d %s", path, served, rec.Code, rec.Body)
				}
				if !c.failed && !served {
					t.Errorf("%s was not served without a failure: %d %s", path, rec.Code, rec.Body)
				}
			}
		})
	}
}
