---
type: Spec
title: Checks
description: Every project checks itself with `make check`, one command lists a project's dependants, and `make check` at the root runs every check for CI.
status: done
projects: [make, tools/checks, tools/create, tools/tw-color, apps/cms, apps/housekeeping, apps/installer, apps/server, packages/astro, packages/auth, packages/client-r26, packages/cms, packages/components, packages/config, packages/director, packages/housekeeping, packages/installer, packages/scheduler, packages/server, packages/store, packages/virtual]
---

# What

Every project checks itself with one command, `make check`. What it runs follows from the files the project has: a
`go.mod` brings the Go steps, a `package.json` brings its scripts. An agent that changes a project runs `make check`
there and in every project that depends on it. `make check` at the root runs every project's check, for CI. It
replaces the old root target.

# Behaviours

- A project whose code is right, `make check` runs in its folder: it passes.
- A project with a `go.mod`, `make check` runs: it checks the formatting, vets, tests and builds the Go code.
- A project with a `package.json`, `make check` runs: it runs the `build`, `check` and `test` scripts the package
  declares.
- A project with both, `make check` runs: the `build` script runs first, so the Go tests and the Go build see what it
  made.
- A Go file left unformatted, `make check` runs in its project: it fails and names the file.
- A Go project that fails vet, `make check` runs: it fails and names the file.
- A Go project that does not build, `make check` runs: it fails and shows the build error.
- A test that fails, `make check` runs in its project: it fails and shows the test.
- A package script that fails, `make check` runs: it fails.
- A project changed, the agent asks for its dependants: it gets every project that uses it, directly or through
  another project. A Go import and a pnpm workspace dependency both count as a use.
- A project that no project uses, the agent asks for its dependants: the list is empty.
- A folder that is no project, the agent asks for its dependants: the command refuses it.
- A change in a project that breaks a project depending on it, `make check` runs in the dependant: it fails.
- Every project right, `make check` runs at the root: it runs `make check` in every project and the knowledge check,
  and passes.
- `make check` runs at the root: it leaves out the browser suites.
- One project wrong, `make check` runs at the root: it fails and names the project.
- One project wrong, `make check` runs at the root: it stops before the knowledge check.
- A new project made by `make create`, `make check` runs in it: it passes.
- A name is empty, starts with a digit, or holds a capital, an underscore or a slash: `make create` refuses it.
- A name whose Go package would not compile in the template, such as a keyword, `main` or a name the template uses: a
  template with Go refuses it and names the Go package, and a client accepts it.
- The name is `internal`, `testdata` or `vendor`: a template with Go refuses it, and a client accepts it.
- A name holds a dash: its folders keep the dash, its Go package drops it, and the project compiles.
- A new project gets ports from its name: the same ports each time, in separate app, Astro and Vite ranges.
- `make create` runs as a dry run: it lists only the folders and servers its template has.
- `make create` makes a backend: it holds no frontend files; a client holds no Go and no apps/ folder.
