---
type: Decision
title: No agent works on main
description: Every line of work, sequential or parallel, goes on its own feature branch in its own worktree, and the agent merges it into main by itself once its work is done and every gate passes.
status: accepted
timestamp: 2026-11-05T20:51:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:51:02+00:00"}
tags: [process, git]
---

# Decision

- No agent works on `main`: nothing is edited or committed in the main checkout.
- Every line of work, sequential or parallel, goes on its own feature branch in its own worktree under
  `.claude/worktrees/<branch>`, so that many agents can work at once.
- When its work is done and every gate passes, the agent merges the branch into `main` by itself, without asking. It
  merges `main` into the branch inside its worktree, runs every gate there, and then fast-forwards `main` from the main
  checkout with `git merge --ff-only <branch>`. If `main` moved in the meantime, it starts again. That fast-forward is
  the only thing an agent does on `main`.
- What [0046](/decisions/holo-port/0046-main-and-feature-branches.md) says about commits still holds: the agent commits without
  waiting to be asked, titles are one line in the style of the history, each commit builds on its own, and the agent
  never pushes.
- `.claude/worktrees/` is ignored by git.

# Context

Supersedes [0046](/decisions/holo-port/0046-main-and-feature-branches.md), which put sequential work on `main`. On 2026-11-05,
while another session was committing P5 on `main`, the user asked: "i would prefer to modify main rule to prevent any
agent for working there and use always feature branches + worktrees so i can spawn many agents at the same time."

Asked how a finished branch reaches `main`, the user chose that the agent merges it on its own as soon as its gates
pass, over asking first or leaving the merge to them. Merging `main` into the branch first and then fast-forwarding is
the agent's reading of how to keep 0046's rule that every gate passes on the merged result: `main` only ever receives a
result that has already passed. Ignoring `.claude/worktrees/` came from the P5 session, which found that `git stash -u`
in the main checkout would sweep the worktrees up.

# Consequences

- The rule is written in the root `AGENTS.md` and `README.md`, the rules, the root index and
  the `tracking-holo-port` skill.
- P5 moved from `main` to the branch `p5` on 2026-11-05.
