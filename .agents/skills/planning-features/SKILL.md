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

Before writing these files, read the example feature: [spec.md](assets/buying-furni/spec.md),
[plan.md](assets/buying-furni/plan.md) and [a task](assets/buying-furni/tasks/02-server.md). Links inside one bundle
are bundle-absolute (`/features/buying-furni/spec.md`); a file of another bundle and any code are named by their repo
path in backticks.

## 1. Resume

Read `knowledge/index.md`, the feature's `spec.md` and `plan.md`, then list `knowledge/features/<feature>/tasks/` and
run `git worktree list`. Each task file is work that is left. A task is ready when every task in its `depends_on` is
gone, and taken when a worktree named `<feature>-<NN>` exists.

## 2. Spec with the user

Write `# What` in a few lines, then `# Behaviours`, one line each: a situation, an action, an outcome. Each behaviour
becomes a test, so the user reviews the tests here and approves the list. Keep the spec to what gets built next.

## 3. Plan with the user

Write `# Architecture` (which project does what) and `# Decisions` (each decision of the user with its reason). Ask
each open choice in plain words with a concrete example of what the user would see, the recommendation first with its
reason. Settle every question before work starts.

## 4. Tasks

- One file per task, one project per task where the work allows.
- Scopes leave each other's folders alone, so tasks run in parallel.
- An interface that several tasks share is built first by one task alone; the others list it in `depends_on`.
  Example: `01-store` first, then `02-server` and `03-cms` at the same time.
- Each task names its `scope`, `depends_on` and `skills`, the knowledge under `# Context` and the commands under
  `# Checks`.
- `depends_on` names `NN-<slug>` for a task of the same feature and `<feature>/NN-<slug>` for a task of another
  feature.
- `projects` in `spec.md` also names the folders the feature will create (`packages/reborn`).

## 5. Before spawning

Read each ready task as its slave would. Ask the user every question it leaves open and write each answer into the
plan or the task.

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
`.claude/worktrees/<feature>-plan`, and merges it into `main` before the slaves start, as in step 7 of the
`working-tasks` skill.

## 9. Finish

When `tasks/` is empty, set `status: done` in `spec.md`. A later change edits `spec.md` and `plan.md` and adds tasks.
