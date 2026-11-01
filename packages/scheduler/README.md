# scheduler

Runs tasks on a timer, inside the process, like a small cron.

```go
scheduler.Every(1, scheduler.Hour, task)
scheduler.Every(30, scheduler.Minute, task)
scheduler.Every(1, scheduler.Day, task)
```

A task is a `func(ctx context.Context) error`. The units are `scheduler.Minute`, `scheduler.Hour` and `scheduler.Day`.

## Rules

- A program registers its tasks in its `New`, so that its runners stay untouched.
- The scheduler is package-level, like `settings`. A process has one: a program running alone runs its own tasks, and the
  orchestrator runs every program's tasks in one process with no extra code.
- A task first runs one interval after it is registered, not at once.
- A returned error or a panic is logged, and the task keeps its schedule.
- A task never overlaps itself: a run that outlasts the interval skips the runs it covers.
- `Every` returns a function that stops the task and cancels the context of a run in progress. A program that runs until
  its process ends can ignore it.
