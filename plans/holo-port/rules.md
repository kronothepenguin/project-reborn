---
type: Playbook
title: Port tracking rules
description: How tasks, decisions, phases and log entries of the HoloCMS port are created and kept up to date.
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [process]
---

# Concepts

| Folder | `type` | File name | Purpose |
| --- | --- | --- | --- |
| `decisions/` | `Decision` | `NNNN-<slug>.md` (four digits, next free number) | One design decision confirmed by the user |
| `phases/` | `Phase` | `<phase-id>-<slug>.md` | Goal, scope, exit criteria and tasks of one phase |
| `tasks/` | `Task` | `<task-id>-<slug>.md` | One unit of work that can be verified on its own |
| `reference/` | `Reference` | `<slug>.md` | What Holo contains and where each part goes |

`index.md` and `log.md` are reserved OKF files: they are never concepts and carry no frontmatter, except the root
`index.md`, which declares `okf_version: "0.2"`.

Phase ids: `p0` … `p7`, `hk-a`, `hk-b`. Task ids: `<phase-id>-<nn>`, for example `p0-04` or `hk-a-01`.

# Frontmatter

Task:

```yaml
---
type: Task
title: Imperative title
description: One sentence.
status: todo            # todo | in-progress | blocked | done | dropped
phase: p0
depends_on: [p0-02]     # task ids; [] when none
packages: [packages/store]
holo: [source/holo/install.php]   # legacy sources this task ports; [] when none
timestamp: 2026-10-27T20:48:19+00:00   # last status change, ISO 8601 with offset
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

Links between concepts are bundle-absolute (`/tasks/p0-02-store-open-returns-db.md`). Code is referenced by its
repository path in backticks (`packages/store/store.go`).

# Workflows

## Resume

1. Read `/index.md`, then the newest `/log.md` entries.
2. Open `/tasks/index.md`. Continue in-progress tasks first, then todo tasks of the current phase whose
   `depends_on` are all done.

## Create a task

1. Take the next free number of the phase.
2. Write the file with `status: todo`, a checklist in `# Steps` and the exact commands in `# Verification`.
3. List it in `/tasks/index.md` under its phase and in the phase file's `# Tasks`.
4. A phase gets its tasks when it starts, not before.

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
   next phase to `active`, and update the current phase in `/index.md`.
4. Log `**Done** [<id>](/tasks/<file>)` with one line about the outcome.

## Change of scope

- Never widen a task silently: new work becomes a new task.
- Never delete a task: set `status: dropped` and give the reason in `# Notes`.

## Record a decision

1. Every decision the user confirms becomes a decision file with `status: accepted`.
2. A changed decision gets a new file; the old one gets `status: superseded` and `superseded_by`. Accepted text is
   never rewritten.
3. Log `**Decision** [NNNN](/decisions/<file>)`.
4. Any architecture choice that no decision covers is asked to the user before acting.

## Log

- Entries go under `## YYYY-MM-DD` headings, newest date first; within a day, newest entry first.
- Labels: `**Start**`, `**Done**`, `**Blocked**`, `**Create**`, `**Update**`, `**Decision**`.

# Checks

Before ending a session:

- every non-index file has a non-empty `type`;
- every concept is listed in its directory `index.md` with its `description`;
- every bundle link resolves;
- the root `index.md` declares `okf_version: "0.2"` and names the current phase.
