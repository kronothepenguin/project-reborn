package auth

import (
	"net/http/httptest"
	"slices"
	"testing"
	"time"
)

// TestSC006ValidationLatencyP95 measures added validation latency over the
// in-memory store: the 95th percentile must stay below 10 ms (SC-006).
func TestSC006ValidationLatencyP95(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	rec := httptest.NewRecorder()
	if _, err := Create(rec, newTestRequest("POST", "/login", ""), 1, store, store, opts...); err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	cookie := setCookieFrom(t, rec)

	const samples = 10_000
	request := withCookie(newTestRequest("GET", "/", ""), cookie)
	latencies := make([]time.Duration, samples)
	for i := range samples {
		start := time.Now()
		if _, err := Validate(request, store, store, opts...); err != nil {
			t.Fatalf("Validate() error = %v", err)
		}
		latencies[i] = time.Since(start)
	}
	slices.Sort(latencies)
	p95 := latencies[int(float64(samples)*0.95)]
	if p95 >= 10*time.Millisecond {
		t.Fatalf("p95 validation latency = %v over %d samples, want < 10ms", p95, samples)
	}
	t.Logf("p95 validation latency over %d samples: %v", samples, p95)
}

func BenchmarkValidate(b *testing.B) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	rec := httptest.NewRecorder()
	if _, err := Create(rec, newTestRequest("POST", "/login", ""), 1, store, store, opts...); err != nil {
		b.Fatalf("Create() error = %v", err)
	}
	request := withCookie(newTestRequest("GET", "/", ""), setCookieFrom(b, rec))

	for b.Loop() {
		if _, err := Validate(request, store, store, opts...); err != nil {
			b.Fatalf("Validate() error = %v", err)
		}
	}
}
