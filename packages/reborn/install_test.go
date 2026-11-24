package reborn

import (
	"bytes"
	"context"
	"net"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// newHotel builds reborn on an empty database of its own, as the runner does
// in an empty folder, and serves h on an httptest server whose handler the
// test replaces, as the runner gives its server a new handler.
func newHotel(t *testing.T) (*Reborn, *httptest.Server, *atomic.Pointer[http.Handler]) {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	r, err := build(db)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	var current atomic.Pointer[http.Handler]
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		(*current.Load()).ServeHTTP(w, req)
	}))
	t.Cleanup(srv.Close)
	return r, srv, &current
}

// serve makes h the handler of the hotel's address.
func serve(current *atomic.Pointer[http.Handler], h http.Handler) {
	current.Store(&h)
}

// The behaviour: a hotel is not installed, every page of the site and of
// housekeeping sends the browser to /installer/, the installer's pages answer
// under /installer/, and files and the dev server's own paths are served.
func TestANewHotelSendsPagesToTheInstaller(t *testing.T) {
	r, srv, current := newHotel(t)
	if r.Installed() {
		t.Fatal("Installed on an empty database")
	}
	mux := http.NewServeMux()
	r.MountInstaller(mux)
	serve(current, mux)

	browser := noRedirects(nil)
	for _, path := range []string{"/", "/me", "/housekeeping/", "/housekeeping/settings"} {
		answers(t, browser, "GET", srv.URL+path, nil, http.StatusSeeOther, "/installer/", "")
	}
	answers(t, browser, "POST", srv.URL+"/logout", nil, http.StatusSeeOther, "/installer/", "")
	answers(t, browser, "GET", srv.URL+"/installer/", nil, http.StatusOK, "", "page installer/index.html")
	answers(t, browser, "GET", srv.URL+"/installer/config", nil, http.StatusOK, "", "page installer/config.html")
	for _, file := range []string{"/favicon.svg", "/_astro/admin.css", "/@vite/client", "/@fs/packages/installer/src/styles/global.css", "/installer/favicon.svg"} {
		answers(t, browser, "GET", srv.URL+file, nil, http.StatusOK, "", "file "+file)
	}
}

// The behaviour: a new hotel is installed. After "Create administrator" the
// wait for the installation returns, the browser lands on the site, and the
// site and housekeeping answer on the same address with /installer/ gone.
func TestANewHotelIsInstalledAndTheSiteAnswers(t *testing.T) {
	r, srv, current := newHotel(t)
	installing := http.NewServeMux()
	r.MountInstaller(installing)
	serve(current, installing)
	waited := make(chan error, 1)
	go func() { waited <- r.WaitForInstall(t.Context()) }()

	jar, err := cookiejar.New(nil)
	if err != nil {
		t.Fatal(err)
	}
	browser := noRedirects(jar)
	answers(t, browser, "POST", srv.URL+"/installer/config", url.Values{"host": {"127.0.0.1"}, "port": {strconv.Itoa(hotel.port)}},
		http.StatusSeeOther, "/installer/site", "")
	answers(t, browser, "POST", srv.URL+"/installer/site", url.Values{
		"name": {"Reborn Hotel"}, "shortName": {"Reborn"}, "url": {srv.URL}, "startCredits": {"500"},
	}, http.StatusSeeOther, "/installer/settings", "")
	answers(t, browser, "POST", srv.URL+"/installer/settings", url.Values{"action": {"skip"}},
		http.StatusSeeOther, "/installer/client", "")
	answers(t, browser, "POST", srv.URL+"/installer/client", url.Values{"action": {"skip"}},
		http.StatusSeeOther, "/installer/admin", "")
	select {
	case err := <-waited:
		t.Fatalf("WaitForInstall returned %v before the administrator exists", err)
	default:
	}
	answers(t, browser, "POST", srv.URL+"/installer/admin", url.Values{
		"name": {"Founder"}, "email": {"founder@example.com"}, "bornOn": {"1990-05-01"},
		"password": {"secret123"}, "passwordConfirm": {"secret123"}, "club": {"on"}, "credits": {"5000"},
	}, http.StatusSeeOther, "/", "")
	if err := <-waited; err != nil {
		t.Fatalf("WaitForInstall = %v, want nil", err)
	}
	if !r.Installed() {
		t.Error("not Installed after the administrator was created")
	}
	// The browser's request for / may come before the runner replaces the
	// installer's mux: that mux answers it with the site.
	answers(t, browser, "GET", srv.URL+"/", nil, http.StatusOK, "", "page index.html")

	site := http.NewServeMux()
	r.Mount(site)
	serve(current, site)
	answers(t, browser, "GET", srv.URL+"/", nil, http.StatusOK, "", "page index.html")
	post(t, &http.Client{Jar: jar, Timeout: timeout}, srv.URL+"/", url.Values{"username": {"Founder"}, "password": {"secret123"}})
	answers(t, browser, "GET", srv.URL+"/housekeeping/", nil, http.StatusOK, "", "page housekeeping/index.html")
	answers(t, browser, "GET", srv.URL+"/installer/", nil, http.StatusNotFound, "", "")
}

// The behaviour: an installed hotel answers 404 under /installer/, the
// installer's built pages included.
func TestAnInstalledHotelAnswers404UnderInstaller(t *testing.T) {
	client := noRedirects(nil)
	for _, path := range []string{"/installer/", "/installer/config", "/installer/admin", "/installer", "/installer/index.html", "/installer/config.html"} {
		answers(t, client, "GET", hotel.site+path, nil, http.StatusNotFound, "", "")
	}
	answers(t, client, "POST", hotel.site+"/installer/admin", url.Values{"name": {"Intruder"}}, http.StatusNotFound, "", "")
}

// The behaviour: the game cannot open its doors, and Start returns its error.
func TestStartReturnsTheGamesError(t *testing.T) {
	r, _, _ := newHotel(t)

	// The installed hotel holds the game's ports.
	err := r.Start(t.Context())

	if err == nil {
		r.Stop(context.Background())
		t.Fatal("Start = nil while another game holds its ports, want the error")
	}
	if !strings.Contains(err.Error(), strconv.Itoa(hotel.info)) {
		t.Errorf("Start = %v, want the error of the info port %d", err, hotel.info)
	}
}

func noRedirects(jar http.CookieJar) *http.Client {
	return &http.Client{
		Jar:           jar,
		Timeout:       timeout,
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
	}
}

// answers sends a request and expects its status, its Location and a part of
// its body.
func answers(t *testing.T, client *http.Client, method, target string, form url.Values, status int, location, body string) {
	t.Helper()
	var resp *http.Response
	var err error
	if method == "POST" {
		resp, err = client.PostForm(target, form)
	} else {
		resp, err = client.Get(target)
	}
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	var got bytes.Buffer
	got.ReadFrom(resp.Body)
	if resp.StatusCode != status || resp.Header.Get("Location") != location || !strings.Contains(got.String(), body) {
		t.Fatalf("%s %s = %d to %q, %q; want %d to %q with %q", method, target, resp.StatusCode, resp.Header.Get("Location"), got.String(), status, location, body)
	}
}

// refuses checks that nothing listens on port.
func refuses(t *testing.T, port int) {
	t.Helper()
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", strconv.Itoa(port)), timeout)
	if err == nil {
		conn.Close()
		t.Errorf("%d listens", port)
	}
}
