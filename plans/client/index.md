---
okf_version: "0.2"
---

# Client

**History since 2026-11-13.** New work is planned by feature slice in `plans/reborn/index.md`. Nothing is added to this
bundle's tasks, decisions or log; its reference documents stay in use.

State of how the R26 client reaches the player's browser. First the CMS's client page runs the original `.dcr` on
LibreShockwave, then one program serves the client's files from the one binary, and later a vanilla JavaScript client
takes LibreShockwave's place ([0002](/decisions/0002-libreshockwave-first-then-javascript.md)).

## Resume here

1. Read the [rules](/rules.md).
2. Read the newest entries of the [log](/log.md).
3. Open the [task index](/tasks/index.md): in-progress tasks first, then the todo tasks of the active phases.

Active phases: none. [C0 Foundations](/phases/c0-foundations.md) is done. [C1 The client page on
LibreShockwave](/phases/c1-client-page-on-libreshockwave.md), [C2 The client's files](/phases/c2-client-files.md) and
[C3 The JavaScript client](/phases/c3-javascript-client.md) moved to the slice `plans/reborn/slices/client.md` before
they started.

Every plan is listed in `plans/index.md`, and work that belongs to no phase in `plans/later.md`.

## Contents

- [Rules](/rules.md) — How tasks, decisions, phases and log entries of the client are created and kept up to date.
- [Log](/log.md) — Dated history of the client, newest first.
- [Decisions](/decisions/index.md) — Design decisions confirmed by the user.
- [Phases](/phases/index.md) — The phases of the client with scope, exit criteria and open questions.
- [Tasks](/tasks/index.md) — Units of work and their status, grouped by phase.
- [Reference](/reference/index.md) — What LibreShockwave holds, and which plan reads it for what.

## Ground rules from the user

They come from the user's request, `AGENTS.md` and the user's corrections, and apply to every task.

| Concern | Rule |
| --- | --- |
| Order | LibreShockwave and the `.dcr` first, a vanilla JavaScript client later ([0002](/decisions/0002-libreshockwave-first-then-javascript.md)) |
| Player | LibreShockwave, a submodule at `vendor/LibreShockwave` ([0003](/decisions/0003-libreshockwave-submodule.md)) |
| Packages | no package or project gets a role the user has not described; each is asked |
| Environment variables | never, unless the user asks |
| Architecture | follow the user's decisions; anything not covered is asked before acting |
| Runners | `apps/**/cmd/**` belongs to the user: a change there is described and asked for, never made unasked |
| Code comments | only for non-obvious architecture or tricky edge cases |
| Commits | never on `main`: each line of work has its own feature branch and worktree, which the agent merges once every gate passes, never pushed (`plans/holo-port/decisions/0097-no-agent-works-on-main.md`) |
