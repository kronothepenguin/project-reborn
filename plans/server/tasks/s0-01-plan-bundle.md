---
type: Task
title: Create the plan bundle and the tracking-plans skill
description: Write plans/server from the user's request and answers, with the tracking-plans skill that works every plan and the .claude/skills link that lets Claude Code load the project skills.
status: done
phase: s0
depends_on: []
packages: [plans/server, .agents/skills/tracking-plans]
client: []
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

The game server can be planned, resumed and worked by any agent, in the format of `plans/holo-port`
([0001](/decisions/0001-plan-in-plans-server.md)).

# Steps

- [x] Find the old server: removed from `packages/server` in `2ea51d7b` ([The old server](/reference/old-server.md)).
- [x] List the client's protocol scripts, its wire format and its handshake ([The R26 client](/reference/client-r26.md)).
- [x] Ask the user every open choice, in four rounds, and record the answers as decisions 0001 to 0013.
- [x] Write the bundle: index, rules, log, the decisions, phases S0 to S9, the tasks of S0 and S1, and the reference.
- [x] Write `.agents/skills/tracking-plans`, with `scripts/check_bundle.py`, and link `.claude/skills` to
  `.agents/skills`.
- [x] `plans/later.md` lists r18 and what the server decided for the orchestrator, and
  `plans/holo-port/reference/architecture.md` names `apps/server` and this plan.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/holo-port
python3 -I .agents/skills/reviewing-skills/scripts/validate_skill.py .agents/skills/tracking-plans
readlink .claude/skills
make gates
```

Results (2026-11-05):

- `check_bundle.py plans/server`: 58 concepts, 0 problems.
- `check_bundle.py plans/holo-port`: 278 concepts, 0 problems, with this branch's change to its architecture reference.
- `validate_skill.py`: 0 errors and 0 warnings, with and without `--strict`.
- `readlink .claude/skills`: `../.agents/skills`, and `ls .claude/skills/` shows the 14 project skills,
  `tracking-plans` among them. Claude Code reads the folder when a session starts, so the first new session confirms
  it loads them.
- Every repository path the bundle names exists, except the code S0 creates, r18 and `apps/reborn`; holo-port's
  decision 0097 reached `main` with the branch `branch-policy` (`87de5361`).
- Every anchor link matches a heading of its document.
- `make gates`, on this work over `main` at `87de5361`: passes, with 21 Go test packages ok and none failing, the
  components' tests and checks, the sqlc diff and the store's docs check.

# Notes

- The planning ran on the branch `server-plan`, before the phase branches existed.
- The other casts' counts in [The R26 client](/reference/client-r26.md#registering-scripts) were taken with a script
  over the `tMsgs` and `tCmds` lists; S1 confirms them.
