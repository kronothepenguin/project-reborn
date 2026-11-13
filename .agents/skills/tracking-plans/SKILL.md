---
name: tracking-plans
description: Works the plan of Project Reborn in plans/reborn (OKF 0.2), planned by feature slice across the store, the game server, the site, housekeeping, the installer and the client — resuming work, starting a slice, creating and working tasks, sharing them with sub-agents, recording decisions, and merging finished branches in batches. Also reads the history bundles plans/holo-port, plans/server and plans/client. Use when asked to plan new work, to continue or finish any planned task, or about the plan's status.
---

# Tracking plans

`plans/reborn/` is the live plan: slices, tasks, decisions, reference documents, a log and its `rules.md`, which is the
full version and wins over this skill. `plans/holo-port`, `plans/server` and `plans/client` are history: read them,
cite them, never add to their tasks, decisions or logs. Their reference documents stay in use and are corrected in
place.

| Folder of `plans/reborn` | Holds |
| --- | --- |
| `slices/` | One feature across every project it touches: goal, scope by project, exit criteria, tasks, open questions |
| `tasks/` | `<slice>-<nn>-<slug>.md`: one unit of work, the slice it belongs to and the packages it changes |
| `decisions/` | `NNNN-<slug>.md`: what the user decided, cited as "reborn NNNN" outside the bundle |
| `reference/` | Studies the slices read |

## Resume

1. Read `plans/reborn/index.md`: Now names the active slices, Next the order of the rest.
2. Run the board:

   ```sh
   python3 -I .agents/skills/tracking-plans/scripts/board.py
   ```

   It prints, for each active slice, the tasks in progress, the ones ready to merge and the ones ready to start.
3. Read the newest entries of `plans/reborn/log.md`.

## Coordinator and sub-agents

The coordinator is the session that talks to the user. It alone asks the user, records decisions, writes slices and
tasks, edits the bundle's `index.md`, `decisions/` and `log.md`, and merges. A sub-agent works one task in one
worktree: it cannot ask the user, so it never decides, it stops and reports; it does not merge.

## Start a slice

1. Ask the user every open question of the slice, in plain words with a concrete example, the recommendation first
   with its reason. Each answer becomes a decision. Assume nothing.
2. Write the slice's exit criteria and its tasks, set it `active`, and list it under Now.
3. Split it for parallel work: a contract task done alone (the store's update and queries, the shared types, the
   services' contracts), then one task a project, then a task that checks the exit criteria.

## Work a task

```text
Task:
- [ ] ready: status todo, every depends_on done
- [ ] claimed by its worktree: git worktree add -b <task-id> .claude/worktrees/<task-id> main
- [ ] status: in-progress, timestamp updated
- [ ] every step of "# Steps" done and checked
- [ ] every "# Verification" command run, and the whole suite of each package touched; results written in the task
- [ ] status: done, timestamp updated, verified: [{by, at}] added
- [ ] committed, not pushed, one-line title (feat:, fix:, refactor:, docs:)
- [ ] reported as ready; the coordinator merges
```

- Blocked: `status: blocked`, the reason in `# Notes`, and a report.
- New work found: a new task with the slice's next free number; never widen the current one silently.
- Never delete a task: `status: dropped` with the reason.
- After adding or changing a task file: `python3 -I .agents/skills/tracking-plans/scripts/board.py --write` rewrites
  `plans/reborn/tasks/index.md`. Nobody edits that index by hand.

## What two tasks never change at once

- `packages/store/migrations`, the generated query files and the indexes of `packages/store/knowledge`;
- `packages/virtual/settings`;
- `go.work`, the `go.mod` files and `pnpm-lock.yaml`;
- `plans/reborn/decisions` and `plans/reborn/index.md`, the coordinator's;
- `apps/**/cmd/**`, the user's: describe a change there and ask for it, never make it unasked.

Otherwise tasks run in parallel when their `packages` do not overlap.

## Merge

`make gates` takes about 15 minutes, and only one run at a time is safe.

1. Make a worktree `merge-<date>` from `main` and merge every ready branch into it.
2. Run `make gates` there once.
3. From the main checkout: `git merge --ff-only merge-<date>`, then `git worktree remove` and `git branch -d` for the
   batch and each branch in it. `--force` only when ignored build output blocks a removal and `git status` is clean.
4. When the gates fail, the branch at fault leaves the batch and goes back to its task.

Never work on `main`. Never push.

## Decisions

- A decision the user confirms becomes `decisions/NNNN-<slug>.md` with `status: accepted`, quoting the user's words.
- A changed decision gets a new file; the old one gets `status: superseded` and `superseded_by`. A decision of a
  history bundle that a new one replaces gets `superseded_by: reborn/NNNN`. Accepted text is never rewritten.
- Outside its bundle a decision is cited with it: "reborn 0002", "server 0045", "holo-port 0097".
- An architecture choice that no decision covers is asked to the user before acting.

## Checks

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/reborn plans/holo-port plans/server plans/client
```

It checks the frontmatter, the index listings, the links and every `plans/…` path in backticks, the statuses, and that
each task names a slice and tasks that exist. `make gates` runs it.

## Gotchas

- `index.md` and `log.md` are reserved OKF files: no frontmatter, except the root `index.md`.
- Links inside a bundle are bundle-absolute (`/tasks/platform-01-drop-the-unused-listener.md`). Code and files of other
  bundles are named by their repository path in backticks.
- Timestamps are ISO 8601 with an explicit offset.
- The log takes only decisions, slices and merges. A task's start and end live in its file and in git.
