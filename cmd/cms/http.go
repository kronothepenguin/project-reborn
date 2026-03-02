package main

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"
)

var channels map[chan string]struct{} = map[chan string]struct{}{}
var channelsMu sync.RWMutex

var liveReloadPattern = "/__cms/dev/live"
var liveReloadScript = `<script>
const eventSource = new EventSource("` + liveReloadPattern + `");
eventSource.onmessage = (e) => { if (e.data === "reload") location.reload(); };
</script>`

func broadcast(name string) {
	channelsMu.RLock()
	defer channelsMu.RUnlock()

	for ch := range channels {
		select {
		case ch <- "reload":

		default:
		}
	}
}

func liveReload(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	ch := make(chan string)

	channelsMu.Lock()
	channels[ch] = struct{}{}
	channelsMu.Unlock()

	defer func() {
		channelsMu.Lock()
		delete(channels, ch)
		channelsMu.Unlock()
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

func injectLiveReloadScript(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		recorder := httptest.NewRecorder()
		next.ServeHTTP(recorder, r)

		if strings.Contains(recorder.Header().Get("Content-Type"), "text/html") {
			index := bytes.Index(recorder.Body.Bytes(), []byte("</body>"))
			if index > -1 {
				buf := bytes.Replace(recorder.Body.Bytes(), []byte("</body>"), []byte(liveReloadScript), 1)
				recorder.Body.Reset()
				recorder.Body.Write(buf)
				recorder.Body.WriteString("</body>")
			} else {
				recorder.Body.WriteString(liveReloadScript)
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

func start(server *http.Server) {
	mux := http.NewServeMux()
	mux.HandleFunc(liveReloadPattern, liveReload)
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServerFS(os.DirFS("./internal/pkg/static"))))
	mux.Handle("/", injectLiveReloadScript(server.Handler))
	server.Handler = mux

	go func() {
		log.Printf("Starting HTTP server at http://%s\n", server.Addr)
		if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalln(err)
		}
	}()

	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)
	<-sigchan

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalln(err)
	}
}
