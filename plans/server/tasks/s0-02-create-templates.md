---
type: Task
title: Add the backend and client templates to tools/create
description: tools/create takes -template=fullstack|backend|client, generating today's output, a Go package and runner without a frontend, or a Vite package like client-r26.
status: done
phase: s0
depends_on: [s0-01]
packages: [tools/create]
client: []
timestamp: 2026-11-06T17:54:14+00:00
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:54:14+00:00"}
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`tools/create` makes the three kinds of project of [0003](/decisions/0003-create-templates.md), so that the server is
created without a frontend.

# Steps

- [x] Ask the user S0's open question for this task: the client template's dev server port, derived from the name like
  the Astro port, or chosen otherwise. Record the answer as a decision: [0017](/decisions/0017-client-vite-port.md).
- [x] `-template=fullstack|backend|client`, `fullstack` by default; any other name is refused with the usage line.
- [x] The templates move under one folder per kind. `fullstack` generates exactly what `tools/create` generates today.
- [x] `backend`:
  - `packages/<name>`: the Go package in the shape of the fullstack one without the Astro resolver and the static
    handler (`New(db)` and `Mount(mux)`), `go.mod`, a `Makefile` whose `install` downloads the modules, and `README.md`;
  - `apps/<name>`: `cmd/<name>/main.go`, `.air.toml` building `cmd/<name>`, the `Makefile` and `README.md`;
  - no Astro, no pnpm, no `-dev` runner.
- [x] `client`: `packages/<name>` only, like `packages/client-r26`: `package.json` named `@project-reborn/<name>`,
  `vite.config.js`, `index.html`, `src/main.js`; nothing in `apps/`, and no `go work use`. It builds as a plain
  Vite app ([0018](/decisions/0018-client-is-a-plain-vite-app.md)).
- [x] The dry run and the printed plan follow the template: no Astro port for `backend`, no app port for `client`.
- [x] The root `Makefile`'s `create` target passes `template=` through.
- [x] Tests: every template renders, every file ends with a newline, and the generated Go passes `gofmt`, as today's
  tests check for the fullstack one.
- [x] In a throwaway worktree, create one project of each kind, run its gates (Go: `gofmt`, `go vet`, `go test`;
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

Results (2026-11-06):

- `gofmt -l .` lists nothing, `go vet` passes, and `go test -race` passes with 11 tests, 4 of them new
  (`TestWriteGeneratesTheBackendShape`, `TestWriteGeneratesTheClientShape`, `TestPlanFollowsTheTemplate` and
  `TestVitePortOfTheDecisionExample`), and `TestWriteGeneratesFormattedFiles` runs once for each kind.
- `make tools` builds `tools/create/bin/create`.
- `-dry-run demo` prints the fullstack plan: 21 files, app 14757, astro 26645. It is byte for byte the output of the
  tool built from `main`, with and without `-app-port` and `-astro-port`, and so are the 21 files it writes.
- `-dry-run -template=backend demo` prints 11 files, `packages/demo/` and `apps/demo/`, and only the app port, 14757.
- `-dry-run -template=client demo` prints 4 files in `packages/demo/` and only the vite port, 33240; `client-r18`
  gets 30050, as [0017](/decisions/0017-client-vite-port.md) says.
- `-dry-run -template=other demo` prints the usage line,
  `usage: create [-template fullstack|backend|client] [-app-port N] [-astro-port N] [-dry-run] <name>`, and exits 2.
- In the throwaway worktree `s0-create-probe`, `make create name=demofull`, `make create name=demoback
  template=backend` and `make create name=client-r18 template=client` each exited 0. `gofmt`, `go vet` and
  `go test -race` pass in `packages/demofull`, `apps/demofull`, `packages/demoback` and `apps/demoback`. In
  `packages/client-r18`, `pnpm install` and `pnpm build` pass, writing `dist/index.html` and
  `dist/assets/index-<hash>.js`, and `vite` serves the page on 30050. The worktree and its branch were removed.

# Notes

- Runs on the branch `s0`.
- It was blocked from 17:13 to 17:51 on how a client project builds, since client-r26's library build needs a global
  name, `_director` there. [0018](/decisions/0018-client-is-a-plain-vite-app.md) settled it: a plain Vite app.
- The client template leaves out client-r26's `define` block, which reads environment variables, and its
  `@project-reborn/director` dependency, whose place is an open question of `plans/client` (C3).
- A flag the template has no server for is ignored: `-astro-port` for `backend`, and `-app-port` and `-astro-port`
  for `client`. No flag overrides the vite port.
- `create` ends a client by installing its pnpm dependencies, as a Go project ends with `make install`.
- The backend package keeps the fullstack's router, and `GET /{$}` answers `Hello from Go` as plain text.
- Two problems of the Go templates, older than this task, are [s0-09](/tasks/s0-09-go-template-names.md): a name with
  a `-` gives a package name that does not compile, and a name that sorts after `store` gives imports that `gofmt`
  reorders.
