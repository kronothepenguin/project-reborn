package housekeeping

import (
	"bytes"
	"context"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// A visitor abandons a request before its answer: the program ends it quietly, and the log gains no error line.
func TestAnAbandonedRequestStaysOutOfTheLog(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Staff", auth.HousekeepingAccess)
	var logs bytes.Buffer
	previous := slog.Default()
	slog.SetDefault(slog.New(slog.NewTextHandler(&logs, nil)))
	t.Cleanup(func() { slog.SetDefault(previous) })

	ctx, abandon := context.WithCancel(t.Context())
	abandon()
	r := httptest.NewRequestWithContext(ctx, "GET", "/housekeeping/", nil)
	r.AddCookie(cookie)
	rec := record(mux, r)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status %d, want the request to end unanswered with 500", rec.Code)
	}
	if logs.Len() != 0 {
		t.Errorf("the log gained %q", logs.String())
	}
}
