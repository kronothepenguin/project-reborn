---
type: Task
title: Write the shared recipe and the dependants command
description: make/check.mk gives a project its `make check`, and tools/checks lists a project's dependants, both with their tests.
scope: [make, tools/checks, Makefile, go.work]
depends_on: []
skills: [applying-go-patterns, use-modern-go, testing-behaviours]
---

# Goal

The recipe and the command every other task of the feature builds on. This task implements these behaviours of the
spec:

- A project whose code is right, `make check` runs in its folder: it passes.
- A project with a `go.mod`, `make check` runs: it checks the formatting, vets, tests and builds the Go code.
- A project with a `package.json`, `make check` runs: it runs the `build`, `check` and `test` scripts the package
  declares.
- A project with both, `make check` runs: the `build` script runs first, so the Go tests and the Go build see what it
  made.
- A Go file left unformatted, `make check` runs in its project: it fails and names the file.
- A test that fails, `make check` runs in its project: it fails and shows the test.
- A project changed, the agent asks for its dependants: it gets every project that uses it, directly or through
  another project. A Go import and a pnpm workspace dependency both count as a use.
- A project that no project uses, the agent asks for its dependants: the list is empty.
- A change in a project that breaks a project depending on it, `make check` runs in the dependant: it fails.

# Context

- [Spec](/features/checks/spec.md)
- [Plan](/features/checks/plan.md): every decision, with the user's words
- [The projects today](/features/checks/research-projects.md): what each project has, who depends on whom, the
  commands that list dependants, and what a fresh worktree needs
- [Go layout](/go-layout.md): where tools live and how the root builds them
- [Shared files](/shared-files.md): `go.work` takes one task at a time, so this task runs alone
- [Soft rules](/rules.md)

# Steps

1. `make/check.mk` defines `check` for the project whose Makefile includes it.
   - With a `go.mod`: `gofmt -l` over the tracked Go files, failing with their names; `go vet ./...`;
     `go test ./... -race`; `go build ./...`.
   - With a `package.json`: the `build`, `check` and `test` scripts, each when the package declares it.
   - A project adds its own steps to `check` from its Makefile.
2. Steps that do not need each other run in parallel, and the Go tests and the Go build wait for the `build` script.
   The lines of one step stay together in the output.
3. `tools/checks` is a new Go module, added with `go work use`. Its Makefile includes the recipe.
4. `tools/checks/cmd/dependants` prints, one folder a line and sorted, every project that uses the folder it is given,
   directly or through another.
   - Projects: the folders of the Go workspace, the folders of the pnpm workspace, and a folder under `tools/` with
     its own `package.json`.
   - Links: the imports of each Go module, its tests included, and the workspace dependencies of each `package.json`.
   - A folder is one project, whatever it holds.
5. The root `Makefile` gains `make dependants project=<folder>`, which builds the tool as `make tools` does and runs
   it.
6. Tests in `tools/checks`, one per behaviour above, each named after its behaviour. A recipe test builds a tiny
   project in `t.TempDir()` and runs `make check` on it with the real recipe. A dependants test builds a tiny
   workspace the same way.
7. `tools/checks/README.md` says what the tool is and how to run it. `tools/checks/knowledge/` says what the command
   reads and what it prints.

# Checks

- `make check` in `tools/checks` passes.
- `make dependants project=packages/store` prints the projects of the store's row in the research, apps included.
- `make dependants project=packages/components` prints the three web packages and their apps.
- `make dependants project=apps/server` prints nothing.
- `python3 -I .agents/skills/documenting-with-okf/scripts/check.py` exits 0.
