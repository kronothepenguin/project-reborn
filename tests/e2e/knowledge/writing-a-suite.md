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
| `installer` | The installer's address, with `/installer` |
| `ports` | The ports of the CMS and housekeeping, the game server's `info`, `mus` and `api`, and `reborn` |
| `dir` | The folder of the suite's hotel |
| `browser` | The Chromium browser |
| `check(name, ok, detail)` | Records one check |
| `sql(query)` | Runs a query on the hotel's database |
| `mails()` | The mails the stub received |
| `shot(page, name)` | Saves a screenshot in `.run/shots/` |
| `wait(ms)` | Sleeps |
| `eventually(test)` | Retries `test` for four seconds |
| `start`, `stop`, `restart` | Start, stop or restart a program: `cms`, `housekeeping`, `installer`, `server` or `reborn`. `stop(program, signal)` sends `SIGTERM`, or `signal`, and returns the exit code |

# Other exports

- `programs`: what to start, `["cms"]` by default. The game server starts before them in every suite with an installed
  hotel.
- `prepare`: runs on the copy of the hotel before the programs start.
- `emptyFolder`: `true` to start with no hotel at all.
- `logs`: the regular expressions of the log lines a program writes by design in this suite, matched against
  `<program>: <line>`. Each names the decision that makes the program log it.

# Shared helpers

- `lib/staff.mjs`: `seedStaff(sql)` adds the actors of the housekeeping suites, and `session(t, name)` opens a browser
  context signed in on the CMS.
- `lib/game.mjs`: `enter(page, base, ports.info)` brings the page's habbo into the hotel over a WebSocket, with the
  client page's SSO ticket, as the client does. It returns `until(id)`, which waits for a message of the game, `closed`,
  `closedAt` and `leave()`. The game logs the login, so the suite lists that line in `logs`.
