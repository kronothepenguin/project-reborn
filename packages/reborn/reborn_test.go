package reborn

import (
	"bufio"
	"context"
	"fmt"
	"html/template"
	"io"
	"net"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"golang.org/x/net/websocket"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/installer"
	"github.com/kronothepenguin/project-reborn/packages/server"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const timeout = 5 * time.Second

// The behaviour: reborn starts in the folder of an installed hotel, and the
// site answers at /, housekeeping at /housekeeping/ and the game on its two
// ports, on the address of the reborn section.
func TestItRunsAnInstalledHotel(t *testing.T) {
	t.Chdir(t.TempDir())
	ports := freePorts(t, 3)
	site, info, mus := ports[0], ports[1], ports[2]
	file := fmt.Sprintf(`{
		"reborn": {"host": "127.0.0.1", "port": %d},
		"server": {"info": {"host": "127.0.0.1", "port": %d}, "mus": {"host": "127.0.0.1", "port": %d}}
	}`, site, info, mus)
	if err := os.WriteFile(config.Filename, []byte(file), 0o644); err != nil {
		t.Fatal(err)
	}
	install(t)

	ctx, cancel := context.WithCancel(context.Background())
	cfg := config.Get()
	db := store.FromConfig()
	t.Cleanup(func() { db.Close() })
	c := cms.New(db, cms.WithResolver(printPage("cms")), cms.WithStatic(http.NotFoundHandler()))
	h := housekeeping.New(db, housekeeping.WithResolver(printPage("housekeeping")), housekeeping.WithStatic(http.NotFoundHandler()))
	i, err := installer.New(ctx, installer.WithResolver(printPage("installer")), installer.WithStatic(http.NotFoundHandler()))
	if err != nil {
		t.Fatalf("installer.New: %v", err)
	}
	g := server.New(db)

	stopped := make(chan error, 1)
	go func() { stopped <- New(cfg, db, c, h, i, g).Run(ctx) }()
	t.Cleanup(func() {
		cancel()
		if err := <-stopped; err != nil {
			t.Errorf("Run: %v", err)
		}
	})

	jar, err := cookiejar.New(nil)
	if err != nil {
		t.Fatal(err)
	}
	client := &http.Client{Jar: jar, Timeout: timeout}
	base := "http://127.0.0.1:" + strconv.Itoa(site)

	if body := waitForSite(t, client, base+"/", stopped); !strings.HasPrefix(body, "cms index.html") {
		t.Errorf("GET / = %q, want the CMS's index.html", body)
	}

	resp, err := client.PostForm(base+"/", url.Values{"username": {"Admin"}, "password": {"secret123"}})
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if body := get(t, client, base+"/housekeeping/"); !strings.HasPrefix(body, "housekeeping index.html") {
		t.Errorf("GET /housekeeping/ = %q, want housekeeping's index.html", body)
	}

	// The game's first message is HELLO: id 0 in two B64 characters, no body,
	// and the character 1 that ends a message.
	r := dial(t, info)
	hello := make([]byte, 3)
	if _, err := io.ReadFull(r, hello); err != nil {
		t.Fatalf("reading the info port: %v", err)
	}
	if string(hello) != "@@\x01" {
		t.Errorf("the info port sent %q first, want HELLO %q", hello, "@@\x01")
	}
}

// install makes the folder an installed hotel: the database config.json names,
// with an administrator who can enter housekeeping and manage access groups.
func install(t *testing.T) {
	t.Helper()
	db, err := store.Open(config.Get().Store.Path)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	q := store.New(db)
	userID, _, err := auth.CreateAccount(t.Context(), q, auth.Account{
		Email:        "admin@example.com",
		BornOn:       time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		IP:           "127.0.0.1",
		PasswordHash: auth.HashPassword("secret123"),
		Habbo:        auth.Habbo{Name: "Admin", Figure: "hd-180-1", Gender: "M"},
	})
	if err != nil {
		t.Fatalf("CreateAccount: %v", err)
	}
	now := time.Now().UTC()
	group, err := q.CreateAccessGroup(t.Context(), store.CreateAccessGroupParams{Name: "Staff", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatalf("CreateAccessGroup: %v", err)
	}
	for _, attribute := range []auth.Attribute{auth.HousekeepingAccess, auth.HousekeepingAccessGroups} {
		if err := q.AddAccessGroupAttribute(t.Context(), store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: string(attribute)}); err != nil {
			t.Fatalf("AddAccessGroupAttribute: %v", err)
		}
	}
	if err := q.AddAccessGroupMember(t.Context(), store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userID, GrantedAt: now}); err != nil {
		t.Fatalf("AddAccessGroupMember: %v", err)
	}
}

// printPage stands in for a program's built pages: it names the program and
// the page, so a test can tell who rendered it.
func printPage(program string) func(string) (*template.Template, error) {
	return func(name string) (*template.Template, error) {
		return template.New(name).Parse(program + " " + name)
	}
}

// freePorts holds every port it takes until it has n, so that none repeats.
func freePorts(t *testing.T, n int) []int {
	t.Helper()
	ports := make([]int, n)
	for i := range n {
		l, err := net.Listen("tcp", "127.0.0.1:0")
		if err != nil {
			t.Fatal(err)
		}
		defer l.Close()
		ports[i] = l.Addr().(*net.TCPAddr).Port
	}
	return ports
}

// waitForSite gets url once reborn listens, and fails when Run stops first.
func waitForSite(t *testing.T, client *http.Client, url string, stopped <-chan error) string {
	t.Helper()
	deadline := time.Now().Add(timeout)
	for {
		resp, err := client.Get(url)
		if err == nil {
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatal(err)
			}
			return string(body)
		}
		select {
		case err := <-stopped:
			t.Fatalf("Run stopped: %v", err)
		case <-time.After(20 * time.Millisecond):
		}
		if time.Now().After(deadline) {
			t.Fatalf("GET %s: %v", url, err)
		}
	}
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

// dial opens a WebSocket to the game listener on port.
func dial(t *testing.T, port int) *bufio.Reader {
	t.Helper()
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", strconv.Itoa(port)), timeout)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { conn.Close() })
	if err := conn.SetDeadline(time.Now().Add(timeout)); err != nil {
		t.Fatal(err)
	}
	cfg, err := websocket.NewConfig("ws://"+conn.RemoteAddr().String()+"/", "http://localhost/")
	if err != nil {
		t.Fatal(err)
	}
	ws, err := websocket.NewClient(cfg, conn)
	if err != nil {
		t.Fatal(err)
	}
	return bufio.NewReader(ws)
}
