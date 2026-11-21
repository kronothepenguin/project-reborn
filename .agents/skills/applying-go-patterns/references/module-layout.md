# Module layout

Source: https://go.dev/doc/modules/layout. Follow this layout only.

## Contents

- Workspace
- Inside a module
- Where new code goes
- Adding a module

## Workspace

A `go.work` workspace holds the Go modules, and a pnpm workspace holds the frontends. Code sits in three folders:

| Folder | Holds |
| --- | --- |
| Runners | Runnable applications: thin wiring around a package, plus the `http.Server`. |
| Packages | Reusable modules that other modules import, each with its frontend when it ships one. |
| Tools | Developer CLIs, such as generators. |

```text
<workspace>/
├── go.work                     # every Go module
├── pnpm-workspace.yaml         # globs the runner and package folders
├── <runners>/<app>/
│   ├── go.mod
│   └── cmd/
│       ├── <app>/main.go       # production
│       └── <app>-dev/main.go   # development, when the package ships a frontend
├── <packages>/<pkg>/
│   ├── go.mod
│   ├── <pkg>.go                # the public package
│   ├── <topic>/                # optional: a public package per topic
│   ├── internal/               # packages only this module imports
│   ├── package.json            # when the package ships a frontend
│   ├── src/                    # frontend pages, layouts, components
│   └── dist/                   # frontend build, gitignored, embedded
└── <tools>/<tool>/
    ├── go.mod
    └── cmd/<tool>/main.go
```

- Each module has its own `go.mod`. Its path is the workspace's base path plus its folder: `<base>/<packages>/<pkg>`.
- Imports flow one way: runners import packages, and a package imports only packages and outside modules.
- Shared code goes in a package. The runner folder holds runners only.
- A frontend sits in the directory of its Go package, `go.mod` beside `package.json`. Embed its build with
  `//go:embed dist/*`.

## Inside a module

- The module root exports what is public. Its package name is the last element of the module path.
- A sub-folder is a public package for one topic, imported as `<module>/<topic>`. Sub-folders may nest.
- `internal/` holds the packages only this module imports. Put a supporting package there first, and keep packages
  there as much as possible.
- `cmd/<binary>/main.go` holds each binary.
- One package per directory. The package name is the directory name.
- A web app keeps its handlers in `internal/router`, and the root's `Mount` registers them
  (`mux-patterns.md`).

## Where new code goes

| You are adding | Location |
| --- | --- |
| A reusable library used by runners | `<packages>/<pkg>/`, the public package at its root |
| A public topic of that library | `<packages>/<pkg>/<topic>/` |
| A supporting package of one module | `<packages>/<pkg>/internal/<subpkg>/` |
| A runnable application | `<runners>/<app>/cmd/<app>/main.go` |
| Its development runner, when its package ships a frontend | `<runners>/<app>/cmd/<app>-dev/main.go` |
| A code generator or CLI | `<tools>/<tool>/cmd/<tool>/main.go` |
| A frontend page, layout or component | `<packages>/<pkg>/src/`, with `templating-astro-pages` and `building-astro-components` |

## Adding a module

Run `go mod init` inside the new module's folder, then add the module to `go.work`:

```sh
mkdir -p <packages>/<pkg> && cd <packages>/<pkg>
go mod init <base>/<packages>/<pkg>
cd <workspace-root>
go work use ./<packages>/<pkg>
```

- `go work use` makes every workspace command see the module.
- A runner follows the same steps in the runner folder, plus `cmd/<app>/main.go`.
- The pnpm workspace globs the runner and package folders, so a new frontend joins it as it is.
- Build the frontend before `go build`, so `//go:embed dist/*` finds files on a fresh checkout.

Verify with `go work sync`, then build and vet each module from its directory.
