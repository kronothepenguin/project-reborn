package installer

import (
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

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/reborn"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
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

// mounted returns an installer in an empty folder, on its own mux.
func mounted(t *testing.T, opts ...Option) (*Installer, *http.ServeMux) {
	t.Helper()
	t.Chdir(t.TempDir())
	opts = append([]Option{WithResolver(printData), WithStatic(http.NotFoundHandler())}, opts...)
	i, err := New(t.Context(), opts...)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	t.Cleanup(func() {
		if installation, ok := i.setup.Current(); ok {
			installation.DB.Close()
		}
	})
	mux := http.NewServeMux()
	i.Mount(mux)
	return i, mux
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
	select {
	case <-i.Done():
		t.Fatal("Done is closed before the administrator exists")
	default:
	}

	expect(t, send(t, mux, "POST", "/installer/admin", adminForm), 303, "/", "")

	select {
	case <-i.Done():
	default:
		t.Error("Done is open after the administrator was created")
	}
	installation, _ := i.setup.Current()
	if installed, err := Installed(t.Context(), installation.DB); err != nil || !installed {
		t.Errorf("Installed = %t, %v, want true", installed, err)
	}
	if rec := send(t, mux, "GET", "/installer/done", nil); rec.Code != http.StatusNotFound {
		t.Errorf("GET /installer/done answered %d, want 404", rec.Code)
	}
}

// Inside reborn, the config step asks one host and one port: a new address moves the browser to it.
func TestOneAddressMovesTheHotel(t *testing.T) {
	listener := &fakeListener{}
	_, mux := mounted(t, WithListener(listener))

	expect(t, send(t, mux, "GET", "/installer/config", nil), 200, "",
		"OneAddress:true Written:false ConfigPath:")
	expect(t, send(t, mux, "GET", "/installer/config", nil), 200, "",
		"Path:habbo.db Host:localhost Port:16416 HousekeepingPort:")

	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "host": {"localhost"}, "port": {"16417"}}),
		303, "http://localhost:16417/installer/config", "")

	if len(listener.moves) != 1 || listener.moves[0] != "localhost 16417" {
		t.Errorf("moves %q, want one to localhost 16417", listener.moves)
	}
	data, err := os.ReadFile(config.Filename)
	if err != nil {
		t.Fatalf("read %s: %v", config.Filename, err)
	}
	var written config.Config
	if err := json.Unmarshal(data, &written); err != nil {
		t.Fatalf("decode %s: %v", config.Filename, err)
	}
	if written.Reborn != (reborn.Reborn{Host: "localhost", Port: 16417}) {
		t.Errorf("%s holds reborn %+v, want the form's address", config.Filename, written.Reborn)
	}
}

// Inside reborn, the config step asks one host and one port: the address the browser used moves nothing.
func TestOneAddressWhereTheHotelIsMovesNothing(t *testing.T) {
	listener := &fakeListener{}
	_, mux := mounted(t, WithListener(listener))

	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "host": {"localhost"}, "port": {"16416"}}),
		303, "/installer/site", "")

	if len(listener.moves) != 0 {
		t.Errorf("moves %q, want none", listener.moves)
	}
}

// Inside reborn, the config step asks one host and one port: a failed move shows in the form.
func TestAFailedMoveShowsInTheForm(t *testing.T) {
	_, mux := mounted(t, WithListener(&fakeListener{err: errors.New("listen tcp :80: bind: permission denied")}))

	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "host": {"localhost"}, "port": {"80"}}),
		422, "", "Error:listen tcp :80: bind: permission denied")
}

// Inside reborn, the site step asks no housekeeping address: it saves the site address plus /housekeeping.
func TestOneAddressSavesHousekeepingUnderTheSite(t *testing.T) {
	_, mux := mounted(t, WithListener(&fakeListener{}))
	expect(t, send(t, mux, "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "host": {"localhost"}, "port": {"16416"}}),
		303, "/installer/site", "")

	expect(t, send(t, mux, "GET", "/installer/site", nil), 200, "",
		"OneAddress:true Name:Reborn Hotel ShortName:Reborn URL:http://localhost:16416 HousekeepingURL: ")
	expect(t, send(t, mux, "POST", "/installer/site", url.Values{
		"name": {"Reborn Hotel"}, "shortName": {"Reborn"}, "url": {"https://hotel.example.com"}, "startCredits": {"500"},
	}), 303, "/installer/admin", "")

	if got := settings.GetString("site.housekeepingUrl"); got != "https://hotel.example.com/housekeeping" {
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
