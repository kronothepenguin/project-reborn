package router

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
)

func TestOriginCheck(t *testing.T) {
	base, err := url.Parse("http://localhost:8080")
	if err != nil {
		t.Fatalf("parse base URL: %v", err)
	}
	router := New(Deps{BaseURL: base})
	next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	cases := []struct {
		name    string
		origin  string
		referer string
		want    int
	}{
		{name: "matching origin passes", origin: "http://localhost:8080", want: http.StatusOK},
		{name: "matching referer passes", referer: "http://localhost:8080/register", want: http.StatusOK},
		{name: "mismatched origin is rejected", origin: "http://evil.example", want: http.StatusForbidden},
		{name: "mismatched referer is rejected", referer: "http://evil.example/steal", want: http.StatusForbidden},
		{name: "absent headers pass", want: http.StatusOK},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/", nil)
			if tc.origin != "" {
				req.Header.Set("Origin", tc.origin)
			}
			if tc.referer != "" {
				req.Header.Set("Referer", tc.referer)
			}
			rec := httptest.NewRecorder()

			router.OriginCheck(next).ServeHTTP(rec, req)

			if rec.Code != tc.want {
				t.Errorf("status = %d, want %d", rec.Code, tc.want)
			}
		})
	}
}
