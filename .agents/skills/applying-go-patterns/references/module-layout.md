# Module layout

Source: https://go.dev/doc/modules/layout

## Contents

- Workspace
- Inside a module
- Where new code goes
- Adding a module

## Workspace

A `go.work` workspace holds the Go modules, and a pnpm workspace holds the frontends. Code sits in three folders:

| Folder | Holds |
| --- | --- |
| Runners | Runnable applications: thin wiring around a package. |
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
│       └── <app>-dev/main.go   # development server
├── <packages>/<pkg>/
│   ├── go.mod
│   ├── <pkg>.go                # public API: struct, New, Mount, options
│   ├── package.json            # when the package ships a frontend
│   ├── src/                    # frontend pages, layouts, components
│   ├── dist/                   # frontend build, gitignored, embedded
│   └── internal/
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

- `cmd/<binary>/main.go`: one directory per executable. `main.go` holds wiring only.
- `<pkg>.go` at the module root: the public API, next to `internal/`.
- `internal/`: code only this module imports. The rest of the module is public.
- One package per directory. The package name is the directory name: short, lowercase, one word.
- Name each folder for what it holds, in place of `pkg/` or `util/`.

## Where new code goes

| You are adding | Location |
| --- | --- |
| A reusable library used by runners | `<packages>/<pkg>/`, with a public root package |
| An implementation detail of one module | `<packages>/<pkg>/internal/<subpkg>/` |
| A runnable application | `<runners>/<app>/cmd/<app>/main.go` |
| Its development server | `<runners>/<app>/cmd/<app>-dev/main.go` |
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
