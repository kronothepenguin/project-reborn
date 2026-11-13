---
type: Playbook
title: Project Reborn tracking rules
description: How slices, tasks, decisions and log entries are created and kept up to date, and how a coordinator and its sub-agents share the work.
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [process]
---

# Concepts

| Folder | `type` | File name | Purpose |
| --- | --- | --- | --- |
| `slices/` | `Slice` | `<slice>.md` | One feature across every project it touches: goal, scope by project, exit criteria, tasks, open questions |
| `tasks/` | `Task` | `<slice>-<nn>-<slug>.md` | One unit of work that can be verified on its own, and the packages it changes |
| `decisions/` | `Decision` | `NNNN-<slug>.md` (four digits, next free number) | One design decision confirmed by the user |
| `reference/` | `Reference` | `<slug>.md` | Studies and descriptions that several slices read |

`index.md` and `log.md` are reserved OKF files: they are never concepts and carry no frontmatter, except the root
`index.md`, which declares `okf_version: "0.2"`.

The bundles `plans/holo-port`, `plans/server` and `plans/client` are history
([0001](/decisions/0001-plans-are-feature-slices-in-one-bundle.md)): their tasks, decisions and logs are never added to.
Their reference documents stay in use and are corrected in place, such as the R26 protocol of
`plans/server/reference/r26/` and `plans/holo-port/reference/holo-differences.md`.

# Frontmatter

Slice:

```yaml
---
type: Slice
title: Credits and club
description: One sentence.
status: planned         # planned | active | done | parked
projects: [store, virtual, server, cms, housekeeping]
depends_on: [platform]  # slices; [] when none
from: ["plans/server/phases/s7-club-help-extras.md"]   # where its work was planned before; [] when new
timestamp: 2026-11-13T00:42:05+00:00
---
```

Task:

```yaml
---
type: Task
title: Imperative title
description: One sentence.
status: todo            # todo | in-progress | blocked | done | dropped
slice: credits-and-club
depends_on: [platform-04]   # task ids; [] when none
packages: [packages/server, packages/virtual]   # what it changes, which is what it locks
sources: []             # scripts of the client, files of Holo or other sources it reads
timestamp: 2026-11-13T00:42:05+00:00   # last status change, ISO 8601 with offset
verified:               # only once done
  - {by: <who ran the verification>, at: "<ISO 8601 with offset>"}
---
```

- Decision: `type`, `title`, `description`, `status` (`accepted` or `superseded`), `timestamp`, `tags`, and
  `superseded_by` once superseded.
- Reference: `type`, `title`, `description`, `timestamp`, `tags`.
- Files written by an agent also carry `generated: {by: <producer>/<version>, at: "<ISO 8601>"}`.

# Body

- Slice: `# Goal`, `# Scope` (a row a project), `# Exit criteria`, `# Tasks`, and `# Open questions` while any remain.
- Task: `# Goal`, `# Steps` (a `- [ ]` checklist), `# Verification` (commands; their results once run), `# Notes`.
- Decision: `# Decision`, `# Context`, `# Consequences`.

Links between concepts are bundle-absolute (`/tasks/platform-01-drop-the-unused-listener.md`). Code and files of other
bundles are named by their repository path in backticks (`packages/server/server.go`,
`plans/server/decisions/0011-saved-and-memory-only-data.md`); the checker resolves every `plans/…` path.

A decision is cited with its bundle wherever the bundle is not plain: "reborn 0002", "server 0045", "holo-port 0097".
Four series of numbers exist, so a bare number in code or in another bundle names nothing.

# Who does what

Work is shared between one coordinator and the sub-agents it starts
([0002](/decisions/0002-a-coordinator-shares-tasks-and-merges-in-batches.md)).

The coordinator is the session that talks to the user. It alone:

- asks the user, records decisions, and writes slices and tasks;
- edits `/index.md`, `/decisions/` and `/log.md`;
- merges finished branches into `main`.

A sub-agent works one task in one worktree. It cannot ask the user, so it never decides: when a question is not
settled by the task, its slice or a decision, it stops and reports. It does not merge, and it does not touch another
task's packages.

One session may be both, working a task itself between the others.

# Workflows

## Resume

