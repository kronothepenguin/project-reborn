---
type: Playbook
title: Writing a suite
description: How to add a browser suite: its module, its registration and the helpers and exports a run gives it.
---

# Steps

1. Add a module to `suites/`.
2. Import it in `run.mjs` and add it to `suites`.

# Default export

The default export takes the run's helpers:

| Helper | What it is |
| --- | --- |
| `base` | The CMS's address |
| `hk` | Housekeeping's address, with `/housekeeping` |
| `hkOrigin` | Housekeeping's origin |
| `installer` | The installer's address |
| `ports` | The ports of the CMS and housekeeping |
| `dir` | The folder of the suite's hotel |
| `browser` | The Chromium browser |
| `check(name, ok, detail)` | Records one check |
| `sql(query)` | Runs a query on the hotel's database |
| `mails()` | The mails the stub received |
| `shot(page, name)` | Saves a screenshot in `.run/shots/` |
| `wait(ms)` | Sleeps |
| `eventually(test)` | Retries `test` for four seconds |
| `start`, `stop`, `restart` | Start, stop or restart a program |

# Other exports

- `programs`: what to start, `["cms"]` by default.
- `prepare`: runs on the copy of the hotel before the programs start.
- `emptyFolder`: `true` to start with no hotel at all.
