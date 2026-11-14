---
type: Task
title: Run every check from the root and retire make gates
description: make check at the root runs every project's check and the knowledge check, CI calls it, and the knowledge and the open tasks say make check.
scope: [Makefile, make, tools/checks, .github, knowledge, README.md, apps, packages, tools, tests]
depends_on: [02-go-packages, 03-web-projects, 04-javascript-projects, 05-create-templates]
skills: [testing-behaviours, documenting-with-okf]
---

# Goal

One command checks the whole repository, and the word "gates" leaves it. This task implements these behaviours of the
spec:

- Every project right, `make check` runs at the root: it runs `make check` in every project and the knowledge check,
  and passes.
- One project wrong, `make check` runs at the root: it fails and names the project.

# Context

- [Spec](/features/checks/spec.md)
- [Plan](/features/checks/plan.md): the root runs the projects one after another; the browser suites run apart
- [The projects today](/features/checks/research-projects.md): what `make gates` ran, and what CI calls
- [Workflow](/workflow.md) and [Shared files](/shared-files.md)
- The knowledge folder of `tools/checks`: the dependants command, written by task 01
- Facts the earlier tasks reported, for the playbook:
  - `gofmt` reads tracked files, so a new project's Go files count once `git add` has run.
  - `index.py` runs with no argument, or on a bundle root. Given a sub-folder it treats that folder as a root.
  - An app has no tests: its check prints "[no test files]" and passes.
  - `tools/tw-color` sits outside the pnpm workspace and its check runs there with nothing installed.

# Steps

1. `make check` at the root runs `make check` in every project of `apps/`, `packages/` and `tools/`, one after
   another, then the knowledge check. It stops at the first project that fails and names it. `tests/e2e` stays
   outside: `make e2e` runs the browser suites.
2. Keep the loop where a test can run it: a file in `make/` that the root Makefile includes. Tests in `tools/checks`
   prove the two behaviours on a tiny root built in a temporary folder.
3. `make gates` goes from the root Makefile. `frontends` stays for `release`.
4. `.github/workflows/ci.yml` and `release.yml` call `make check` where they called `make gates`.
5. A new playbook in the root knowledge folder, `checks.md`: how to check one project, how to list its dependants and
   check them, how to check everything, how to run the browser suites, and what a fresh worktree needs first. Take
   the last part from the research.
6. The word "gates" leaves the repository, the decisions apart: the READMEs, the knowledge, the comments of the
   Makefiles. Each place says `make check`, and names the root when it means everything.
7. The open tasks under `knowledge/features/*/tasks/`: a `# Checks` line that calls `make gates`, or lists
   `go vet` and `go test` module by module, becomes `make check` in each project of the task's `scope` and in its
   dependants (`make dependants project=<folder>`).
8. `knowledge/shared-files.md` gains `make/check.mk` and the root `Makefile`. `knowledge/to-settle.md` loses its entry
   about this feature. When `tasks/` of this feature is empty after your own file goes, set `status: done` in
   `knowledge/features/checks/spec.md`.

# Checks

- `make check` at the root passes. It is the full run: start it last, after `git merge main`.
- `git grep -n -i "gates"` shows only decisions and a user's quoted words.
- `make e2e` is unchanged: `make -n e2e` prints what it printed before.
- One run for the two kinds of new project that task 05 could prove only in part: in your worktree,
  `make create name=probe template=fullstack`, `pnpm install`, then `make check` in `packages/probe` and in
  `apps/probe`; then the same with `template=client`. Remove the probe folders, restore `go.work` and
  `pnpm-lock.yaml`, and show `git status` clean of them. Report each result.
- `python3 -I .agents/skills/documenting-with-okf/scripts/check.py` exits 0.
