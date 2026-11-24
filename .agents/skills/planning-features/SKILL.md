---
name: planning-features
description: Plans a feature with the user as the master session, writing spec.md with the expected behaviours, plan.md with the architecture and decisions, and one task file per unit of work in the feature's folder under knowledge/features/, then spawns one slave per ready task, or per brief for work without behaviours, turns their reports into questions for the user, and calls one slave's turn at a time to rebase and deliver before it fast-forwards main. Use when the user wants to plan, change, resume or finish a feature, asks what work is left, or hands over work without behaviours such as a skill rewrite, a doc fix or a rename.
---

# Planning features

The master is the session that talks to the user. It keeps the specs, the plans and the state of the tasks. Slaves do
the work, one task each. A feature lives in `knowledge/features/<feature>/`: `spec.md` is what to build, `plan.md` is
how to build it, `tasks/` holds one file per task.

The keys and sections of these files, and when a task is ready, taken or done, follow the `documenting-with-okf` skill.
Before writing them, read the example: [spec](assets/buying-furni/spec.md), [plan](assets/buying-furni/plan.md) and
[task](assets/buying-furni/tasks/02-server.md).

## 1. Resume

Read `knowledge/index.md`, the feature's `spec.md` and `plan.md`, then list `knowledge/features/<feature>/tasks/` and
run `git worktree list`. Each task file is work that is left.

## 2. Spec with the user

Write `# What`, then `# Behaviours`. Each behaviour becomes a test, so the user reviews the tests here and approves the
list. Keep the spec to what gets built next.

## 3. Plan with the user

Write `# Architecture` and `# Decisions`. Ask each open choice in plain words with a concrete example of what the user
would see, the recommendation first with its reason. Settle every question before work starts.

## 4. Tasks

- One file per task, one project per task where the work allows.
- Scopes leave each other's folders alone, so tasks run in parallel.
- The project's knowledge lists the shared files: one task at a time changes them.
- An interface that several tasks share is built first by one task alone; the others list it in `depends_on`.
  Example: `01-store` first, then `02-server` and `03-cms` at the same time.
- Writing the tasks sets `status: active` in `spec.md`.

## 5. Before spawning

Read each ready task as its slave would. Ask the user every question it leaves open; write the answers into it.

## 6. Spawn

Spawn one slave per ready task, all ready tasks at once. The master is the smartest model; slaves run on a cheaper
model that is good at doing the work: a Fable master spawns Opus slaves; an Opus master spawns Sonnet slaves, or Opus
slaves at a lower effort. Each gets this prompt:

```text
You are a slave. Work knowledge/features/<feature>/tasks/<NN>-<slug>.md with the working-tasks skill.
```

## 7. Reports

- A slave reports its work ready, then delivered. Put each ready slave in the queue of turns, as in step 8.
- Relay to the user each test beside the behaviour it proves.
- Turn each finding into a question for the user as the report arrives: each place where the code contradicted a
  source, each open question, each test that proves no behaviour.
- Write each answer into the spec, the plan or a task.
- Write each fact of "Facts for other tasks" into the task it serves, and send it to a slave already working that task.
- Spawn the tasks that became ready.

## 8. Turns

The master keeps the queue of ready slaves and calls one turn at a time.

1. Pick the next slave by priority and by what unblocks other tasks. Send it a message: its turn has come.
2. The slave rebases on `main`, runs its checks and the whole browser run, and reports the work delivered.
3. From the main checkout, run each command on its own:

   ```sh
   git merge --ff-only <branch>
   git worktree remove .claude/worktrees/<branch>
   git branch -d <branch>
   ```

   Add `--force` to the remove only when `git status` in the worktree is clean and ignored files such as
   `node_modules` block it.
4. Send a refused fast-forward, a conflict or a failure back to its slave, which holds the context. It delivers again.
5. Call the next turn.

## 9. The master's own edits

The master writes `spec.md`, `plan.md` and the task files itself, on the branch `<feature>-plan` in
`.claude/worktrees/<feature>-plan`, and delivers it before the slaves start. It runs the knowledge check,
`python3 -I .agents/skills/documenting-with-okf/scripts/check.py`, commits, rebases on `main` between two turns, and
fast-forwards `main` as in step 8. A task the user drops is deleted there by the master.

## 10. Finish

When `tasks/` is empty, set `status: done` in `spec.md`. A later change edits `spec.md` and `plan.md`, adds tasks and
sets `status: active` again.

## Work without behaviours

Work with no behaviour to test goes to a slave as a brief, with no feature folder and no task file. Examples: rewriting
a skill, fixing a doc, a rename that follows a rule. The brief is the slave's prompt and names:

```text
You are a slave. Work this brief with the working-tasks skill.
Goal: <what the work achieves>
Scope: <the repo folders and files it changes>
Skills: <the skills to load>
Checks: <the commands to run>
Branch and worktree: <slug>
```

Ask the user every question the brief leaves open, spawn it as in step 6, handle its reports as in step 7 and call its turn as in step 8.
