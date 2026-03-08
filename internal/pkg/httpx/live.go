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
	"time"

	"github.com/fsnotify/fsnotify"
)

// liveReload provides isolated live reload functionality for an HTTP server.
// Each instance maintains its own set of SSE channels, so multiple servers
// won't interfere with each other.
type liveReload struct {
	pattern string

	channels   map[chan string]struct{}
	channelsMu sync.RWMutex
}

// LiveReloadOption configures a LiveReload instance.
type LiveReloadOption func(*liveReload)

// WithPattern sets a custom SSE endpoint pattern. Defaults to "/@dev/live".
func WithPattern(pattern string) LiveReloadOption {
	return func(lr *liveReload) {
		lr.pattern = pattern
	}
}

func WithWatchAll(dir string) LiveReloadOption {
	return func(lr *liveReload) {
		go lr.watchAll(dir)
	}
}

func (lr *liveReload) broadcast() {
	lr.channelsMu.RLock()
	defer lr.channelsMu.RUnlock()

	for ch := range lr.channels {
		select {
		case ch <- "reload":
		default:
		}
	}
}

func (lr *liveReload) serveSSE(w http.ResponseWriter, r *http.Request) {
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

func (lr *liveReload) script() string {
	return `<script>
const eventSource = new EventSource("` + lr.pattern + `");
eventSource.onmessage = (e) => { if (e.data === "reload") location.reload(); };
</script>`
}

func (lr *liveReload) watchAll(dir string) {
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

	var debounce *time.Timer

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

			if event.Has(fsnotify.Write) || event.Has(fsnotify.Create) {
				if debounce != nil {
					debounce.Stop()
				}
				debounce = time.AfterFunc(50*time.Millisecond, func() {
					log.Println("\033[32m[reload]\033[0m", event.Name)
					lr.broadcast()
				})
			}

		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("\033[31m", err, "\033[0m")
		}
	}
}

func LiveReload(opts ...LiveReloadOption) func(http.Handler) http.Handler {
	lr := &liveReload{
		pattern: "/@live/client",

		channels: make(map[chan string]struct{}),
	}

	for _, opt := range opts {
		opt(lr)
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == lr.pattern {
				lr.serveSSE(w, r)
				return
			}

			if strings.EqualFold(r.Header.Get("Upgrade"), "websocket") {
				next.ServeHTTP(w, r)
				return
			}

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
			recorder.Body.WriteTo(w)
		})
	}
}
