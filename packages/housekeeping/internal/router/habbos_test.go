package router

import (
	"testing"
	"time"
)

func TestActivityReadsAsHolosColumn(t *testing.T) {
	for _, c := range []struct {
		elapsed time.Duration
		want    string
	}{
		{30 * time.Second, "30 seconds ago"},
		{599 * time.Second, "599 seconds ago"},
		{600 * time.Second, "10 minutes ago"},
		{6000 * time.Second, "100 minutes ago"},
		{6001 * time.Second, "2 hours ago"},
		{24 * time.Hour, "24 hours ago"},
		{25 * time.Hour, "2 days ago"},
		{72 * time.Hour, "3 days ago"},
	} {
		if got := activity(c.elapsed); got != c.want {
			t.Errorf("activity(%s) = %q, want %q", c.elapsed, got, c.want)
		}
	}
}
