package installer

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/reborn"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// fakeListener records the moves asked of it, and answers like reborn: a
// redirect to the same path on the new address, or err.
type fakeListener struct {
	moves []string
	err   error
}

func (l *fakeListener) Move(w http.ResponseWriter, r *http.Request, host string, port int) error {
	l.moves = append(l.moves, host+" "+strconv.Itoa(port))
	if l.err != nil {
		return l.err
	}
	http.Redirect(w, r, "http://"+host+":"+strconv.Itoa(port)+r.URL.Path, http.StatusSeeOther)
	return nil
}

// mounted returns an installer in an empty folder, on its own mux, as a
// runner of the installer alone builds it.
func mounted(t *testing.T, opts ...Option) (*Installer, *http.ServeMux) {
	t.Helper()
	t.Chdir(t.TempDir())
	return build(t, nil, nil, opts...)
}

// rebornConfig is the config.json reborn's runner writes before the installer
// opens. config.Load reads the file once per process, so every test here
// writes the same one.
const rebornConfig = `{"store": {"path": "habbo.db"}, "reborn": {"host": "localhost", "port": 16416}}`

// inReborn returns an installer as reborn builds it: config.json exists, the
// database it names is open and handed to New, and the listener comes through
// Inject.
func inReborn(t *testing.T, l Listener, opts ...Option) (*Installer, *http.ServeMux) {
	t.Helper()
	t.Chdir(t.TempDir())
	if err := os.WriteFile(config.Filename, []byte(rebornConfig), 0o644); err != nil {
		t.Fatal(err)
	}
	db, err := store.Open("habbo.db")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	return build(t, db, l, opts...)
}

func build(t *testing.T, db *sql.DB, l Listener, opts ...Option) (*Installer, *http.ServeMux) {
	t.Helper()
	opts = append([]Option{WithResolver(printData), WithStatic(http.NotFoundHandler())}, opts...)
	i, err := New(t.Context(), db, opts...)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	t.Cleanup(func() {
		if installation, ok := i.setup.Current(); ok && db == nil {
			installation.DB.Close()
		}
	})
	if l != nil {
		i.Inject(Services{Listener: l})
	}
	mux := http.NewServeMux()
	i.Mount(mux)
	return i, mux
}

// written reads the reborn and store sections of config.json.
func written(t *testing.T) config.Config {
	t.Helper()
	data, err := os.ReadFile(config.Filename)
	if err != nil {
		t.Fatalf("read %s: %v", config.Filename, err)
	}
	var cfg config.Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		t.Fatalf("decode %s: %v", config.Filename, err)
	}
	return cfg
}

// send serves one request the browser addressed to localhost:16416.
func send(t *testing.T, mux http.Handler, method, path string, form url.Values) *httptest.ResponseRecorder {
	t.Helper()
	var body io.Reader
	if form != nil {
		body = strings.NewReader(form.Encode())
	}
	r := httptest.NewRequest(method, "http://localhost:16416"+path, body)
	if form != nil {
		r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	return rec
}

func expect(t *testing.T, rec *httptest.ResponseRecorder, status int, location, body string) {
	t.Helper()
	if rec.Code != status || rec.Header().Get("Location") != location {
		t.Fatalf("%d to %q, want %d to %q\n%s", rec.Code, rec.Header().Get("Location"), status, location, rec.Body)
	}
	if !strings.Contains(rec.Body.String(), body) {
		t.Fatalf("body %q lacks %q", rec.Body, body)
	}
}

var adminForm = url.Values{
	"name":            {"Admin-1"},
	"email":           {"admin@example.com"},
	"bornOn":          {"1990-05-01"},
	"password":        {"secret123"},
	"passwordConfirm": {"secret123"},
}

var siteForm = url.Values{
	"name":            {"Reborn Hotel"},
	"shortName":       {"Reborn"},
	"url":             {"https://hotel.example.com"},
	"housekeepingUrl": {"http://localhost:18400/housekeeping"},
	"startCredits":    {"500"},
}

// toSettings saves the site step, after the config step, so that the settings
// step waits.
func toSettings(t *testing.T, mux http.Handler) {
	t.Helper()
	expect(t, send(t, mux, "POST", "/installer/site", siteForm), 303, "/installer/settings", "")
}

// toClient saves the site step and skips the settings step, after the config
// step, so that the client files step waits.
func toClient(t *testing.T, mux http.Handler) {
	t.Helper()
	toSettings(t, mux)
	expect(t, send(t, mux, "POST", "/installer/settings", url.Values{"action": {"skip"}}), 303, "/installer/client", "")
}

// toAdmin saves the site step and skips the settings and client files steps,
// after the config step, so that the administrator step waits.
func toAdmin(t *testing.T, mux http.Handler) {
	t.Helper()
	toClient(t, mux)
	expect(t, send(t, mux, "POST", "/installer/client", url.Values{"action": {"skip"}}), 303, "/installer/admin", "")
}

// A visitor opens the installer: its pages, forms and files are served under /installer/.
func TestTheInstallerIsServedUnderInstaller(t *testing.T) {
	var files []string
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		files = append(files, r.URL.Path)
	})
	_, mux := mounted(t, WithStatic(static))

	expect(t, send(t, mux, "GET", "/installer/", nil), 200, "", "Configured:false")
	expect(t, send(t, mux, "GET", "/installer/config", nil), 200, "", "Path:habbo.db")
	send(t, mux, "GET", "/installer/favicon.svg", nil)
	if len(files) != 1 || files[0] != "/favicon.svg" {
		t.Errorf("the files were asked for %q, want the built file /favicon.svg", files)
	}
	for _, path := range []string{"/", "/config", "/favicon.svg"} {
		if rec := send(t, mux, "GET", path, nil); rec.Code != http.StatusNotFound {
			t.Errorf("GET %s answered %d, want 404 outside /installer/", path, rec.Code)
		}
	}
}

