package scheduler

import (
	"bytes"
	"context"
	"errors"
	"log/slog"
	"strings"
	"sync/atomic"
	"testing"
	"testing/synctest"
	"time"
)

func TestEveryRunsOnceEachInterval(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var runs atomic.Int32
		stop := Every(1, Hour, func(context.Context) error {
			runs.Add(1)
			return nil
		})
		defer stop()

		time.Sleep(59 * Minute)
		synctest.Wait()
		if n := runs.Load(); n != 0 {
			t.Errorf("%d runs before the first hour passed", n)
		}
		time.Sleep(Minute)
		synctest.Wait()
		if n := runs.Load(); n != 1 {
			t.Errorf("%d runs after an hour, want 1", n)
		}
		time.Sleep(2 * Hour)
		synctest.Wait()
		if n := runs.Load(); n != 3 {
			t.Errorf("%d runs after three hours, want 3", n)
		}
	})
}

func TestEveryMultipliesTheUnit(t *testing.T) {
	for _, c := range []struct {
		n    int
		unit time.Duration
		want time.Duration
	}{
		{30, Minute, 30 * time.Minute},
		{2, Hour, 2 * time.Hour},
		{1, Day, 24 * time.Hour},
	} {
		synctest.Test(t, func(t *testing.T) {
			var runs atomic.Int32
			stop := Every(c.n, c.unit, func(context.Context) error {
				runs.Add(1)
				return nil
			})
			defer stop()

			time.Sleep(c.want - time.Second)
			synctest.Wait()
			if n := runs.Load(); n != 0 {
				t.Errorf("Every(%d, %v) ran %d times before %v", c.n, c.unit, n, c.want)
			}
			time.Sleep(time.Second)
			synctest.Wait()
			if n := runs.Load(); n != 1 {
				t.Errorf("Every(%d, %v) ran %d times at %v, want 1", c.n, c.unit, n, c.want)
			}
		})
	}
}

func TestAFailedRunIsLoggedAndKeepsTheSchedule(t *testing.T) {
	for _, c := range []struct {
		name string
		fail func() error
		want string
	}{
		{"error", func() error { return errors.New("no database") }, "no database"},
		{"panic", func() error { panic("broken") }, "broken"},
	} {
		t.Run(c.name, func(t *testing.T) {
			var logs bytes.Buffer
			previous := slog.Default()
			slog.SetDefault(slog.New(slog.NewTextHandler(&logs, nil)))
			defer slog.SetDefault(previous)

			synctest.Test(t, func(t *testing.T) {
				var runs atomic.Int32
				stop := Every(1, Minute, func(context.Context) error {
					runs.Add(1)
					return c.fail()
				})
				defer stop()

				time.Sleep(3 * Minute)
				synctest.Wait()
				if n := runs.Load(); n != 3 {
					t.Errorf("%d runs in three minutes, want 3", n)
				}
			})
			if !strings.Contains(logs.String(), c.want) {
				t.Errorf("the log does not name the failure:\n%s", logs.String())
			}
		})
	}
}

func TestATaskNeverOverlapsItself(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var running, most, runs atomic.Int32
		stop := Every(1, Minute, func(context.Context) error {
			now := running.Add(1)
			defer running.Add(-1)
			if now > most.Load() {
				most.Store(now)
			}
			runs.Add(1)
			time.Sleep(150 * time.Second)
			return nil
		})

		time.Sleep(10 * Minute)
		synctest.Wait()
		stop()
		time.Sleep(Hour)
		synctest.Wait()
		if n := most.Load(); n != 1 {
			t.Errorf("%d runs at once, want 1", n)
		}
		if n := runs.Load(); n >= 10 {
			t.Errorf("%d runs in ten minutes, want the slow ones to skip some", n)
		}
	})
}

func TestEverySecondsCountsSeconds(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var runs atomic.Int32
		stop := Every(2, Second, func(context.Context) error {
			runs.Add(1)
			return nil
		})
		defer stop()

		time.Sleep(7 * Second)
		synctest.Wait()
		if n := runs.Load(); n != 3 {
			t.Errorf("%d runs in 7 seconds, want 3", n)
		}
	})
}

func TestStopEndsTheTask(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var runs atomic.Int32
		stop := Every(1, Minute, func(context.Context) error {
			runs.Add(1)
			return nil
		})

		time.Sleep(2 * Minute)
		synctest.Wait()
		stop()
		time.Sleep(10 * Minute)
		synctest.Wait()
		if n := runs.Load(); n != 2 {
			t.Errorf("%d runs, want 2 before stop and none after", n)
		}
	})
}

// select picks at random between a stop and a tick that are both ready, so one
// pass would miss the bug half of the time.
func TestAPendingTickDoesNotOutliveStop(t *testing.T) {
	for range 64 {
		synctest.Test(t, func(t *testing.T) {
			var runs atomic.Int32
			stop := Every(1, Minute, func(context.Context) error {
				runs.Add(1)
				time.Sleep(90 * time.Second)
				return nil
			})

			time.Sleep(Minute + time.Second)
			stop()
			time.Sleep(Hour)
			synctest.Wait()
			if n := runs.Load(); n != 1 {
				t.Errorf("%d runs, want only the one under way at the stop", n)
			}
		})
	}
}

func TestStopCancelsARunInProgress(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var cancelled atomic.Bool
		stop := Every(1, Minute, func(ctx context.Context) error {
			<-ctx.Done()
			cancelled.Store(true)
			return nil
		})

		time.Sleep(Minute)
		synctest.Wait()
		stop()
		synctest.Wait()
		if !cancelled.Load() {
			t.Error("the run in progress was not cancelled")
		}
	})
}
