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
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/installer"
	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const timeout = 5 * time.Second

// hotel is the installed hotel every test of the package visits: reborn runs it
// on free ports, in a folder of its own, with the programs built and injected as
// the runner does. config.Get loads config.json once per process, so the hotel
// starts once.
var hotel struct {
	db   *sql.DB
	site string
	info int
}

// newHotelEnv makes the test binary run reborn in its working directory
// instead of the tests, until an interrupt: a test that installs a new hotel
// starts it so, because config.Get loads config.json once per process.
const newHotelEnv = "REBORN_TEST_NEW_HOTEL"

func TestMain(m *testing.M) {
	if os.Getenv(newHotelEnv) != "" {
		ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
		defer stop()
		if err := runHotel(ctx); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		os.Exit(0)
	}
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

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	db := store.FromConfig()
	defer db.Close()
	r, err := build(ctx, db)
	if err != nil {
		return 0, err
	}

	release()
	stopped := make(chan error, 1)
	go func() { stopped <- r.Run(ctx) }()
	hotel.db, hotel.site, hotel.info = db, "http://127.0.0.1:"+strconv.Itoa(site), info
	if err := waitForSite(hotel.site+"/", stopped); err != nil {
		return 0, err
	}

	code := m.Run()
	cancel()
	if err := <-stopped; err != nil {
		return code, fmt.Errorf("Run: %w", err)
	}
	return code, nil
}

// build builds the programs on db and injects them as the runner does, with
// pages and static files that print their names.
func build(ctx context.Context, db *sql.DB) (*Reborn, error) {
	c := cms.New(db, cms.WithResolver(printPage("cms")), cms.WithStatic(printFile("cms")))
	h := housekeeping.New(db, housekeeping.WithResolver(printPage("housekeeping")), housekeeping.WithStatic(printFile("housekeeping")))
	i, err := installer.New(ctx, db, installer.WithResolver(printPage("installer")), installer.WithStatic(printFile("installer")))
	if err != nil {
		return nil, fmt.Errorf("installer.New: %w", err)
	}
	g := server.New(db)
	c.Inject(cms.Services{Habbos: g})
	h.Inject(housekeeping.Services{Habbos: g})
	r := New(config.Get(), db, c, h, i, g)
	i.Inject(installer.Services{Listener: r})
	return r, nil
}

// runHotel runs reborn in the working directory until ctx ends, as the runner
// does.
func runHotel(ctx context.Context) error {
	db := store.FromConfig()
	defer db.Close()
	r, err := build(ctx, db)
	if err != nil {
		return err
	}
	return r.Run(ctx)
}

// The behaviour: reborn starts in the folder of an installed hotel, and the
// site answers at /, housekeeping at /housekeeping/ and the game on its two
// ports, on the address of the reborn section.
func TestItRunsAnInstalledHotel(t *testing.T) {
	if body := get(t, &http.Client{Timeout: timeout}, hotel.site+"/"); !strings.HasPrefix(body, "cms index.html") {
		t.Errorf("GET / = %q, want the CMS's index.html", body)
	}

	client := signIn(t, "Admin")
	if body := get(t, client, hotel.site+"/housekeeping/"); !strings.HasPrefix(body, "housekeeping index.html") {
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

// printPage stands in for a program's built pages: it names the program and
// the page, so a test can tell who rendered it.
func printPage(program string) func(string) (*template.Template, error) {
	return func(name string) (*template.Template, error) {
		return template.New(name).Parse(program + " " + name)
	}
}

// printFile stands in for a program's static handler: it answers every path
// with the program's name and the path, so a test can tell who served it.
func printFile(program string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		io.WriteString(w, program+" file "+r.URL.Path)
	})
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

// waitForSite waits until reborn answers url, and fails when Run stops first.
func waitForSite(url string, stopped <-chan error) error {
	client := &http.Client{Timeout: timeout}
	deadline := time.Now().Add(timeout)
	for {
		resp, err := client.Get(url)
		if err == nil {
			resp.Body.Close()
			return nil
		}
		select {
		case err := <-stopped:
			return fmt.Errorf("Run stopped: %w", err)
		case <-time.After(20 * time.Millisecond):
		}
		if time.Now().After(deadline) {
			return fmt.Errorf("GET %s: %w", url, err)
		}
	}
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
	if body := get(t, client, hotel.site+"/me"); !strings.HasPrefix(body, "cms me.html") {
		t.Fatalf("after signing in %s, GET /me = %q, want the CMS's me.html", name, body)
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
