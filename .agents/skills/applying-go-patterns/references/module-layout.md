# Module layout

## Contents

- Official layout rules
- Workspace folders
- Where new code goes
- Adding a module
- Verification
- Gotchas

## Official layout rules

Source: https://go.dev/doc/modules/layout

- `cmd/<binary>/main.go` — one directory per executable; `main.go` contains only wiring.
- `internal/` — code only this module may import. Everything else in the module is public to other modules.
- The module root — the package's public API (the `<pkg>.go` file next to `internal/`), not a catch-all.
- One package per directory; the package name matches the directory (lowercase, no underscores).
- Do not create `pkg/` or `util/`. The workspace `packages/` folder is a grouping convention, not the Go `pkg/` directory.

## Workspace folders

A Go workspace (`go.work`) can hold several modules, paired with a pnpm workspace for frontends. Two folders have fixed meanings:

- `apps/<app>/` — **runnable applications** (runners). The binary wiring lives in `cmd/`: `cmd/<app>/main.go` for production and `cmd/<app>-dev/main.go` for the dev server. Apps depend on packages.
- `packages/<pkg>/` — **reusable modules**: Go workspace modules other modules import, and npm/pnpm packages. A package exposes its public API at the root and keeps implementation under `internal/`.
- `tools/<tool>/` — developer CLIs (generators, scripts) with `cmd/<tool>/main.go`.

```text
<workspace>/
├── go.work                     # lists every Go module
├── pnpm-workspace.yaml         # globs apps/* and packages/*
├── apps/
│   └── <app>/                  # runnable application
│       ├── go.mod
│       └── cmd/
│           ├── <app>/main.go
│           └── <app>-dev/main.go
├── packages/
│   └── <pkg>/                  # reusable module, optionally with a frontend
│       ├── go.mod
│       ├── <pkg>.go            # public API: struct, New, Mount, options
│       ├── package.json        # when the package ships a frontend
│       ├── src/                # Astro pages, layouts, components
│       ├── dist/               # build output, gitignored, embedded
│       └── internal/
└── tools/
    └── <tool>/
        ├── go.mod
        └── cmd/<tool>/main.go
```

Rules:

- A module path follows the workspace's base path plus its folder (`<base>/packages/<pkg>`).
- `packages/*` never imports `apps/*`; `apps/*` may import `packages/*`.
- A frontend lives in the same directory as its Go package (`go.mod` and `package.json` side by side); `dist/` is embedded with `//go:embed dist/*`.
- Adding a module requires `go work use ./<path>`.

## Where new code goes

| You are adding | Location |
| --- | --- |
| Reusable library used by apps | `packages/<pkg>/` with a public root package |
| Implementation detail of one module | `packages/<pkg>/internal/<subpkg>/` |
| A runnable application | `apps/<app>/cmd/<app>/main.go` |
| A developer variant binary | `apps/<app>/cmd/<app>-dev/main.go` |
| A code generator or CLI | `tools/<tool>/cmd/<tool>/` |
| A frontend page, layout, or component | `packages/<pkg>/src/` (see `templating-astro-pages` and `building-astro-components`) |

## Adding a module

From the workspace root:

```sh
mkdir -p packages/<pkg>
cd packages/<pkg>
go mod init <base-module-path>/packages/<pkg>
cd ../..
go work use ./packages/<pkg>
```

For a runnable app, do the same under `apps/<app>` and add `cmd/<app>/main.go`. The pnpm workspace normally globs `apps/*` and `packages/*`, so a frontend is picked up without extra configuration.

## Verification

```sh
go work sync
cd <module-directory> && go build ./... && go vet ./...
```

At the workspace root `go build ./...` fails by design:

```text
pattern ./...: directory prefix . does not contain modules listed in go.work
```

Always run builds from inside the module directory.

## Gotchas

- Never `go mod init` at the workspace root. Every module has its own `go.mod`.
- Adding a module without `go work use` makes every workspace command ignore it.
- `dist/` is gitignored but embedded: run the frontend build before `go build`, or a fresh checkout fails to compile `//go:embed dist/*`.
- `apps/` is for runners, not libraries. Shared code goes in `packages/`.
