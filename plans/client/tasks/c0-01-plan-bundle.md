---
type: Task
title: Create the plan bundle
description: Write plans/client from the user's request and answers, list it in plans/index.md and the tracking-plans skill, and point the holo-port and server plans at it where they deferred the client page.
status: done
phase: c0
depends_on: []
packages: [plans/client, plans/index.md, .agents/skills/tracking-plans]
sources: [source/holocms/client.php, source/holocms/clientutils.php, source/holocms/core.php]
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
---

# Goal

The client can be planned, resumed and worked by any agent, in the format of `plans/server`
([0001](/decisions/0001-plan-in-plans-client.md)).

# Steps

- [x] Ask the user where the client is planned, and record the answers as decisions 0001 to 0003.
- [x] Read what Holo's client page needs: `client.php`'s parameters, `clientutils.php`'s keys, and the settings
  `core.php` reads for it.
- [x] Write the bundle: index, rules, log, the decisions, phases C0 to C3, the tasks of C0, and the reference.
- [x] List the plan in `plans/index.md` and the `tracking-plans` skill.
- [x] Point holo-port's deferred client page and the game server's question about it, in S2, at
  [C1](/phases/c1-client-page-on-libreshockwave.md).

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/client
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/holo-port
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
python3 -I .agents/skills/reviewing-skills/scripts/validate_skill.py .agents/skills/tracking-plans
make gates
```

Results (2026-11-06):

- `check_bundle.py plans/client`: 11 concepts, 0 problems.
- `check_bundle.py plans/holo-port`: 282 concepts, 0 problems, with its client page pointing at C1.
- `check_bundle.py plans/server`: 64 concepts, 0 problems, with S2 and s1-24 pointing at this plan.
- `validate_skill.py`: 0 errors and 0 warnings, with and without `--strict`.
- Every repository path the bundle names exists, apart from the glob `apps/**/cmd/**`, every link of `plans/index.md`
  resolves, and every anchor link matches a heading of its document.
- `make gates`, on this work over `main` at `8dce38c5`: passes, with 21 Go test packages ok and none failing, the
  components' 167 tests in 25 files and their check, the sqlc diff and the store's docs check.

# Notes

- The planning ran on the branch `client-plan`, after the branch `sources` moved HoloCMS to `source/holocms`, added
  `source/holoemu` and wrote `plans/index.md`.
