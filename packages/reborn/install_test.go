package reborn

import (
	"bytes"
	"fmt"
	"net"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
)

// The behaviour: from an empty folder, reborn serves the installer at
// /installer/ and redirects every route of the programs there. A new port in the config
// step moves the browser to it and closes the old one. After "Create
// administrator" the browser lands on the site at /, /installer/ answers 404,
// housekeeping answers at /housekeeping/ and the game on its two ports.
//
// The folder holds only a config.json with free ports, and the test binary
// runs reborn there in a process of its own (newHotelEnv).
func TestItInstallsANewHotel(t *testing.T) {
	ports, release, err := freePorts(4)
	if err != nil {
		t.Fatal(err)
	}
	first, moved, info, mus := ports[0], ports[1], ports[2], ports[3]
	dir := t.TempDir()
	file := fmt.Sprintf(`{
		"reborn": {"host": "127.0.0.1", "port": %d},
		"server": {"info": {"host": "127.0.0.1", "port": %d}, "mus": {"host": "127.0.0.1", "port": %d}}
	}`, first, info, mus)
	if err := os.WriteFile(dir+"/"+config.Filename, []byte(file), 0o644); err != nil {
		t.Fatal(err)
	}
	release()
	startHotel(t, dir, first)

	jar, err := cookiejar.New(nil)
	if err != nil {
		t.Fatal(err)
	}
	browser := &http.Client{
		Jar:           jar,
		Timeout:       timeout,
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
	}
	site := "http://127.0.0.1:" + strconv.Itoa(first)

	for _, path := range []string{"/", "/me", "/housekeeping/"} {
		answers(t, browser, "GET", site+path, nil, http.StatusSeeOther, "/installer/", "")
	}
	answers(t, browser, "GET", site+"/installer/", nil, http.StatusOK, "", "installer index.html")
	refuses(t, info)
	refuses(t, mus)

	// On every interface and the same port, the browser keeps its host name.
	answers(t, browser, "POST", site+"/installer/config", url.Values{"host": {"0.0.0.0"}, "port": {strconv.Itoa(first)}},
		http.StatusSeeOther, site+"/installer/config", "")
	answers(t, browser, "GET", site+"/installer/config", nil, http.StatusOK, "", "installer config.html")

	// A new port moves the browser there and closes the old one.
	next := "http://127.0.0.1:" + strconv.Itoa(moved)
	answers(t, browser, "POST", site+"/installer/config", url.Values{"host": {"127.0.0.1"}, "port": {strconv.Itoa(moved)}},
		http.StatusSeeOther, next+"/installer/config", "")
	closes(t, first)
	answers(t, browser, "POST", next+"/installer/config", url.Values{"host": {"127.0.0.1"}, "port": {strconv.Itoa(moved)}},
		http.StatusSeeOther, "/installer/site", "")
	answers(t, browser, "POST", next+"/installer/site", url.Values{
		"name": {"Reborn Hotel"}, "shortName": {"Reborn"}, "url": {next}, "startCredits": {"500"},
	}, http.StatusSeeOther, "/installer/admin", "")
	refuses(t, info)
	answers(t, browser, "POST", next+"/installer/admin", url.Values{
		"name": {"Founder"}, "email": {"founder@example.com"}, "bornOn": {"1990-05-01"},
		"password": {"secret123"}, "passwordConfirm": {"secret123"},
	}, http.StatusSeeOther, "/", "")

	answers(t, browser, "GET", next+"/", nil, http.StatusOK, "", "cms index.html")
	answers(t, browser, "GET", next+"/installer/", nil, http.StatusNotFound, "", "")
	answers(t, browser, "GET", next+"/installer/config", nil, http.StatusNotFound, "", "")
	post(t, &http.Client{Jar: jar, Timeout: timeout}, next+"/", url.Values{"username": {"Founder"}, "password": {"secret123"}})
	answers(t, browser, "GET", next+"/housekeeping/", nil, http.StatusOK, "", "housekeeping index.html")
	if id, body := dialGame(t, info).receive(t); id != 0 || body != "" {
		t.Errorf("the info port sent %d %q first, want HELLO", id, body)
	}
	waitFor(t, mus, timeout)
}