// The administrator is created: the browser goes to /, and the done page is gone.
func TestCreatingTheAdministratorGoesToTheSite(t *testing.T) {
	i, mux := mounted(t)
	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"18400"}}), 303, "/installer/site", "")
	if i.Installed() {
		t.Fatal("Installed before the administrator exists")
	}
	toAdmin(t, mux)

	expect(t, send(t, mux, "POST", "/installer/admin", adminForm), 303, "/", "")

	if !i.Installed() {
		t.Error("not Installed after the administrator was created")
	}
	installation, _ := i.setup.Current()
	if installed, err := setup.Installed(t.Context(), installation.DB); err != nil || !installed {
		t.Errorf("Installed = %t, %v, want true", installed, err)
	}
	if rec := send(t, mux, "GET", "/installer/done", nil); rec.Code != http.StatusNotFound {
		t.Errorf("GET /installer/done answered %d, want 404", rec.Code)
	}
}

// The administrator is created while a runner waits for the installation: the wait returns.
func TestWaitForInstallReturnsOnceTheAdministratorExists(t *testing.T) {
	i, mux := inReborn(t, &fakeListener{})
	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"16416"}}),
		303, "/installer/site", "")
	toAdmin(t, mux)
	waited := make(chan error, 1)
	go func() { waited <- i.WaitForInstall(t.Context()) }()
	select {
	case err := <-waited:
		t.Fatalf("WaitForInstall returned %v before the administrator exists", err)
	case <-time.After(50 * time.Millisecond):
	}

	expect(t, send(t, mux, "POST", "/installer/admin", adminForm), 303, "/", "")

	select {
	case err := <-waited:
		if err != nil {
			t.Errorf("WaitForInstall = %v, want nil", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("WaitForInstall still waits after the administrator was created")
	}
}

// The runner stops before the installation ends: the wait returns the context's error.
func TestWaitForInstallReturnsWhenTheContextEnds(t *testing.T) {
	i, _ := inReborn(t, &fakeListener{})
	ctx, cancel := context.WithCancel(t.Context())
	waited := make(chan error, 1)
	go func() { waited <- i.WaitForInstall(ctx) }()

	cancel()

	select {
	case err := <-waited:
		if !errors.Is(err, context.Canceled) {
			t.Errorf("WaitForInstall = %v, want context.Canceled", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("WaitForInstall still waits after the context ended")
	}
	if i.Installed() {
		t.Error("Installed without an administrator")
	}
}

// Inside reborn, the config step asks one host and one port, and the database stays the one config.json names: a
// new address moves the browser to it.
func TestOneAddressMovesTheHotel(t *testing.T) {
	listener := &fakeListener{}
	_, mux := inReborn(t, listener)

	expect(t, send(t, mux, "GET", "/installer/config", nil), 200, "",
		"OneAddress:true Written:false ConfigPath:")
	expect(t, send(t, mux, "GET", "/installer/config", nil), 200, "",
		"Path:habbo.db Host:localhost Port:16416 HousekeepingPort:")

	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"path": {"other.db"}, "host": {"localhost"}, "port": {"16417"}}),
		303, "http://localhost:16417/installer/config", "")

	if len(listener.moves) != 1 || listener.moves[0] != "localhost 16417" {
		t.Errorf("moves %q, want one to localhost 16417", listener.moves)
	}
	cfg := written(t)
	if cfg.Reborn != (reborn.Reborn{Host: "localhost", Port: 16417}) || cfg.Store.Path != "habbo.db" {
		t.Errorf("%s holds reborn %+v and store %+v, want the form's address and the same database", config.Filename, cfg.Reborn, cfg.Store)
	}
	if _, err := os.Stat("other.db"); err == nil {
		t.Error("the config step created the database the form named")
	}
	expect(t, send(t, mux, "GET", "/installer/config", nil), 200, "", "Host:localhost Port:16417")

	// At the new address, the saved address goes on to the site.
	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"16417"}}),
		303, "/installer/site", "")
	if len(listener.moves) != 1 {
		t.Errorf("moves %q, want only the first", listener.moves)
	}
}

