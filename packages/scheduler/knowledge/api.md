---
type: Go Package
title: API
description: Every, the task type and the units of the in-process scheduler.
---

# API

```go
scheduler.Every(1, scheduler.Hour, task)
scheduler.Every(30, scheduler.Minute, task)
scheduler.Every(1, scheduler.Day, task)
```

- A task is a `func(ctx context.Context) error`.
- The units are `scheduler.Second`, `scheduler.Minute`, `scheduler.Hour` and `scheduler.Day`, plain `time.Duration`
  values: `Every` takes a `time.Duration` as its unit.
- `Every` returns a function that stops the task and cancels the context of a run in progress. A program that runs
  until its process ends can ignore it.
