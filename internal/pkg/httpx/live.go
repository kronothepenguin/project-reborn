package httpx

import (
	"bytes"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/fsnotify/fsnotify"
)

// LiveReload provides isolated live reload functionality for an HTTP server.
// Each instance maintains its own set of SSE channels, so multiple servers
// won't interfere with each other.
type LiveReload struct {
	pattern string

	dir string

	channels   map[chan string]struct{}
	channelsMu sync.RWMutex
}

// LiveReloadOption configures a LiveReload instance.
type LiveReloadOption func(*LiveReload)

// WithPattern sets a custom SSE endpoint pattern. Defaults to "/@dev/live".
func WithPattern(pattern string) LiveReloadOption {
	return func(lr *LiveReload) {
		lr.pattern = pattern
	}
}

func WithWatchAll(dir string) LiveReloadOption {
	return func(lr *LiveReload) {
		lr.dir = dir
	}
}

// NewLiveReload creates a new LiveReload instance. It starts a file watcher
// on the given directories and broadcasts reload events to connected clients.
//
// Pass directory paths as strings to watch them with a built-in fsnotify watcher
// that monitors .html files. Pass a Watcher to use a custom watcher implementation.
func NewLiveReload(sources []any, opts ...LiveReloadOption) *LiveReload {
	lr := &LiveReload{
		pattern:  "/@live/client",
		channels: make(map[chan string]struct{}),
	}

	for _, opt := range opts {
		opt(lr)
	}

	for _, src := range sources {
		switch v := src.(type) {
		case string:
			go lr.watchDir(v)
		case Watcher:
			go lr.watchWatcher(v)
		}
	}

	return lr
}

// Watcher is an interface for custom file watchers. Implement this to provide
// your own change detection mechanism instead of the built-in fsnotify watcher.
type Watcher interface {
	// Events returns a channel that emits file paths when changes are detected.
	Events() <-chan string
}

func (lr *LiveReload) broadcast() {
	lr.channelsMu.RLock()
	defer lr.channelsMu.RUnlock()

	for ch := range lr.channels {
		select {
		case ch <- "reload":
		default:
		}
	}
}

func (lr *LiveReload) serveSSE(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	ch := make(chan string)

	lr.channelsMu.Lock()
	lr.channels[ch] = struct{}{}
	lr.channelsMu.Unlock()

	defer func() {
		lr.channelsMu.Lock()
		delete(lr.channels, ch)
		lr.channelsMu.Unlock()
	}()

	for {
		select {
		case <-r.Context().Done():
			return
		case msg := <-ch:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			w.(http.Flusher).Flush()
		}
	}
}

func (lr *LiveReload) script() string {
	return `<script>
const eventSource = new EventSource("` + lr.pattern + `");
eventSource.onmessage = (e) => { if (e.data === "reload") location.reload(); };
</script>`
}

// Middleware returns an http.Handler that:
//   - Serves the SSE endpoint at the configured pattern.
//   - For all other routes, injects the live reload script into HTML responses.
//   - Bypasses the recorder for SSE and WebSocket connections to avoid
//     interfering with long-lived streaming responses.
func (lr *LiveReload) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Serve SSE endpoint.
		if r.URL.Path == lr.pattern {
			lr.serveSSE(w, r)
			return
		}

		// Bypass recorder for WebSocket upgrades.
		if strings.EqualFold(r.Header.Get("Upgrade"), "websocket") {
			next.ServeHTTP(w, r)
			return
		}

		// Bypass recorder for SSE requests (Accept: text/event-stream).
		if strings.Contains(r.Header.Get("Accept"), "text/event-stream") {
			next.ServeHTTP(w, r)
			return
		}

		recorder := httptest.NewRecorder()
		next.ServeHTTP(recorder, r)

		// Only inject into HTML responses.
		if strings.Contains(recorder.Header().Get("Content-Type"), "text/html") {
			script := lr.script()
			body := recorder.Body.Bytes()
			if idx := bytes.Index(body, []byte("</body>")); idx > -1 {
				buf := bytes.Replace(body, []byte("</body>"), []byte(script+"</body>"), 1)
				recorder.Body.Reset()
				recorder.Body.Write(buf)
			} else {
				recorder.Body.WriteString(script)
			}
			w.Header().Set("Content-Length", fmt.Sprint(recorder.Body.Len()))
		}

		for key, values := range recorder.Header() {
			for _, value := range values {
				w.Header().Add(key, value)
			}
		}
		w.WriteHeader(recorder.Code)
		w.Write(recorder.Body.Bytes())
	})
}

// watchDir starts a built-in fsnotify watcher on a directory, recursively
// watching for .html file changes.
func (lr *LiveReload) watchDir(dir string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalln(err)
	}
	defer watcher.Close()

	filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			watcher.Add(path)
		}
		return nil
	})

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}

			if event.Has(fsnotify.Remove) {
				info, err := os.Stat(event.Name)
				if err == nil && info.IsDir() {
					watcher.Remove(event.Name)
				}
			}

			if event.Has(fsnotify.Create) {
				info, err := os.Stat(event.Name)
				if err == nil && info.IsDir() {
					watcher.Add(event.Name)
				}
			}

			if (event.Has(fsnotify.Write) || event.Has(fsnotify.Create)) && strings.HasSuffix(event.Name, ".html") {
				log.Println("\033[32m[reload]\033[0m", event.Name)
				lr.broadcast()
			}

		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("\033[31m", err, "\033[0m")
		}
	}
}

// watchWatcher listens on a custom Watcher and broadcasts reload events.
func (lr *LiveReload) watchWatcher(w Watcher) {
	for range w.Events() {
		lr.broadcast()
	}
}
