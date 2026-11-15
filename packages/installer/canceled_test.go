package installer

import (
	"bytes"
	"context"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

// A visitor abandons a request before its answer: the program ends it quietly, and the log gains no error line.
func TestAnAbandonedRequestStaysOutOfTheLog(t *testing.T) {
	t.Chdir(t.TempDir())
	i, err := New(t.Context(), WithResolver(printData), WithStatic(http.NotFoundHandler()))
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
	form := url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"18400"}}
	r := httptest.NewRequest("POST", "/config", strings.NewReader(form.Encode()))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	if rec.Code != http.StatusSeeOther {
		t.Fatalf("writing the config answered %d", rec.Code)
	}
	var logs bytes.Buffer
	previous := slog.Default()
	slog.SetDefault(slog.New(slog.NewTextHandler(&logs, nil)))
	t.Cleanup(func() { slog.SetDefault(previous) })

	ctx, abandon := context.WithCancel(t.Context())
	abandon()
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequestWithContext(ctx, "GET", "/site", nil))

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status %d, want the request to end unanswered with 500", rec.Code)
	}
	if logs.Len() != 0 {
		t.Errorf("the log gained %q", logs.String())
	}
}
