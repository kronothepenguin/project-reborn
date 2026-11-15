# Feature files

A feature lives in `knowledge/features/<feature>/`: `spec.md`, `plan.md` and `tasks/`. Each file has `type`, `title`
and `description`, plus the keys of its type. One project or many, the shape is the same.

## Spec

`spec.md`, type `Spec`: what to build.

- Keys: `status` (`planned` before its tasks, `active` while tasks remain, `done` when `tasks/` is empty, `parked`
  when the user sets it aside); `projects` (the repo folders it touches, including folders the feature creates).
- Body: `# What` in a few lines, `# Behaviours` (one line each: a situation, an action, an outcome), and
  `# Open questions` while any remain.

## Plan

`plan.md`, type `Plan`: how to build it.

- Body: `# Architecture` (which project does what) and `# Decisions` (each decision of the user with its reason).
- `# Notes` is optional and holds facts that explain something in the code and live nowhere else.

## A built part and a planned part

- `spec.md`: `# What` says what the feature does today, and the planned text follows a line `Next:`. Under
  `# Behaviours` the built lines come first, and the lines being built follow under `## Next`.
- `plan.md`: `# Architecture` holds one table under `Built:` and one under `Planned:`.
- When the planned part is built, its lines move up, and `Next:`, `## Next` and `Planned:` go.

A feature folder also holds other concepts beside `spec.md` and `plan.md`, such as `later.md` or `research-<x>.md`.

## Task

`tasks/NN-<slug>.md`, type `Task`: one unit of work.

- `title` is imperative: `Run the purchase in the server`.
- Keys: `scope` (the repo folders it changes); `depends_on` (task names, `[]` when none); `skills` (the folders of
  `.agents/skills/` its slave loads).
- `depends_on` names `NN-<slug>` for a task of the same feature, `<feature>/NN-<slug>` for a task of another.
- Body: `# Goal` (the behaviours of `spec.md` the task implements, in the spec's words), `# Context` (the knowledge
  its slave reads), `# Steps` and `# Checks` (the commands that prove it).

## State

- A task is ready when every task in its `depends_on` is gone.
- A task is taken when the worktree `<feature>-<NN>` exists.
- A task is done when its slave deletes its file, so `tasks/` shows the work that is left.
- A feature keeps `spec.md` and `plan.md` for good. A change edits them and adds tasks. A built feature has the same
  shape.
