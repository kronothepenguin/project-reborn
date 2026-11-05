---
type: Task
title: Add the backend and client templates to tools/create
description: tools/create takes -template=fullstack|backend|client, generating today's output, a Go package and runner without a frontend, or a Vite package like client-r26.
status: todo
phase: s0
depends_on: [s0-01]
packages: [tools/create]
client: []
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`tools/create` makes the three kinds of project of [0003](/decisions/0003-create-templates.md), so that the server is
created without a frontend.

# Steps

- [ ] Ask the user S0's open question for this task: the client template's dev server port, derived from the name like
  the Astro port, or chosen otherwise. Record the answer as a decision.
- [ ] `-template=fullstack|backend|client`, `fullstack` by default; any other name is refused with the usage line.
- [ ] The templates move under one folder per kind. `fullstack` generates exactly what `tools/create` generates today.
- [ ] `backend`:
  - `packages/<name>`: the Go package in the shape of the fullstack one without the Astro resolver and the static
    handler (`New(db)` and `Mount(mux)`), `go.mod`, a `Makefile` whose `install` downloads the modules, and `README.md`;
  - `apps/<name>`: `cmd/<name>/main.go`, `.air.toml` building `cmd/<name>`, the `Makefile` and `README.md`;
  - no Astro, no pnpm, no `-dev` runner.
- [ ] `client`: `packages/<name>` only, like `packages/client-r26`: `package.json` named `@project-reborn/<name>`,
  `vite.config.js`, `index.html`, `src/main.js`; nothing in `apps/`, and no `go work use`.
- [ ] The dry run and the printed plan follow the template: no Astro port for `backend`, no app port for `client`.
- [ ] The root `Makefile`'s `create` target passes `template=` through.
- [ ] Tests: every template renders, every file ends with a newline, and the generated Go passes `gofmt`, as today's
  tests check for the fullstack one.
- [ ] In a throwaway worktree, create one project of each kind, run its gates (Go: `gofmt`, `go vet`, `go test`;
  client: `pnpm install` and `pnpm build`), then delete the worktree.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
make tools
./tools/create/bin/create -dry-run demo
./tools/create/bin/create -dry-run -template=backend demo
./tools/create/bin/create -dry-run -template=client demo
./tools/create/bin/create -dry-run -template=other demo   # refused
```

# Notes

- Runs on the branch `s0`.
