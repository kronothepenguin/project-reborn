---
type: Playbook
title: Workflow
description: The map of the OKF + Skills cycle: where knowledge, features and skills live, who does what, how work is delivered to main, and which skill serves each moment.
---

# Cycle

Plan, implement, test, ship, then plan again. A spec stays small, so parallel agents build independent tasks and
everything is verified quickly. OKF keeps the important information in each agent's context, and skills make different
agents work the same way.

# Where things live

| Path | Holds |
| --- | --- |
| `AGENTS.md` | The hard rules. |
| `knowledge/` | The root OKF bundle: what crosses projects. |
| `<project>/knowledge/` | One OKF bundle per app or package: how it works. |
| `knowledge/features/<feature>/` | One feature: its spec, its plan and its tasks. |
| `knowledge/decisions/<series>/<NNNN>-<slug>.md` | One decision, cited as `decision <series>/<NNNN>`. |
| `.agents/skills/` | How the user likes to build, for any repo. |
| `.claude/worktrees/` | The worktree of each branch: `<feature>-<NN>`, `<feature>-plan` or a brief's slug. |

Skills hold the user's rules. Knowledge holds the repo's facts: paths, commands and names. Each task links the
knowledge its slave needs. The shape of a feature's files is in the `documenting-with-okf` skill. Only one task at a
time changes the [shared files](/shared-files.md).

# Who does what

- The master talks to the user. It writes `spec.md`, `plan.md` and the task files itself on the branch
  `<feature>-plan`, asks every question first, spawns one slave per ready task, and turns each finding of a report into
  a question for the user.
- The master is the smartest model. Slaves run on a cheaper model that is good at doing the work: a Fable master
  spawns Opus slaves; an Opus master spawns Sonnet slaves, or Opus slaves at a lower effort.
- Work with no behaviour to test, such as a skill rewrite, a doc fix or a rename, goes to a slave as a brief in its
  prompt, with no feature folder and no task file.
- A slave works its task or brief on its own branch and worktree, updates the knowledge it makes stale, and delivers
  its work in the five steps below.
- The user approves the behaviours in `spec.md` before the work and reviews the tests, each of which proves one of them.

# Delivery

| Step | Who | What |
| --- | --- | --- |
| 1. Develop | Slave | Builds and runs focused tests: those of the code it changes, and the one browser suite its change touches. |
| 2. Ready | Slave | Commits on its branch, keeps the branch and the worktree, and reports the work ready. |
| 3. Turn | Master | Keeps the order of the merges and calls one slave's turn at a time. |
| 4. Deliver | Slave | Rebases on `main`, resolves its conflicts, runs the [checks](/checks.md) of every project it changed and of their dependants and the whole browser run once, fixes what breaks, and reports the work delivered. |
| 5. Merge | Master | Fast-forwards `main` to the branch, deletes the branch and the worktree, and calls the next turn. |

- Ready means the work is built, its focused tests pass and it is committed on its branch.
- A turn is the slave's slot to rebase, run the full checks and deliver. One slave holds the turn at a time, so one
  whole browser run goes at a time.
- The master orders the turns by priority and by what unblocks other tasks.
- Work that changes documents alone runs the knowledge check alone, with no browser run.
- A conflict or a failure the master meets goes back to its slave, which holds the context.
- `main` is a straight line: branches are rebased and fast-forwarded, with no merge commits.
- A slave writes its own lines of the spec and the plan, and resolves them at its rebase.
- The master's own edits on `<feature>-plan` are rebased and fast-forwarded the same way.

# Skills

| Moment | Skill |
| --- | --- |
| The master plans a feature, writes its tasks or briefs a slave | `planning-features` |
| A slave works a task or a brief | `working-tasks` |
| An agent writes tests from behaviours | `testing-behaviours` |
| An agent writes or checks OKF, including a feature's files | `documenting-with-okf` |
| An agent writes or reviews a skill | `reviewing-skills` |
