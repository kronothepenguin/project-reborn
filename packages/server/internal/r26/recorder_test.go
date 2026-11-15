package r26

import (
	"context"
	"log/slog"
	"slices"
	"sync"
	"testing"
	"time"
)

// recorder is a slog.Handler that keeps the message of every record, for the tests to wait for.
type recorder struct {
	mu    sync.Mutex
	lines []string
	added chan struct{}
}

func newRecorder() *recorder {
	return &recorder{added: make(chan struct{}, 1)}
}

func (r *recorder) Enabled(context.Context, slog.Level) bool { return true }

func (r *recorder) Handle(_ context.Context, rec slog.Record) error {
	r.mu.Lock()
	r.lines = append(r.lines, rec.Message)
	r.mu.Unlock()
	select {
	case r.added <- struct{}{}:
	default:
	}
	return nil
}

func (r *recorder) WithAttrs([]slog.Attr) slog.Handler { return r }

func (r *recorder) WithGroup(string) slog.Handler { return r }

func (r *recorder) all() []string {
	r.mu.Lock()
	defer r.mu.Unlock()
	return slices.Clone(r.lines)
}

// wait returns once want is logged, and fails the test when it is not within the timeout.
func (r *recorder) wait(t *testing.T, want string) {
	t.Helper()
	deadline := time.After(timeout)
	for !slices.Contains(r.all(), want) {
		select {
		case <-r.added:
		case <-deadline:
			t.Fatalf("not logged: %q\nlogged: %q", want, r.all())
		}
	}
}