// The behaviour: a hotel is not installed, every page of the site and of
// housekeeping sends the browser to /installer/, and files and the dev
// server's own paths are served.
func TestFilesAreServedBeforeTheInstall(t *testing.T) {
	ports, release, err := freePorts(3)
	if err != nil {
		t.Fatal(err)
	}
	port, info, mus := ports[0], ports[1], ports[2]
	dir := t.TempDir()
	file := fmt.Sprintf(`{
		"reborn": {"host": "127.0.0.1", "port": %d},
		"server": {"info": {"host": "127.0.0.1", "port": %d}, "mus": {"host": "127.0.0.1", "port": %d}}
	}`, port, info, mus)
	if err := os.WriteFile(dir+"/"+config.Filename, []byte(file), 0o644); err != nil {
		t.Fatal(err)
	}
	release()
	startHotel(t, dir, port)

	browser := &http.Client{Timeout: timeout, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	site := "http://127.0.0.1:" + strconv.Itoa(port)
	for _, path := range []string{"/", "/me", "/housekeeping/", "/housekeeping/settings"} {
		answers(t, browser, "GET", site+path, nil, http.StatusSeeOther, "/installer/", "")
	}
	answers(t, browser, "POST", site+"/logout", nil, http.StatusSeeOther, "/installer/", "")
	answers(t, browser, "GET", site+"/favicon.svg", nil, http.StatusOK, "", "cms file /favicon.svg")
	answers(t, browser, "GET", site+"/@vite/client", nil, http.StatusOK, "", "cms file /@vite/client")
	answers(t, browser, "GET", site+"/@fs/packages/installer/src/styles/global.css", nil, http.StatusOK, "",
		"cms file /@fs/packages/installer/src/styles/global.css")
}

// The behaviour: an installed hotel runs under reborn, and /installer/ answers
// 404.
func TestAnInstalledHotelAnswers404UnderInstaller(t *testing.T) {
	client := &http.Client{Timeout: timeout, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	for _, path := range []string{"/installer/", "/installer/config", "/installer/admin", "/installer"} {
		answers(t, client, "GET", hotel.site+path, nil, http.StatusNotFound, "", "")
	}
	answers(t, client, "POST", hotel.site+"/installer/admin", url.Values{"name": {"Intruder"}}, http.StatusNotFound, "", "")
}

// startHotel runs reborn in dir, in a process of its own, until the test ends,
// and waits until it listens on port. A process built with -race starts slowly.
func startHotel(t *testing.T, dir string, port int) {
	t.Helper()
	cmd := exec.Command(os.Args[0], "-test.run=^$")
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), newHotelEnv+"=1")
	var log bytes.Buffer
	cmd.Stdout, cmd.Stderr = &log, &log
	if err := cmd.Start(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		cmd.Process.Signal(os.Interrupt)
		if err := cmd.Wait(); err != nil {
			t.Errorf("reborn ended with %v\n%s", err, log.String())
		}
		if t.Failed() {
			t.Logf("reborn's log:\n%s", log.String())
		}
	})
	waitFor(t, port, 30*time.Second)
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

func dial(port int) error {
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", strconv.Itoa(port)), timeout)
	if err == nil {
		conn.Close()
	}
	return err
}

// waitFor waits until something listens on port.
func waitFor(t *testing.T, port int, wait time.Duration) {
	t.Helper()
	deadline := time.Now().Add(wait)
	for dial(port) != nil {
		if time.Now().After(deadline) {
			t.Fatalf("nothing listens on %d", port)
		}
		time.Sleep(20 * time.Millisecond)
	}
}

// closes waits until nothing listens on port.
func closes(t *testing.T, port int) {
	t.Helper()
	deadline := time.Now().Add(timeout)
	for dial(port) == nil {
		if time.Now().After(deadline) {
			t.Fatalf("%d still listens", port)
		}
		time.Sleep(20 * time.Millisecond)
	}
}

// refuses checks that nothing listens on port.
func refuses(t *testing.T, port int) {
	t.Helper()
	if dial(port) == nil {
		t.Errorf("%d listens before the hotel is installed", port)
	}
}
