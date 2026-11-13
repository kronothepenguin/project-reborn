---
name: working-tasks
description: Works one task file of a feature under knowledge/features/ as a slave, in its own worktree and branch named after the feature and the task number, with behaviour tests, the checks of every project changed and of its dependants, updated knowledge, a merge into main and a report to the master. Use when a master hands over a task file or asks a slave to work a planned task.
---

# Working tasks

A slave works one task and reports to its master. The master and the user decide.

## 1. Read

Read the task file, the feature's `spec.md` and `plan.md`, and each file under `# Context`. Load each skill in
`skills`.

## 2. Worktree

The worktree and the branch are both named `<feature>-<NN>`, from the task's feature folder and number:

```sh
git worktree add -b <feature>-<NN> .claude/worktrees/<feature>-<NN> main
```

Work there.

## 3. Steps

Do the steps of `# Steps`. Change only the folders in `scope`.

## 4. Tests

Write one test per behaviour the task implements, with the `testing-behaviours` skill.

## 5. Checks

Run the commands under `# Checks`, the checks of every project changed, and the checks of every project that depends
on those. Each project's knowledge says how to run them. A failing check starts a review of the code, with the
`testing-behaviours` skill.

## 6. Knowledge

Update the knowledge files the change makes stale, in the project's own `knowledge/` folder.

## 7. Finish

Run in this order:

1. Delete the task file.
2. Commit with a one-line title that starts with `feat:`, `fix:`, `refactor:` or `docs:`. Stage explicit paths.
3. In the worktree: `git merge main`. Re-run the checks when the merge brought changes.
4. From the main checkout: `git merge --ff-only <feature>-<NN>`. When it is refused, repeat from step 3.
5. From the main checkout: `git worktree remove .claude/worktrees/<feature>-<NN>`, then
   `git branch -d <feature>-<NN>`.

## 8. Report

Report to the master, in this shape:

```markdown
Changed: <what changed, by path>
Tests:
- <test name>: <behaviour of spec.md it proves>
Checks:
- <command>: <pass or fail, with the failure>
Open questions:
- <question>
```

## Open questions

A question that the task, the spec and the plan leave open stops the work: report it, and the master asks the user.
