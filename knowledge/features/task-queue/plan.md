---
type: Plan
title: "Task queue: how"
description: A Go tool in tools/tasks reads the tasks from the knowledge and from git, keeps the marks of ready, the turn and the notes in an ignored folder of the main checkout, and runs the steps of a delivery.
---

# Architecture

Planned:

| Project | Part |
| --- | --- |
| `tools/tasks` | A new Go module beside `tools/checks`: the `tasks` command, with one subcommand per step |
| Root `Makefile` | `make tools` builds it; `make tasks` prints the status |
| `.agents/skills` | `working-tasks` and `planning-features` call the tool for each step |
| `knowledge` | The workflow and the checks' playbook name the tool |

The shape the user approved on 2026-11-24:

```
tasks status
  every open task and branch: its state, commits ahead
  and behind main, clean or dirty, ready since, the note,
  and who holds the turn

tasks start <feature>/<NN>      (or: --brief <name>)
  branch + worktree + installs

tasks note "<text>"            slave: what is done, what is left
tasks ready                    slave: refuses a dirty tree; joins the queue

tasks turn <branch>            master: gives the turn; one at a time
tasks deliver                  slave: rebase on main, checks of the
                               changed projects and their dependants,
                               the whole e2e (the knowledge check alone
                               for documents); marks delivered
tasks merge <branch>           master: fast-forward, remove the worktree,
                               delete the branch, free the turn
```

# Where the state lives

| State | Read from |
| --- | --- |
| planned | The task file is on `main`, and no branch has its name |
| building | The branch `<feature>-<NN>` and its worktree `.claude/worktrees/<feature>-<NN>` exist |
| ready | `.claude/tasks/<branch>.json` in the main checkout says so, with the time |
| turn | `.claude/tasks/turn.lock` names the branch |
| delivered | The task's file there names the commit that passed and where `main` stood |
| merged | The branch is gone |

- `.claude/tasks/` is an ignored folder of the main checkout, beside `.claude/worktrees/`. Every worktree finds it
  through `git rev-parse --git-common-dir`, whose parent is the main checkout.
- Git itself gives the branches, the worktrees, the commits ahead and behind, and whether a tree is clean.
- Nothing of it is committed: `main` holds no bookkeeping.

# Decisions

Of 2026-11-24, the user's:

- A tool carries the mechanical steps and the queue; the skills keep the judgement ("yes, plan the tool").
- The state lives in git and in local files ("state in git and local files"), in an ignored folder outside `.git`:
  "would it be better creating a gitignore folder out of .git? i don't want to break anything about git because we are
  using its folder." A folder inside `.git` is safe too; the ignored folder is as good and is seen at a glance.
- A failed delivery frees the turn: "i also want to give the opportunity to another slave that is ready to deliver. i
  expect the slave that fails to solve everything but don't want to block the other slaves that could pass right
  away." The master's reading: a conflict of the rebase is resolved within the turn, since it is short; a failing
  check or suite frees the turn, and the task keeps its place in the queue.

# Notes

- The tool runs what the protocol names: `git rebase main`, `make dependants`, `make -C <folder> check`, `make e2e`,
  the knowledge's `index.py` and `check.py`, `git merge --ff-only`, `git worktree remove`, `git branch -d`.
- Work that changed documents alone is work whose changed files are all Markdown, under a `knowledge/` folder or
  under `.agents/skills`.
- A brief, work with no task file, is started by a name, and its state is kept the same way.
- The focused tests while a slave builds stay the slave's choice, in the skills.
