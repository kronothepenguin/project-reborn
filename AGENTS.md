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
9. A slave that finishes commits on its branch and reports it ready. The master sets the order of the merges and calls
   each slave's turn.
10. At its turn a slave rebases its branch on `main` and resolves its conflicts. The master then fast-forwards `main` to
    the branch, and deletes the branch and the worktree.
11. Commits hold source files. Compiled programs stay out of git.

### Tests

12. A test proves one expected behaviour of the spec: a situation, an action, an outcome.
13. A failing test starts a review of the code. Tests change when the spec changes.
14. While it builds, a slave runs focused tests: those of the code it changes, and the browser suite its change touches.
15. At its turn, after the rebase, a slave runs the checks of every project it changed and of every project that depends
    on it, and the whole browser run once. One whole browser run goes at a time.
16. Work that changes documents alone runs the knowledge check alone.