1. Read `/index.md`: Now names the active slices, Next the order of the rest.
2. Run the board: `python3 -I .agents/skills/tracking-plans/scripts/board.py`. It prints, for each active slice, the
   tasks in progress, the ones finished on a branch and not merged, and the ones ready to start.
3. Read the newest entries of `/log.md`.

## Start a slice

1. Ask the user its open questions, in plain words with a concrete example, the recommendation first with its reason.
   Each answer becomes a decision. A slice starts when none is left.
2. Write its exit criteria and its tasks, then set it `active` and list it under Now in `/index.md`.
3. Split it so that sub-agents can work at once:
   - the first task is the contract, done alone: the store's update and queries, the types of `packages/virtual`, the
     notices other programs will get;
   - then one task a project (server, cms, housekeeping, installer), each naming its own `packages`;
   - the last task checks the exit criteria.

## Work a task

1. A task is ready when it is `todo` and every `depends_on` is `done`.
2. Claim it by creating its worktree: `git worktree add -b <task-id> .claude/worktrees/<task-id> main`. A task with a
   worktree is taken; nothing else marks it.
3. Set `status: in-progress` and update `timestamp`.
4. Do every step. Run every verification command, and the whole test suite of each package touched, never a filtered
   run alone. Write the results under `# Verification`.
5. Set `status: done`, update `timestamp`, add `verified`, and commit: one commit a task, a one-line title (`feat:`,
   `fix:`, `refactor:`, `docs:`), never pushed.
6. Report the branch as ready. The coordinator merges it.

Blocked: `status: blocked`, the reason in `# Notes`, and a report. New work found: a new task, never a wider one. A task
is never deleted: `status: dropped` with the reason.

## What two tasks never change at once

Tasks run in parallel only when their `packages` do not overlap, and these are never changed by two tasks at once,
whatever their packages say:

- `packages/store/migrations`, the generated query files and the indexes of `packages/store/knowledge`: the next
  update's number collides;
- `packages/virtual/settings`;
- `go.work`, the `go.mod` files and `pnpm-lock.yaml`;
- `/decisions/` and `/index.md` of this bundle, which only the coordinator edits;
- `apps/**/cmd/**`, which is the user's: a change there is described and asked, never made unasked.

## Merge

`make gates` takes about 15 minutes, and only one run at a time is safe.

1. The coordinator makes a worktree `merge-<date>` from `main` and merges every ready branch into it.
2. It runs the gates there once, for the whole batch.
3. It fast-forwards `main` with `git merge --ff-only`, removes the worktrees and deletes the branches.
4. When the gates fail, the branch at fault leaves the batch and goes back to its task; the rest is run again.

A branch worked alone merges the same way, as a batch of one. Nothing is pushed.

## Record a decision

1. Every decision the user confirms becomes a decision file with `status: accepted`, quoting the user's words.
2. A changed decision gets a new file; the old one gets `status: superseded` and `superseded_by`. A decision of a
   history bundle that a new one replaces gets `superseded_by: reborn/NNNN`, the only edit a history decision takes.
   Accepted text is never rewritten.
3. Log `**Decision** [NNNN](/decisions/<file>)`.
4. Any architecture choice that no decision covers is asked to the user before acting. Whether a kind of data is saved
   or lives only in memory is never assumed (`plans/server/decisions/0011-saved-and-memory-only-data.md`).

## Log

- Entries go under `## YYYY-MM-DD` headings, newest date first; within a day, newest entry first.
- Only the coordinator writes it: `**Decision**`, `**Slice**` (started, done, parked) and `**Merged**` (the tasks of a
  batch). A task's start and end live in its own file and in git.

# Sources

- The game's protocol comes from the client's `.ls` scripts only
  (`plans/server/decisions/0008-reverse-engineer-ls-only.md`). 295 of the 414 `.ls` files end their lines with CR
  alone: read them through `tr '\r' '\n' < "<file>"`.
- `source/holoemu/` is read only when the scripts leave a question open, and nothing is ported from it
  (`plans/server/decisions/0016-holoemu-is-a-reference.md`). Its files, and those of `source/holocms/`, are Latin-1
  with CRLF: read them through `tr -d '\r' < "<file>"`, and search them with `grep -a`.

# Checks

`python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/reborn plans/holo-port plans/server plans/client`
checks every bundle, and `make gates` runs it: frontmatter, index listings, links and `plans/…` paths, statuses, and
that every task names a slice and tasks that exist.
