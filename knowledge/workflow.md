---
type: Playbook
title: Workflow
description: The OKF + Skills cycle: where knowledge, features and skills live, and who plans, builds and ships them.
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
| `.agents/skills/` | How the user likes to build, for any repo. |

Skills hold the user's rules. Knowledge holds the repo's facts: paths, commands and names. Each task links the
knowledge its slave needs.

# A feature

- `spec.md` is what to build. Frontmatter: `type: Spec`, `title`, `description`, `status` (`planned`, `active`, `done`
  or `parked`) and `projects` (the repo folders it touches). Body: `# What`, `# Behaviours` (one line each: a
  situation, an action, an outcome) and `# Open questions` while any remain.
- `plan.md` is how to build it. Frontmatter: `type: Plan`, `title`, `description`. Body: `# Architecture` (which
  project does what) and `# Decisions` (each decision of the user with its reason).
- `tasks/NN-<slug>.md` is one task. Frontmatter: `type: Task`, `title` (imperative), `description`, `scope` (the repo
  folders it changes), `depends_on` (task names of the same feature, `[]` when none) and `skills` (the skills its slave
  loads). Body: `# Goal`, `# Context`, `# Steps` and `# Checks`.

A task is ready when every task in its `depends_on` is gone. A task is taken when the worktree `<feature>-<NN>` exists.
A task is done when its slave deletes its file, so `tasks/` shows the work that is left.

A feature keeps `spec.md` and `plan.md` for good. A change to a feature edits them and adds tasks. Built features are
documented the same way. One project or many, the shape is the same, and tasks of different projects run in parallel.

# Who does what

The master is the session that talks to the user. It writes `spec.md` and `plan.md` with the user, asks every question
first, writes the task files and spawns one slave per ready task, in parallel.

A slave reads its task, the feature's `spec.md` and `plan.md` and the files under `# Context`, and loads the skills the
task names. It works on branch `<feature>-<NN>` in `.claude/worktrees/<feature>-<NN>`, writes one test per behaviour,
runs the checks of every project it changed and of the projects that depend on them, and updates the knowledge its
change makes stale. Then it deletes its task file, merges into `main`, removes its worktree and branch, and reports to
the master.

The user approves the behaviours in `spec.md` before the work and reviews the tests, each of which proves one of them.

# Skills

| Moment | Skill |
| --- | --- |
| The master plans a feature and writes its tasks | `planning-features` |
| A slave works a task | `working-tasks` |
| An agent writes tests from behaviours | `testing-behaviours` |
| An agent writes or checks OKF | `documenting-with-okf` |
| An agent writes or reviews a skill | `reviewing-skills` |
