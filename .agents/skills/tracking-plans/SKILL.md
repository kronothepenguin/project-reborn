---
name: tracking-plans
description: Starts and works the OKF plan bundles under plans/ (plans/holo-port, plans/server, plans/client and any new plan) — creating a new plan in the house format, resuming work, creating, starting, blocking and finishing tasks, recording decisions and log entries, and merging the work's branch. Use when asked to plan new work under plans/, to continue or finish any planned task, or about a plan's status.
---

# Tracking plans

Every plan is an OKF 0.2 bundle in `plans/<plan>/`: decisions, phases, tasks, reference documents, a log and its own
`rules.md`. The bundle's `rules.md` is the full version and wins over this skill.

| Plan | What it plans | Phase ids |
| --- | --- | --- |
| `plans/holo-port` | HoloCMS ported to the CMS, housekeeping and the installer (also has `tracking-holo-port`) | `p0`…`p7`, `hk-a`, `hk-b`, `fx`, `up`, `ed` |
| `plans/server` | The game server | `s0`…`s9` |
| `plans/client` | The R26 client in the browser: on LibreShockwave first, in vanilla JavaScript later | `c0`…`c3` |

`plans/index.md` maps every plan and the sources each one reads, and `plans/later.md` lists work that belongs to no
phase yet.

## Resume

1. Read `plans/<plan>/index.md`, then the newest entries of its `log.md`.
2. Open its `tasks/index.md`. Continue in-progress tasks first, then todo tasks of the active phases whose
   `depends_on` are all done.
3. Read the task's phase file and the decisions and reference documents it links before touching anything.

## Work a task

```text
Task:
- [ ] own feature branch and worktree, never main (plans/holo-port/decisions/0097)
- [ ] the task's open questions asked and settled, each answer a decision
- [ ] status: in-progress, timestamp updated, "**Start**" log entry
- [ ] every step of "# Steps" done and checked
- [ ] every "# Verification" command run, results written in the task
- [ ] status: done, timestamp updated, verified: [{by, at}] added
- [ ] tasks/index.md and the phase file updated
- [ ] "**Done**" log entry under today's "## YYYY-MM-DD", newest first
- [ ] committed, not pushed, one-line title (feat:, fix:, refactor:, docs:)
- [ ] if the branch's work is done: merged, then its worktree removed and its branch deleted, as "Branches" says
```

- Blocked: `status: blocked`, the reason in `# Notes`, a `**Blocked**` log entry.
- New work found: a new task with the phase's next free number; never widen the current one silently.
- Never delete a task: `status: dropped` with the reason.
- A phase gets its tasks when it starts, after its open questions are answered.

## Branches

- Never work on `main`. Every line of work goes on its own feature branch in its own worktree:
  `git worktree add -b <branch> .claude/worktrees/<branch> main`. The bundle's rules name the branch, usually the
  phase id.
- When the branch's work is done and verified, merge it without asking: merge `main` into the branch inside the
  worktree, run `make gates` there, then fast-forward `main` from the main checkout with
  `git -C <main checkout> merge --ff-only <branch>`. If `main` moved, start again.
- Once merged, clean up from the main checkout: `git worktree remove .claude/worktrees/<branch>` and
  `git branch -d <branch>` (plans/holo-port/decisions/0101). `--force` only when a submodule or ignored build output
  blocks the removal and `git status` is clean. This includes `agent-*` and throwaway worktrees.
- Never push.

## Start a new plan

1. Gather what the user wants. Ask every open choice in plain words with a concrete example, the recommendation first
   with its reason. Assume nothing; settle every question before writing tasks.
2. Work on a branch and worktree of the plan's own.
3. Create `plans/<plan>/`:
   - `index.md` with `okf_version: "0.2"`, what the plan covers, "Resume here", the active phases, the contents and
     the user's ground rules;
   - `rules.md`, copied from `plans/server/rules.md`, with the plan's phase ids, the task field that names the sources
     it reads (`holo:`, `client:`), and whatever the plan does differently;
   - `log.md`, and `decisions/`, `phases/`, `tasks/` and `reference/`, each with an `index.md`.
4. Record every confirmed choice as a decision, numbered from `0001`, quoting the user's words.
5. Give every phase a goal, a scope, exit criteria and its open questions. Only the phases that start get tasks; the
   first task records the plan's creation.
6. Add the plan to the table above, and to `plans/index.md` with the sources it reads.
7. Run the checks.

## Decisions

- A decision the user confirms becomes `decisions/NNNN-<slug>.md` with `status: accepted`.
- A changed decision gets a new file; the old one gets `status: superseded` and `superseded_by`, and its index line
  ends with "Superseded by" and a link to the new decision, in bold. Accepted text is never rewritten.
- An architecture choice that no decision covers is asked to the user before acting.

## Checks

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/<plan>
```

It checks the frontmatter, the index listings, the links, the statuses and the `depends_on` ids.

## Gotchas

- `index.md` and `log.md` are reserved OKF files: no frontmatter, except the root `index.md`.
- Links inside a bundle are bundle-absolute (`/tasks/s0-02-create-templates.md`). Code and files of other bundles are
  named by their repository path in backticks.
- Timestamps are ISO 8601 with an explicit offset.
- `apps/**/cmd/**` belongs to the user: describe a change there and ask for it, never make it unasked.
