# Project Reborn

A remake of Habbo Hotel as it was in 2008 (R26). `apps/` holds the runners. `packages/` holds the applications they
run, so one runner, `reborn`, embeds every app.

## Workflow: OKF + Skills

Plan fast, implement fast, fail fast, refactor fast, test fast, ship fast, then plan again. A spec stays small: it
covers what gets built next, so parallel agents build independent tasks and verify them quickly.

- Knowledge is OKF and is the single source of truth. `knowledge/` holds what crosses projects; `<project>/knowledge/`
  holds how one app or package works. Start at `knowledge/index.md`.
- A feature lives in `knowledge/features/<feature>/`: `spec.md` is what to build, `plan.md` is how to build it,
  `tasks/` holds one file per task.
- Skills in `.agents/skills/` hold how the user likes to build. An agent loads the skills its task names.
- Soft rules are in `knowledge/rules.md`.

## Hard rules

### Roles

1. An agent is a master or a slave. The master is the session that talks to the user.
2. The master keeps the general context: specs, plans and the state of the tasks. Details stay in the task files.
3. The master spawns parallel slaves to do the work, one task each.
4. The master asks the user every question a slave could have, before the slave starts.
5. A slave follows its task and its master's rules, and reports what it finds. The master and the user decide.

### Decisions

6. The user defines the architecture. Agents follow `plan.md`.
7. An agent asks when something is unclear or ambiguous.

### Git

8. An agent works on a feature branch in its own git worktree.
9. An agent that finishes merges its branch into `main`, then deletes the branch and the worktree.
10. Commits hold source files. Compiled programs stay out of git.

### Tests

11. A test proves one expected behaviour of the spec: a situation, an action, an outcome.
12. A failing test starts a review of the code. Tests change when the spec changes.
13. An agent that changes a project runs the checks of that project and of every project that depends on it.
