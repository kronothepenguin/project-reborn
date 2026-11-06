---
type: Playbook
title: Game server tracking rules
description: How tasks, decisions, phases and log entries of the game server are created and kept up to date.
timestamp: 2026-11-06T16:52:10+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [process]
---

# Concepts

| Folder | `type` | File name | Purpose |
| --- | --- | --- | --- |
| `decisions/` | `Decision` | `NNNN-<slug>.md` (four digits, next free number) | One design decision confirmed by the user |
| `phases/` | `Phase` | `<phase-id>-<slug>.md` | Goal, scope, exit criteria and tasks of one phase |
| `tasks/` | `Task` | `<task-id>-<slug>.md` | One unit of work that can be verified on its own |
| `reference/` | `Reference` | `<slug>.md` | What the client, the Holograph Emulator and the old server contain, and how the server is built |
| `reference/r26/` | `Reference` | `<cast>.md` | The R26 protocol of one client cast, written in S1 |

`index.md` and `log.md` are reserved OKF files: they are never concepts and carry no frontmatter, except the root
`index.md`, which declares `okf_version: "0.2"`.

Phase ids: `s0` … `s9`. Task ids: `<phase-id>-<nn>`, for example `s0-02` or `s1-11`.

# Frontmatter

Task:

```yaml
---
type: Task
title: Imperative title
description: One sentence.
status: todo            # todo | in-progress | blocked | done | dropped
phase: s0
depends_on: [s0-02]     # task ids; [] when none
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_poll/5_Poll Handler Class.ls"]   # client scripts this task reads; [] when none
timestamp: 2026-11-05T20:57:45+00:00   # last status change, ISO 8601 with offset
verified:               # only once done
  - {by: <who ran the verification>, at: "<ISO 8601 with offset>"}
---
```

- Decision: `type`, `title`, `description`, `status` (`accepted` or `superseded`), `timestamp`, and
  `superseded_by` (decision id) once superseded.
- Phase: `type`, `title`, `description`, `status` (`planned`, `active` or `done`), `timestamp`.
- Reference: `type`, `title`, `description`, `timestamp`.
- Files written by an agent also carry `generated: {by: <producer>/<version>, at: "<ISO 8601>"}`.

# Body

