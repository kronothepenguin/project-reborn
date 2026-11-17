package cms

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/kronothepenguin/project-reborn/packages/assets/dcr"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// clientFile writes a file into the client's folder of the assets folder
// config.json names, and removes it when the test ends.
func clientFile(t *testing.T, name, content string) {
	t.Helper()
	path := filepath.Join(config.Get().Assets.Path, "dcr", name)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.Remove(path) })
}

// importClientFiles stores the two client files, as an import does.
func importClientFiles(t *testing.T, db *sql.DB, variables, texts string) {
	t.Helper()
	files := fstest.MapFS{
		"external_variables.txt": {Data: []byte(variables)},
		"external_texts.txt":     {Data: []byte(texts)},
	}
	if err := dcr.Import(t.Context(), store.New(db), files); err != nil {
		t.Fatalf("import: %v", err)
	}
}

func hotelSetting(t *testing.T, db *sql.DB, key string, value any) {
	t.Helper()
	if err := settings.Set(t.Context(), store.New(db), 0, key, value); err != nil {
		t.Fatalf("set %s: %v", key, err)
	}
}

func TestClientFilesAreServedFromTheAssetsFolder(t *testing.T) {
	_, mux := newSite(t)
	clientFile(t, "habbo.dcr", "the movie")
	clientFile(t, "hof_furni/chair.cct", "a cast")

	for path, want := range map[string]string{"/dcr/habbo.dcr": "the movie", "/dcr/hof_furni/chair.cct": "a cast"} {
		if rec := serve(mux, "GET", path, nil, nil); rec.Code != http.StatusOK || rec.Body.String() != want {
			t.Errorf("GET %s = %d %q, want 200 %q", path, rec.Code, rec.Body, want)
		}
	}
}

func TestMissingClientFilesAnswerNotFound(t *testing.T) {
	_, mux := newSite(t)
	clientFile(t, "hof_furni/chair.cct", "a cast")
	outside := filepath.Join(t.TempDir(), "secret.txt")
	if err := os.WriteFile(outside, []byte("secret"), 0o644); err != nil {
		t.Fatal(err)
	}
	link := filepath.Join(config.Get().Assets.Path, "dcr", "secret.txt")
	if err := os.Symlink(outside, link); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.Remove(link) })

	for _, path := range []string{"/dcr/missing.cct", "/dcr/", "/dcr/hof_furni/", "/dcr/secret.txt"} {
		if rec := serve(mux, "GET", path, nil, nil); rec.Code != http.StatusNotFound {
			t.Errorf("GET %s = %d %q, want 404", path, rec.Code, rec.Body)
		}
	}
}

// The variables point at the address the browser used, whatever site.url says.
func TestExternalVariablesPointAtTheAddressTheBrowserUsed(t *testing.T) {
	db, mux := newSite(t)
	importClientFiles(t, db,
		"cast.entry.1=hh_entry\r\nclient.version.id=401\r\nimage.library.url=http://images.habbo.com/c_images/",
		"a=b")
	hotelSetting(t, db, "game.clientVersion", 26)
	clientFile(t, "external_variables.txt", "the file on disk")

	r := httptest.NewRequest("GET", "/dcr/external_variables.txt", nil)
	r.Host = "hotel.example.com:8080"
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, r)

	if rec.Code != http.StatusOK {
		t.Fatalf("GET = %d %q", rec.Code, rec.Body)
	}
	if got := rec.Header().Get("Content-Type"); got != "text/plain; charset=utf-8" {
		t.Errorf("Content-Type = %q", got)
	}
	lines := strings.Split(rec.Body.String(), "\r\n")
	for _, want := range []string{
		"cast.entry.1=hh_entry",
		"client.version.id=26",
		"image.library.url=http://hotel.example.com:8080/c_images/",
		"figure.draworder.xml=http://hotel.example.com:8080/dcr/draworder.xml",
		"dynamic.download.url=http://hotel.example.com:8080/dcr/hof_furni/",
	} {
		if !slices.Contains(lines, want) {
			t.Errorf("the variables lack %q:\n%s", want, rec.Body)
		}
	}
}

func TestExternalTextsNameTheHotel(t *testing.T) {
	db, mux := newSite(t)
	importClientFiles(t, db, "a=b", "\ufeffwelcome=Welcome to Habbo Hotel!\r\nhelp=Ask a Habbo Guide\r\n")
	hotelSetting(t, db, "site.shortName", "Reborn")
	clientFile(t, "external_texts.txt", "the file on disk")

	rec := serve(mux, "GET", "/dcr/external_texts.txt", nil, nil)

	if rec.Code != http.StatusOK {
		t.Fatalf("GET = %d %q", rec.Code, rec.Body)
	}
	if got := rec.Header().Get("Content-Type"); got != "text/plain; charset=utf-8" {
		t.Errorf("Content-Type = %q", got)
	}
	want := "\ufeffwelcome=Welcome to Reborn Hotel!\r\nhelp=Ask a Reborn Guide\r\n"
	if got := rec.Body.String(); got != want {
		t.Errorf("the texts = %q, want %q", got, want)
	}
}
