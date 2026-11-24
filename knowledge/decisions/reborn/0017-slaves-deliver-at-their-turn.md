---
type: Decision
title: Slaves run focused tests, and deliver one at a time at the master's call
description: A slave runs focused tests while it builds and reports its work ready; the master calls one turn at a time, in which the slave rebases on main, runs its projects' checks and the whole browser run once and reports it delivered; the master fast-forwards main.
status: accepted
timestamp: 2026-11-24T11:26:54-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-24T11:26:54-05:00"}
tags: [process, git, tests, agents]
---

# Decision

- While it builds, a slave runs focused tests: those of the code it changes, and the one browser suite its change
  touches.
- When they pass, the slave commits on its branch, keeps the branch and the worktree, and reports the work ready.
- The master keeps the order of the merges and calls one slave's turn at a time, by priority and by what unblocks other
  tasks.
- At its turn the slave rebases its branch on `main`, resolves its conflicts, runs the checks of every project it
  changed and of their dependants, and the whole browser run once. It fixes what breaks and reports the work delivered.
- The master fast-forwards `main` to the branch, deletes the branch and the worktree, and calls the next turn.
- One whole browser run goes at a time: the slave that holds the turn runs it.
- Work that changes documents alone runs the knowledge check alone.
- A conflict the master meets goes back to its slave.
- `main` is a straight line: branches are rebased and fast-forwarded, with no merge commits.
- A slave still writes its own lines of the spec and the plan, and resolves them at its rebase.

# Context

Until now each slave ran every check and `make e2e`, merged `main` into its branch and fast-forwarded `main` itself.
On 2026-11-24 the user: "please optimize the running of tests, i've seen slaves always run e2e even if no functionality
have changed. and maybe you are running tests twice, when developing something run focus tests, and execute e2e tests
only before delivering the work." And: "i've seen many slaves running e2e at the same time, is this correct? what i
expect is the slave to do the job and running focus tests so it has instant feedback and also expect e2e so we make
sure the slave did not break anything else. as the slave have all the context i would prefer to give the feedback to
that slave if something goes wrong."

On who rebases: "the master to prioritize and tell the slaves when it is time to merge, then the slave that is ready to
merge does the rebase and tell the master when it's done, the master then recieves the branch and merge". The user
confirmed the protocol the same day: "yes, this is the protocol i want".

# Consequences

- It supersedes the part of [holo-port 0097](/decisions/holo-port/0097-no-agent-works-on-main.md) where the agent
  merges its own branch: the master fast-forwards `main`, and the branch is rebased in place of merging `main` into it.
- The hard rules of `AGENTS.md` become Git rules 8 to 11 and Tests rules 12 to 16.
- [The workflow](/workflow.md), [the checks](/checks.md), the soft rules, the rules of a browser run and the
  `working-tasks`, `planning-features` and `testing-behaviours` skills say the protocol.
