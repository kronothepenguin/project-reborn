// Package scheduler runs tasks on a timer, inside the process. It is
// package-level like settings, so a process has one scheduler: a program running
// alone runs its own tasks, and one process running several programs runs all of
// theirs.
package scheduler

import (
	"context"
	"log/slog"
	"time"
)

const (
	Minute = time.Minute
	Hour   = time.Hour
	Day    = 24 * time.Hour
)

// Task is work that runs on a timer. A returned error is logged, and the task
// keeps its schedule.
type Task func(ctx context.Context) error

// Every runs task every n units for as long as the process lives, starting n
// units from now. A run that outlasts the interval skips the runs it covers, so a
// task never overlaps itself. The returned function stops the task and cancels
// the context of a run in progress.
func Every(n int, unit time.Duration, task Task) (stop func()) {
	ctx, cancel := context.WithCancel(context.Background())
	ticker := time.NewTicker(time.Duration(n) * unit)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				run(ctx, task)
			}
		}
	}()
	return cancel
}

// run keeps a failing task from ending its schedule or the process.
func run(ctx context.Context, task Task) {
	defer func() {
		if reason := recover(); reason != nil {
			slog.Error("scheduler: task panicked", "reason", reason)
		}
	}()
	if err := task(ctx); err != nil {
		slog.Error("scheduler: task failed", "err", err)
	}
}
