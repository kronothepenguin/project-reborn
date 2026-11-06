---
type: Playbook
title: Client tracking rules
description: How tasks, decisions, phases and log entries of the client are created and kept up to date.
timestamp: 2026-11-06T16:52:10+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [process]
---

# Concepts

| Folder | `type` | File name | Purpose |
| --- | --- | --- | --- |
| `decisions/` | `Decision` | `NNNN-<slug>.md` (four digits, next free number) | One design decision confirmed by the user |
| `phases/` | `Phase` | `<phase-id>-<slug>.md` | Goal, scope, exit criteria and tasks of one phase |
| `tasks/` | `Task` | `<task-id>-<slug>.md` | One unit of work that can be verified on its own |
| `reference/` | `Reference` | `<slug>.md` | What LibreShockwave and the client's other sources hold, and how the client is built |

`index.md` and `log.md` are reserved OKF files: they are never concepts and carry no frontmatter, except the root
`index.md`, which declares `okf_version: "0.2"`.

Phase ids: `c0` … `c3`. Task ids: `<phase-id>-<nn>`, for example `c0-02` or `c1-04`.

# Frontmatter

Task:

```yaml
---
type: Task
title: Imperative title
description: One sentence.
status: todo            # todo | in-progress | blocked | done | dropped
phase: c1
depends_on: [c1-02]     # task ids; [] when none
packages: [<package or folder it changes>]
sources: [source/holocms/client.php]   # repository paths this task reads; [] when none
timestamp: 2026-11-06T15:50:54+00:00   # last status change, ISO 8601 with offset
verified:               # only once done
  - {by: <who ran the verification>, at: "<ISO 8601 with offset>"}
---
```

- `sources` lists every repository path the task reads: HoloCMS's pages, LibreShockwave's files and the client's
  scripts alike. It takes the place of holo-port's `holo:` and the server's `client:`, because this plan reads all
  three.
- Decision: `type`, `title`, `description`, `status` (`accepted` or `superseded`), `timestamp`, and
  `superseded_by` (decision id) once superseded.
- Phase: `type`, `title`, `description`, `status` (`planned`, `active` or `done`), `timestamp`.
- Reference: `type`, `title`, `description`, `timestamp`.
- Files written by an agent also carry `generated: {by: <producer>/<version>, at: "<ISO 8601>"}`.

# Body

- Task: `# Goal`, `# Steps` (a `- [ ]` checklist), `# Verification` (commands; their results once run), `# Notes`.
- Decision: `# Decision`, `# Context`, `# Consequences`.
- Phase: `# Goal`, `# Scope`, `# Exit criteria`, `# Tasks`, and `# Open questions` while any remain.

Links between concepts are bundle-absolute (`/tasks/c0-02-libreshockwave-submodule.md`). Code, sources and files of
other bundles are referenced by their repository path in backticks (`vendor/LibreShockwave/web/index.html`,
`plans/holo-port/decisions/0097-no-agent-works-on-main.md`).

# Workflows

## Resume

1. Read `/index.md`, then the newest `/log.md` entries.
2. Open `/tasks/index.md`. Continue in-progress tasks first, then todo tasks of the active phases whose `depends_on`
   are all done.

## Start a phase

A phase starts when the user starts it. Its open questions are asked to the user first, each answer becomes a
decision, and only then are its tasks written and the phase set to `active`.

## Create a task

1. Take the next free number of the phase.
2. Write the file with `status: todo`, a checklist in `# Steps` and the exact commands in `# Verification`.
3. List it in `/tasks/index.md` under its phase and in the phase file's `# Tasks`.

## Start a task

1. Set `status: in-progress` and update `timestamp`.
2. Log `**Start** [<id>](/tasks/<file>)`.

## Block a task

1. Set `status: blocked`, update `timestamp` and explain why in `# Notes`.
2. Log `**Blocked**` with the reason.

## Finish a task

1. Check every step. Run every verification command and write its result under `# Verification`.
2. Set `status: done`, update `timestamp` and add a `verified` entry.
3. Update `/tasks/index.md` and the phase file. When every task of a phase is done, set the phase to `done` and
   update the active phases in `/index.md`. The next phase stays `planned` until the user starts it.
4. Log `**Done** [<id>](/tasks/<file>)` with one line about the outcome.
5. Commit the task without pushing, on the branch [Branches](#branches) names.
6. When the task ends its branch's work, merge the branch as [Branches](#branches) says.

## Branches

`plans/holo-port/decisions/0097-no-agent-works-on-main.md` sets where work goes:

- No agent works on `main`: nothing is edited or committed in the main checkout.
- Every line of work goes on its own feature branch in its own worktree under `.claude/worktrees/<branch>`, so that
  agents do not touch each other's files. A branch is named after its phase, such as `c1`. When a phase runs several
  lines at once, each line is `<phase-id>-<slug>`, such as `c1-player`.
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

## Ask

- Open choices are explained in plain words with a concrete example, the recommendation first with its reason.
- Every open question of a task is settled before its work starts.

## Log

- Entries go under `## YYYY-MM-DD` headings, newest date first; within a day, newest entry first.
- Labels: `**Start**`, `**Done**`, `**Blocked**`, `**Create**`, `**Update**`, `**Decision**`.

# Reading LibreShockwave

- `vendor/LibreShockwave` is a git submodule ([0003](/decisions/0003-libreshockwave-submodule.md)). A fresh worktree
  holds it empty until `git submodule update --init vendor/LibreShockwave` runs there.
- It stays at its pinned commit unless a task moves it.

# Checks

Before ending a session:

- every non-index file has a non-empty `type`;
- every concept is listed in its directory `index.md` with its `description`;
- every bundle link resolves;
- the root `index.md` declares `okf_version: "0.2"` and names the active phases.

`python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/client` runs the first three and the
`okf_version` check.
