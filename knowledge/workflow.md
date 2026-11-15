---
type: Playbook
title: Workflow
description: The map of the OKF + Skills cycle: where knowledge, features and skills live, who does what, and which skill serves each moment.
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
- A slave works its task or brief on its own branch and worktree, runs the [checks](/checks.md) of every project it
  changed and of their dependants, updates the knowledge it makes stale, merges into `main` and reports.
- The user approves the behaviours in `spec.md` before the work and reviews the tests, each of which proves one of them.

# Skills

| Moment | Skill |
| --- | --- |
| The master plans a feature, writes its tasks or briefs a slave | `planning-features` |
| A slave works a task or a brief | `working-tasks` |
| An agent writes tests from behaviours | `testing-behaviours` |
| An agent writes or checks OKF, including a feature's files | `documenting-with-okf` |
| An agent writes or reviews a skill | `reviewing-skills` |
