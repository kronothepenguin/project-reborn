package reborn

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"html/template"
	"io"
	"net"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const timeout = 5 * time.Second

// hotel is the installed hotel every test of the package visits: reborn built
// on a database with an administrator, in a folder of its own, its site and
// housekeeping mounted on an httptest server and its game started on free
// ports. config.Get loads config.json once per process, so the hotel is built
// once.
var hotel struct {
	db     *sql.DB
	reborn *Reborn
	site   string
	info   int
	port   int
}

func TestMain(m *testing.M) {
	code, err := run(m)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		code = 1
	}
	os.Exit(code)
}

func run(m *testing.M) (int, error) {
	dir, err := os.MkdirTemp("", "reborn-test-")
	if err != nil {
		return 0, err
	}
	defer os.RemoveAll(dir)
	if err := os.Chdir(dir); err != nil {
		return 0, err
	}

	ports, release, err := freePorts(3)
	if err != nil {
		return 0, err
	}
	site, info, mus := ports[0], ports[1], ports[2]
	file := fmt.Sprintf(`{
		"reborn": {"host": "127.0.0.1", "port": %d},
		"server": {"info": {"host": "127.0.0.1", "port": %d}, "mus": {"host": "127.0.0.1", "port": %d}}
	}`, site, info, mus)
	if err := os.WriteFile(config.Filename, []byte(file), 0o644); err != nil {
		return 0, err
	}
	if err := install(); err != nil {
		return 0, err
	}

	db := store.FromConfig()
	defer db.Close()
	r, err := build(db)
	if err != nil {
		return 0, err
	}
	mux := http.NewServeMux()
	r.Mount(mux)
	srv := httptest.NewServer(mux)
	defer srv.Close()
	release()
	if err := r.Start(context.Background()); err != nil {
		return 0, fmt.Errorf("Start: %w", err)
	}
	hotel.db, hotel.reborn, hotel.site, hotel.info, hotel.port = db, r, srv.URL, info, site

	code := m.Run()
	if err := r.Stop(context.Background()); err != nil {
		return code, fmt.Errorf("Stop: %w", err)
	}
	return code, nil
}

// build builds reborn on db as the runner does, with pages and files that
// print their names, and a mover that redirects to the new address.
func build(db *sql.DB) (*Reborn, error) {
	return New(db, mover{}, WithResolver(printPage), WithStatic(http.HandlerFunc(printFile)))
}

// mover answers like the runner's server: a redirect to the same path on the
// new address.
type mover struct{}

func (mover) Move(w http.ResponseWriter, r *http.Request, host string, port int) error {
	http.Redirect(w, r, "http://"+net.JoinHostPort(host, strconv.Itoa(port))+r.URL.Path, http.StatusSeeOther)
	return nil
}

// The behaviour: an installed hotel serves the site at / and housekeeping at
// /housekeeping/ from the one resolver, each site's pages under its base, and
// the game answers on its port.
func TestItRunsAnInstalledHotel(t *testing.T) {
	if body := get(t, &http.Client{Timeout: timeout}, hotel.site+"/"); !strings.HasPrefix(body, "page index.html") {
		t.Errorf("GET / = %q, want the site's index.html", body)
	}

	client := signIn(t, "Admin")
	if body := get(t, client, hotel.site+"/housekeeping/"); !strings.HasPrefix(body, "page housekeeping/index.html") {
		t.Errorf("GET /housekeeping/ = %q, want housekeeping's index.html", body)
	}

	// The game's first message is HELLO: id 0 and no body.
	if id, body := dialGame(t, hotel.info).receive(t); id != 0 || body != "" {
		t.Errorf("the info port sent %d %q first, want HELLO", id, body)
	}
}

// install makes the folder an installed hotel: the database config.json names,
// with an administrator who can enter housekeeping, manage access groups and
// edit habbos, at level 1, above every habbo without a group.
func install() error {
	db, err := store.Open(config.Get().Store.Path)
	if err != nil {
		return err
	}
	defer db.Close()
	ctx := context.Background()
	q := store.New(db)
	userID, _, err := auth.CreateAccount(ctx, q, auth.Account{
		Email:        "admin@example.com",
		BornOn:       time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		IP:           "127.0.0.1",
		PasswordHash: auth.HashPassword("secret123"),
		Habbo:        auth.Habbo{Name: "Admin", Figure: "hd-180-1", Gender: "M"},
	})
	if err != nil {
		return fmt.Errorf("CreateAccount: %w", err)
	}
	now := time.Now().UTC()
	group, err := q.CreateAccessGroup(ctx, store.CreateAccessGroupParams{Name: "Staff", Level: 1, CreatedAt: now, UpdatedAt: now})
	if err != nil {
		return fmt.Errorf("CreateAccessGroup: %w", err)
	}
	attributes := []auth.Attribute{auth.HousekeepingAccess, auth.HousekeepingAccessGroups, auth.HousekeepingUsers, auth.HousekeepingUsersEdit}
	for _, attribute := range attributes {
		if err := q.AddAccessGroupAttribute(ctx, store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: string(attribute)}); err != nil {
			return fmt.Errorf("AddAccessGroupAttribute: %w", err)
		}
	}
	if err := q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userID, GrantedAt: now}); err != nil {
		return fmt.Errorf("AddAccessGroupMember: %w", err)
	}
	return nil
}

// printPage stands in for the pages of reborn's dist: it names the page, so a
// test can tell which one rendered.
func printPage(name string) (*template.Template, error) {
	return template.New(name).Parse("page " + name)
}

// printFile stands in for the files of reborn's dist: it answers every path
// with the path, so a test can tell which file was asked.
func printFile(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "file "+r.URL.Path)
}

// freePorts holds every port it takes until it has n, so that none repeats,
// and until release.
func freePorts(n int) (ports []int, release func(), err error) {
	var held []net.Listener
	release = func() {
		for _, l := range held {
			l.Close()
		}
	}
	for range n {
		l, err := net.Listen("tcp", "127.0.0.1:0")
		if err != nil {
			release()
			return nil, nil, err
		}
		held = append(held, l)
		ports = append(ports, l.Addr().(*net.TCPAddr).Port)
	}
	return ports, release, nil
}

// signIn signs the habbo name in on the site, with the password secret123, and
// returns the client that holds its session.
func signIn(t *testing.T, name string) *http.Client {
	t.Helper()
	jar, err := cookiejar.New(nil)
	if err != nil {
		t.Fatal(err)
	}
	client := &http.Client{Jar: jar, Timeout: timeout}
	post(t, client, hotel.site+"/", url.Values{"username": {name}, "password": {"secret123"}})
	if body := get(t, client, hotel.site+"/me"); !strings.HasPrefix(body, "page me.html") {
		t.Fatalf("after signing in %s, GET /me = %q, want the site's me.html", name, body)
	}
	return client
}

// post sends form to url and returns the status of the last answer.
func post(t *testing.T, client *http.Client, url string, form url.Values) int {
	t.Helper()
	resp, err := client.PostForm(url, form)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if _, err := io.Copy(io.Discard, resp.Body); err != nil && !errors.Is(err, io.EOF) {
		t.Fatal(err)
	}
	return resp.StatusCode
}

func get(t *testing.T, client *http.Client, url string) string {
	t.Helper()
	resp, err := client.Get(url)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	return string(body)
}
