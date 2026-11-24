---
type: Spec
title: "Task queue: a tool for the work in flight"
description: One command shows every task in flight and its state, starts a task's branch and worktree, marks work ready, gives one turn at a time, delivers at the turn and merges, with its state on disk so a closed session picks the work up again.
status: active
projects: [tools/tasks, Makefile, .agents/skills, knowledge]
---

# What

The work in flight lives on disk. A master or a slave asks one tool what is open, who is ready and who holds the turn,
and the tool carries out the mechanical steps of [the delivery](/workflow.md): the branch and the worktree, the mark of
ready, the turn, the rebase with its checks, the merge. A session that was closed reads the same answer when it comes
back.

The user, 2026-11-24: "do you think creating a tool for our workflow would be better and costs effective rather than
using skills? as example creating a tool to keep the queue, so if pc is shutdown (claude code is closed) we keep the
information of the ongoing work, and then can resume it later?" Then: "yes, plan the tool, state in git and local
files".

# Behaviours

## Next

### What is in flight

- An agent asks for the status: every open task and every branch in flight shows with its state, its commits ahead of
  and behind `main`, whether its worktree is clean, since when it is ready, its note, and who holds the turn.
- A machine is shut down while tasks are in flight, and a new session asks for the status: it reads the same states,
  notes and turn.
- A task has a file on `main` and no branch: it shows as planned.

### Starting and marking

- An agent starts a task: its branch and its worktree exist, with what a fresh worktree needs installed.
- A slave writes a note: the status shows it beside the task, what is done and what is left.
- A slave marks its work ready with everything committed: the task joins the queue, at the time it first became ready.
- A slave marks its work ready with changes left uncommitted: it is refused, and told which files.

### The turn

- The master gives the turn to a ready task while nobody holds it: that task holds the turn.
- The master gives the turn while a task holds it: it is refused, and told who holds it.
- A slave delivers while it holds the turn: its branch is rebased on `main`, the checks of every project it changed
  and of every project that depends on them run, and the whole browser run runs once; the task is delivered at that
  commit.
- A slave delivers work that changed documents alone: the knowledge check runs alone.
- A slave delivers without the turn: it is refused.
- The rebase conflicts: the delivery stops with the turn kept, the slave resolves, and delivering again goes on.
- A check or a browser suite fails: the delivery stops and the turn is free for the next ready task; the task keeps
  its place in the queue, and its slave marks it ready again once it is fixed.

### The merge

- The master merges a task delivered at its branch's last commit, with `main` where the delivery left it: `main` moves
  to the branch by a fast-forward, the worktree and the branch go, and the turn is free.
- The master merges a task that is not delivered, or whose branch or `main` moved since: it is refused, and told why.
