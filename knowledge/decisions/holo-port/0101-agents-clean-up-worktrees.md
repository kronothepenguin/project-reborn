---
type: Decision
title: An agent removes its worktree and its branch once merged
description: Once an agent's branch reaches main and its work is done, the agent removes the branch's worktree and deletes the merged branch, so that .claude/worktrees and git branch hold only work in progress.
status: accepted
timestamp: 2026-11-06T16:52:10+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T16:52:10+00:00"}
tags: [process, git]
---

# Decision

- Once its work is done and its branch has reached `main` by the fast-forward of
  [0097](/decisions/holo-port/0097-no-agent-works-on-main.md), the agent removes the branch's worktree and deletes the branch, from
  the main checkout: `git worktree remove .claude/worktrees/<branch>`, then `git branch -d <branch>`.
- `git branch -d` deletes only a merged branch, so nothing that has not reached `main` is lost. `git worktree remove`
  takes `--force` only when it refuses because of a checked-out submodule or ignored build output, and only after
  `git status` shows nothing uncommitted.
- Every worktree an agent works in is cleaned up this way, whatever made it: its own, the `agent-*` worktrees that
  subagents are given, and throwaway ones made for a test.
- `.claude/worktrees/` and `git branch` hold only work in progress.

# Context

On 2026-11-06 the user found worktrees that earlier sessions had left behind, two `agent-*` ones among them, and asked:
"please make sure every agent cleans up the worktrees once they are done. that means i'm asking you for deleting
client-plan and sources because you already finish that as i understand."

Asked whether the agent also deletes the merged branch, the user chose to delete it too, over keeping it. Asked about
what earlier sessions had left, the user chose to remove both `agent-*` worktrees and to delete the twelve branches
already merged into `main`. That was done the same day, which left `main` and `p5`.

# Consequences

- A branch that reaches `main` before its work is done, as `p5` did up to p5-07, keeps its worktree until its work ends.
- Work that has not reached `main`, such as a cancelled session's, keeps its worktree and branch: what happens to it is
  the user's call.
- The rule is written in the root `AGENTS.md` and `README.md`, `plans/index.md`, the rules of every plan, and the
  `tracking-plans` and `tracking-holo-port` skills.