- Task: `# Goal`, `# Steps` (a `- [ ]` checklist), `# Verification` (commands; their results once run), `# Notes`.
- Decision: `# Decision`, `# Context`, `# Consequences`.
- Phase: `# Goal`, `# Scope`, `# Exit criteria`, `# Tasks`, and `# Open questions` while any remain.
- R26 cast reference: the format in [The R26 client](/reference/client-r26.md#protocol-reference-format).

Links between concepts are bundle-absolute (`/tasks/s0-02-create-templates.md`). Code, client scripts and files of
other bundles are referenced by their repository path in backticks (`packages/server/server.go`,
`plans/holo-port/decisions/0097-no-agent-works-on-main.md`).

# Workflows

## Resume

1. Read `/index.md`, then the newest `/log.md` entries.
2. Open `/tasks/index.md`. Continue in-progress tasks first, then todo tasks of the active phases whose `depends_on`
   are all done.

## Create a task

1. Take the next free number of the phase.
2. Write the file with `status: todo`, a checklist in `# Steps` and the exact commands in `# Verification`.
3. List it in `/tasks/index.md` under its phase and in the phase file's `# Tasks`.
4. A phase gets its tasks when it starts, not before. Its open questions are asked to the user before its tasks are
   written, and each answer becomes a decision.

## Start a task

1. Set `status: in-progress` and update `timestamp`.
2. Log `**Start** [<id>](/tasks/<file>)`.

## Block a task

1. Set `status: blocked`, update `timestamp` and explain why in `# Notes`.
2. Log `**Blocked**` with the reason.

## Finish a task

1. Check every step. Run every verification command and write its result under `# Verification`.
2. Set `status: done`, update `timestamp` and add a `verified` entry.
3. Update `/tasks/index.md` and the phase file. When every task of a phase is done, set the phase to `done`, the
   next phase to `active`, and update the active phases in `/index.md`.
4. Log `**Done** [<id>](/tasks/<file>)` with one line about the outcome.
5. Commit the task without pushing, on the branch [Branches](#branches) names.
6. When the task ends its branch's work, merge the branch as [Branches](#branches) says.

## Branches

`plans/holo-port/decisions/0097-no-agent-works-on-main.md` sets where work goes:

- No agent works on `main`: nothing is edited or committed in the main checkout.
- Every line of work goes on its own feature branch in its own worktree under `.claude/worktrees/<branch>`, so that
  agents do not touch each other's files. A branch is named after its phase, such as `s0`. When a phase runs several
  lines at once, as S1 does with one task per cast, each line is `<phase-id>-<slug>`, such as `s1-navigator`.
- The agent commits without being asked, one commit per finished task, in one-line titles (`feat:`, `fix:`, `refactor:`,
  `docs:`), and each commit builds on its own. The agent never pushes.
- When the branch's work is done and verified, the agent merges it by itself, without asking: it merges `main` into the
  branch inside its worktree, runs every gate there (`make gates`), and then fast-forwards `main` from the main checkout
  with `git merge --ff-only <branch>`. If `main` moved in the meantime, it starts again. That fast-forward is the only
  thing an agent does on `main`.
- Once the branch's work is done and merged, the agent removes its worktree and deletes the branch, from the main
  checkout: `git worktree remove .claude/worktrees/<branch>` and `git branch -d <branch>`
  (`plans/holo-port/decisions/0101-agents-clean-up-worktrees.md`).

## Change of scope

- Never widen a task silently: new work becomes a new task.
- Never delete a task: set `status: dropped` and give the reason in `# Notes`.

## Record a decision

1. Every decision the user confirms becomes a decision file with `status: accepted`.
2. A changed decision gets a new file; the old one gets `status: superseded` and `superseded_by`. Accepted text is
   never rewritten.
3. Log `**Decision** [NNNN](/decisions/<file>)`.
4. Any architecture choice that no decision covers is asked to the user before acting.
5. Whether a kind of data is saved in the database or lives only in memory is never assumed. What the user decided is
   in [0011](/decisions/0011-saved-and-memory-only-data.md) and the decisions after it; anything else is asked, and
   each phase lists what it still needs to know under `# Open questions`.

## Ask

- Open choices are explained in plain words with a concrete example, the recommendation first with its reason.
- Every open question of a task is settled before its work starts.

## Log

- Entries go under `## YYYY-MM-DD` headings, newest date first; within a day, newest entry first.
- Labels: `**Start**`, `**Done**`, `**Blocked**`, `**Create**`, `**Update**`, `**Decision**`.

# Reading the client

- The protocol comes from the `.ls` scripts only ([0008](/decisions/0008-reverse-engineer-ls-only.md)).
- 295 of the 414 `.ls` files end their lines with CR alone, so `grep` and `wc -l` see one line. Read them through
  `tr '\r' '\n' < "<file>"`.

# Reading the emulator

- `source/holoemu/` is read only when the `.ls` scripts leave a question open, and nothing is ported from it
  ([0016](/decisions/0016-holoemu-is-a-reference.md)).
- Its files end their lines in CRLF: read them through `tr -d '\r' < "<file>"`, and quote paths, since some hold
  spaces ([The Holograph Emulator](/reference/holoemu.md#reading-it)).

# Checks

Before ending a session:

- every non-index file has a non-empty `type`;
- every concept is listed in its directory `index.md` with its `description`;
- every bundle link resolves;
- the root `index.md` declares `okf_version: "0.2"` and names the active phases.

`python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server` runs the first three and the
`okf_version` check.