// Inside reborn, the config step asks one host and one port: the address the browser used moves nothing, is saved,
// and the step goes on to the site.
func TestOneAddressWhereTheHotelIsMovesNothing(t *testing.T) {
	listener := &fakeListener{}
	_, mux := inReborn(t, listener)

	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"16416"}}),
		303, "/installer/site", "")

	if len(listener.moves) != 0 {
		t.Errorf("moves %q, want none", listener.moves)
	}
	if cfg := written(t); cfg.Reborn != (reborn.Reborn{Host: "localhost", Port: 16416}) {
		t.Errorf("%s holds reborn %+v, want the form's address", config.Filename, cfg.Reborn)
	}
}

// Inside reborn, the config step refuses an address config.json cannot hold: nothing moves and nothing is saved.
func TestOneAddressRefusesABadAddress(t *testing.T) {
	listener := &fakeListener{}
	_, mux := inReborn(t, listener)

	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"70000"}}),
		422, "", "Error:reborn.port: must be between 1 and 65535")
	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"http://localhost"}, "port": {"16417"}}),
		422, "", "Error:reborn.host: must be a hostname or an IP address")

	if len(listener.moves) != 0 {
		t.Errorf("moves %q, want none", listener.moves)
	}
	if data, _ := os.ReadFile(config.Filename); string(data) != rebornConfig {
		t.Errorf("%s became %s", config.Filename, data)
	}
}

// Inside reborn, the move to a new address fails: the form shows the error, nothing is saved, and the step takes
// another address.
func TestAFailedMoveSavesNothing(t *testing.T) {
	listener := &fakeListener{err: errors.New("listen tcp :80: bind: permission denied")}
	_, mux := inReborn(t, listener)

	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"80"}}),
		422, "", "Host:localhost Port:80 HousekeepingPort: Error:listen tcp :80: bind: permission denied")
	if data, _ := os.ReadFile(config.Filename); string(data) != rebornConfig {
		t.Errorf("a failed move changed %s to %s", config.Filename, data)
	}

	listener.err = nil
	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"16417"}}),
		303, "http://localhost:16417/installer/config", "")
	if cfg := written(t); cfg.Reborn != (reborn.Reborn{Host: "localhost", Port: 16417}) {
		t.Errorf("%s holds reborn %+v, want the second address", config.Filename, cfg.Reborn)
	}
}

// Inside reborn, the database stays the one config.json names: the installer
// works on the handle reborn opened, and the administrator lands in it.
func TestInsideRebornTheInstallerWorksOnRebornsDatabase(t *testing.T) {
	_, mux := inReborn(t, &fakeListener{})
	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"16416"}}),
		303, "/installer/site", "")
	toAdmin(t, mux)
	expect(t, send(t, mux, "POST", "/installer/admin", adminForm), 303, "/", "")

	db, err := store.Open("habbo.db")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if installed, err := setup.Installed(t.Context(), db); err != nil || !installed {
		t.Errorf("Installed on reborn's database = %t, %v, want true", installed, err)
	}
}

// Inside reborn, the site step asks no housekeeping address: it saves the site address plus /housekeeping.
func TestOneAddressSavesHousekeepingUnderTheSite(t *testing.T) {
	i, mux := inReborn(t, &fakeListener{})
	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"16416"}}),
		303, "/installer/site", "")

	expect(t, send(t, mux, "GET", "/installer/site", nil), 200, "",
		"OneAddress:true Name:Reborn Hotel ShortName:Reborn URL:http://localhost:16416 HousekeepingURL: ")
	expect(t, send(t, mux, "POST", "/installer/site", url.Values{
		"name": {"Reborn Hotel"}, "shortName": {"Reborn"}, "url": {"https://hotel.example.com"}, "startCredits": {"500"},
	}), 303, "/installer/settings", "")

	installation, _ := i.setup.Current()
	if got := settings.String(t.Context(), store.New(installation.DB), "site.housekeepingUrl"); got != "https://hotel.example.com/housekeeping" {
		t.Errorf("site.housekeepingUrl = %q, want the site address plus /housekeeping", got)
	}
}

// A page on another site posts a form to the installer: it is refused with status 403.
func TestAFormFromAnotherSiteIsRefused(t *testing.T) {
	_, mux := mounted(t)
	post := func(site string) int {
		form := url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"18400"}}
		r := httptest.NewRequest("POST", "http://localhost:17306/installer/config", strings.NewReader(form.Encode()))
		r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		r.Header.Set("Sec-Fetch-Site", site)
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, r)
		return rec.Code
	}

	if code := post("cross-site"); code != http.StatusForbidden {
		t.Errorf("a post from another site answered %d, want 403", code)
	}
	if _, err := os.Stat(config.Filename); err == nil {
		t.Errorf("a post from another site wrote %s", config.Filename)
	}
	if code := post("same-origin"); code != http.StatusSeeOther {
		t.Errorf("a post from the installer's own page answered %d, want 303", code)
	}
}
