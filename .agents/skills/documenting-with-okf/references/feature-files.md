# Feature files

A feature lives in `knowledge/features/<feature>/`.

## Spec

`spec.md`, type `Spec`: what to build.

- Keys: `status` (`planned`, `active`, `done` or `parked`); `projects` (repo folders, existing or to create).
- Body: `# What`, `# Behaviours`, `# Open questions` while any remain.

## Plan

`plan.md`, type `Plan`: how to build it. Body: `# Architecture`, `# Decisions`.

## A built part and a planned part

- `spec.md`: `# What` says what the feature does today, and the planned text follows a line `Next:`. Under
  `# Behaviours` the built lines come first, and the lines being built follow under `## Next`.
- `plan.md`: `# Architecture` holds one table under `Built:` and one under `Planned:`.
- When the planned part is built, its lines move up, and `Next:`, `## Next` and `Planned:` go.

A feature folder also holds other concepts beside `spec.md` and `plan.md`, such as `later.md` or `research-<x>.md`.

## Task

`tasks/NN-<slug>.md`, type `Task`: one unit of work.

- Keys: `scope` (repo folders); `depends_on` (task names, `[]` when none); `skills` (folders of `.agents/skills/`).
- `depends_on` names `NN-<slug>` for a task of the same feature, `<feature>/NN-<slug>` for a task of another.
- Body: `# Goal`, `# Context`, `# Steps`, `# Checks`.
- `# Goal` names the behaviours of `spec.md` the task implements, in the spec's words.
- A task file is deleted when the task is done. A `depends_on` name with no file counts as done.
