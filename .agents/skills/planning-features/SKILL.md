---
name: planning-features
description: Plans a feature with the user as the master session, writing spec.md with the expected behaviours, plan.md with the architecture and decisions, and one task file per unit of work in the feature's folder under knowledge/features/, then spawns one slave per ready task and relays their reports. Use when the user wants to plan, change, resume or finish a feature, or asks what work is left.
---

# Planning features

The master is the session that talks to the user. It keeps the specs, the plans and the state of the tasks. Slaves do
the work, one task each. A feature lives in `knowledge/features/<feature>/`:

| File | Holds |
| --- | --- |
| `spec.md` | What to build: the expected behaviours |
| `plan.md` | How to build it: the architecture and the user's decisions |
| `tasks/NN-<slug>.md` | One task each, deleted by the slave that finishes it |

Before writing these files, read the example: [spec](assets/buying-furni/spec.md), [plan](assets/buying-furni/plan.md)
and [task](assets/buying-furni/tasks/02-server.md). Links inside one bundle are bundle-absolute
(`/features/buying-furni/spec.md`); a file of another bundle and any code are named by repo path in backticks. The
keys and sections of each file follow the `documenting-with-okf` skill.

## 1. Resume

Read `knowledge/index.md`, the feature's `spec.md` and `plan.md`, then list `knowledge/features/<feature>/tasks/` and
run `git worktree list`. Each task file is work that is left. A task is ready when every task in its `depends_on` is
gone, and taken when a worktree named `<feature>-<NN>` exists.

## 2. Spec with the user

Write `# What` in a few lines, then `# Behaviours`, one line each: a situation, an action, an outcome. Each behaviour
becomes a test, so the user reviews the tests here and approves the list. Keep the spec to what gets built next.
A spec with no tasks yet is `status: planned`; a feature the user sets aside is `status: parked`.

A feature with a built part and a planned part:

- `spec.md`: `# What` says what the feature does today, and the planned text follows a line `Next:`. Under
  `# Behaviours` the built lines come first, and the lines being built follow under `## Next`.
- `plan.md`: `# Architecture` holds one table under `Built:` and one under `Planned:`.
- When the planned part is built, move its lines up and remove `Next:`, `## Next` and `Planned:`.

The feature folder also holds other concepts beside `spec.md` and `plan.md`, such as `later.md` or `research-<x>.md`.

## 3. Plan with the user

Write `# Architecture` (which project does what) and `# Decisions` (each decision of the user with its reason). Ask
each open choice in plain words with a concrete example of what the user would see, the recommendation first with its
reason. Settle every question before work starts.

## 4. Tasks

- One file per task, one project per task where the work allows.
- Scopes leave each other's folders alone, so tasks run in parallel.
- The project's knowledge lists the shared files: one task at a time changes them.
- An interface that several tasks share is built first by one task alone; the others list it in `depends_on`.
  Example: `01-store` first, then `02-server` and `03-cms` at the same time.
- `# Goal` names the behaviours of `spec.md` the task implements, in the spec's words.
- Each task names its `scope`, `depends_on`, `skills`, the knowledge under `# Context` and commands under `# Checks`.
- Writing the tasks sets `status: active` in `spec.md`.

## 5. Before spawning

Read each ready task as its slave would. Ask the user every question it leaves open; write the answers into it.

## 6. Spawn

Spawn one slave per ready task, all ready tasks at once, each with this prompt:

```text
You are a slave. Work knowledge/features/<feature>/tasks/<NN>-<slug>.md with the working-tasks skill.
```

## 7. Reports

- Relay to the user each test beside the behaviour it proves.
- Turn every open question into a question for the user, and write the answer into the plan or a task.
- Bring each test that proves no behaviour to the user, who decides whether it stays.
- Spawn the tasks that became ready.

## 8. The master's own edits

The master edits `spec.md`, `plan.md` and the task files on the branch `<feature>-plan` in
`.claude/worktrees/<feature>-plan`, and merges it into `main` before the slaves start, as in step 7 of `working-tasks`.
A task the user drops is deleted there by the master.
Before the merge, run the knowledge check: `python3 -I .agents/skills/documenting-with-okf/scripts/check.py`.

## 9. Finish

When `tasks/` is empty, set `status: done` in `spec.md`. A later change edits `spec.md` and `plan.md`, adds tasks and
sets `status: active` again.
