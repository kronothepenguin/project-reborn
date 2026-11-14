---
type: Spec
title: Checks
description: Every project checks itself with `make check`, one command lists a project's dependants, and `make check` at the root runs every check for CI.
status: active
projects: [make, tools/checks, tools/create, tools/tw-color, apps/cms, apps/housekeeping, apps/installer, apps/server, packages/astro, packages/auth, packages/client-r26, packages/cms, packages/components, packages/config, packages/director, packages/housekeeping, packages/installer, packages/scheduler, packages/server, packages/store, packages/virtual]
---

# What

Every project checks itself with one command, `make check`. What it runs follows from the files the project has: a
`go.mod` brings the Go steps, a `package.json` brings its scripts. An agent that changes a project runs `make check`
there and in every project that depends on it. `make check` at the root runs every project's check, for CI. It
replaces `make gates`.

# Behaviours

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
- Every project right, `make check` runs at the root: it runs `make check` in every project and the knowledge check,
  and passes.
- One project wrong, `make check` runs at the root: it fails and names the project.
- A new project made by `make create`, `make check` runs in it: it passes.
