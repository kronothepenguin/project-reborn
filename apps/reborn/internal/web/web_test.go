package web

import (
	"context"
	"io"
	"net"
	"net/http"
	"net/http/httptrace"
	"strconv"
	"testing"
	"time"
)

const timeout = 5 * time.Second

// freePort returns a port nothing listens on.
func freePort(t *testing.T) int {
	t.Helper()
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port
}

// says answers every request with text.
func says(text string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, text) })
}

// start serves h on a free port of 127.0.0.1 until the test ends.
func start(t *testing.T, h http.Handler) (*Server, int) {
	t.Helper()
	port := freePort(t)
	s := New("127.0.0.1", port)
	if err := s.Serve(h); err != nil {
		t.Fatalf("Serve: %v", err)
	}
	t.Cleanup(func() { s.Shutdown(context.Background()) })
	return s, port
}

var browser = &http.Client{
	Timeout:       timeout,
	CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
}

// fetch requests url and returns the status, the Location and the body.
func fetch(t *testing.T, url string) (int, string, string) {
	t.Helper()
	resp, err := browser.Get(url)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	return resp.StatusCode, resp.Header.Get("Location"), string(body)
}

func address(port int) string {
	return "http://127.0.0.1:" + strconv.Itoa(port)
}

func closed(port int) bool {
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", strconv.Itoa(port)), timeout)
	if err == nil {
		conn.Close()
	}
	return err != nil
}

// The behaviour: the runner serves the site after the installation: the same
// address answers with the new handler, on a new connection and on one opened
// before.
func TestServeAnswersWithTheNewHandlerOnTheSameAddress(t *testing.T) {
	s, port := start(t, says("installer"))
	open := &http.Client{Timeout: timeout, Transport: &http.Transport{}}
	if body, _ := get(t, open, address(port)+"/"); body != "installer" {
		t.Fatalf("GET / = %q, want the installer", body)
	}

	if err := s.Serve(says("site")); err != nil {
		t.Fatalf("Serve: %v", err)
	}

	if body, reused := get(t, open, address(port)+"/"); body != "site" || !reused {
		t.Errorf("GET / on the open connection = %q (reused %v), want the site on the same connection", body, reused)
	}
	fresh := &http.Client{Timeout: timeout, Transport: &http.Transport{DisableKeepAlives: true}}
	if body, _ := get(t, fresh, address(port)+"/"); body != "site" {
		t.Errorf("GET / on a new connection = %q, want the site", body)
	}
}

// get requests url with client, and returns the body and whether the request
// went on a connection opened before.
func get(t *testing.T, client *http.Client, url string) (string, bool) {
	t.Helper()
	var reused bool
	trace := &httptrace.ClientTrace{GotConn: func(info httptrace.GotConnInfo) { reused = info.Reused }}
	req, err := http.NewRequestWithContext(httptrace.WithClientTrace(context.Background(), trace), "GET", url, nil)
	if err != nil {
		t.Fatal(err)
	}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	return string(body), reused
}

// moving serves a handler that moves the server to the host and the port of
// the request's query, and answers the error. Without a host it answers
// "here".
func moving(s **Server) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("host") == "" {
			io.WriteString(w, "here")
			return
		}
		port, _ := strconv.Atoi(r.URL.Query().Get("port"))
		if err := (*s).Move(w, r, r.URL.Query().Get("host"), port); err != nil {
			http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		}
	})
}

// The behaviour: the installer moves the hotel to a new port: the browser is
// sent to the same path there, the new port answers and the old one closes.
func TestMoveAnswersOnTheNewPort(t *testing.T) {
	var s *Server
	s, port := start(t, moving(&s))
	next := freePort(t)

	status, location, _ := fetch(t, address(port)+"/installer/config?host=127.0.0.1&port="+strconv.Itoa(next))

	if status != http.StatusSeeOther || location != address(next)+"/installer/config" {
		t.Fatalf("Move answered %d to %q, want 303 to %s/installer/config", status, location, address(next))
	}
	if _, _, body := fetch(t, address(next)+"/"); body != "here" {
		t.Errorf("the new port answered %q", body)
	}
	deadline := time.Now().Add(timeout)
	for !closed(port) {
		if time.Now().After(deadline) {
			t.Fatalf("the old port %d still listens", port)
		}
		time.Sleep(20 * time.Millisecond)
	}
}

// The behaviour: the installer moves the hotel to every interface on a new
// port: the browser keeps its host name, and the new port answers.
func TestMoveToEveryInterfaceKeepsTheHostName(t *testing.T) {
	var s *Server
	s, port := start(t, moving(&s))
	next := freePort(t)

	status, location, _ := fetch(t, address(port)+"/installer/config?host=0.0.0.0&port="+strconv.Itoa(next))

	if status != http.StatusSeeOther || location != address(next)+"/installer/config" {
		t.Fatalf("Move answered %d to %q, want 303 to %s/installer/config", status, location, address(next))
	}
	if _, _, body := fetch(t, address(next)+"/"); body != "here" {
		t.Errorf("the new port answered %q", body)
	}
}

// The behaviour: the installer saves the port the hotel holds, with another
// host: the server stays, and the browser is sent to the same path on the same
// address.
func TestAMoveToTheSamePortKeepsTheServer(t *testing.T) {
	var s *Server
	s, port := start(t, moving(&s))
	s.mu.Lock()
	before := s.srv
	s.mu.Unlock()

	status, location, _ := fetch(t, address(port)+"/installer/config?host=0.0.0.0&port="+strconv.Itoa(port))

	if status != http.StatusSeeOther || location != "/installer/config" {
		t.Fatalf("Move answered %d to %q, want 303 to /installer/config", status, location)
	}
	s.mu.Lock()
	after := s.srv
	s.mu.Unlock()
	if after != before {
		t.Error("Move to the same port started a new server")
	}
	if _, _, body := fetch(t, address(port)+"/"); body != "here" {
		t.Errorf("after the move the port answered %q", body)
	}
}

// The behaviour: the new address is taken: Move returns the error, the
// browser gets no redirect, and the hotel answers where it was.
func TestAMoveToATakenAddressLeavesTheHotelWhereItWas(t *testing.T) {
	taken, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer taken.Close()
	var s *Server
	s, port := start(t, moving(&s))
	takenPort := taken.Addr().(*net.TCPAddr).Port

	status, location, body := fetch(t, address(port)+"/installer/config?host=127.0.0.1&port="+strconv.Itoa(takenPort))

	if status != http.StatusUnprocessableEntity || location != "" {
		t.Fatalf("Move answered %d to %q (%q), want the error", status, location, body)
	}
	if _, _, body := fetch(t, address(port)+"/"); body != "here" {
		t.Errorf("after a failed move the hotel answered %q", body)
	}
}

// The behaviour: the runner shuts the server down: an open request finishes,
// and the port closes.
func TestShutdownLetsTheOpenRequestsFinish(t *testing.T) {
	started := make(chan struct{})
	s, port := start(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		close(started)
		time.Sleep(200 * time.Millisecond)
		io.WriteString(w, "finished")
	}))
	answered := make(chan string, 1)
	go func() {
		resp, err := browser.Get(address(port) + "/")
		if err != nil {
			answered <- err.Error()
			return
		}
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		answered <- string(body)
	}()
	<-started

	if err := s.Shutdown(context.Background()); err != nil {
		t.Fatalf("Shutdown: %v", err)
	}

	if body := <-answered; body != "finished" {
		t.Errorf("the open request got %q, want it finished", body)
	}
	if !closed(port) {
		t.Error("the port still listens after Shutdown")
	}
}
