---
type: Task
title: Handle the names whose Go package cannot compile
description: tools/create accepts names whose Go package name is a Go keyword or main, or a name the generated Go already uses, such as log, http, db or new, and the projects it makes from them do not compile.
status: done
phase: s0
depends_on: [s0-09]
packages: [tools/create]
client: []
timestamp: 2026-11-07T02:39:34+00:00
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T02:39:34+00:00"}
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:25:22+00:00"}
---

# Goal

Every name `tools/create` accepts makes, with the fullstack and the backend templates, Go that compiles, as
[s0-09](/tasks/s0-09-go-template-names.md)'s goal says.

# Steps

- [x] Ask the user what `tools/create` does with a name whose Go package name
  ([0024](/decisions/0024-go-package-names-drop-the-dash.md)) the generated Go cannot use: a Go keyword such as `func`
  or `go`, `main`, or a name the generated files already use. Record the answer as a decision:
  [0025](/decisions/0025-refuse-names-whose-go-package-cannot-compile.md), `validateName` refuses them with a plain
  message, and every generated project stays as it is.
- [x] `tools/create` does so for every such name, including the names that become one once their dashes are dropped
  (`go-to` gives `goto`). `validateName` takes the template and, for the backend and fullstack ones, refuses a name
  whose Go package would be a Go keyword, `main`, `init`, or a name of `taken`: `db`, `http`, `log`, `new` and `store`
  in both, and `astro`, `err`, `fs`, `httputil`, `nil`, `option`, `panic`, `proxy`, `resolver` and `url` in the
  fullstack one. A client has no Go, so its names are not checked for it. The message names the name, its Go package
  and the reason, and `create` stops before it makes any folder.
- [x] Tests: for both Go templates, each such name is handled as the decision says.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

In a throwaway worktree, `make create` with such names in both Go templates, then `go vet ./...` and
`go test ./... -race` in the folders it makes, if the decision makes any; then the worktree and its branch are
removed.

Run on 2026-11-07: `gofmt -l .` lists nothing, `go vet ./...` reports nothing, and the tests pass:

```text
ok  	github.com/kronothepenguin/project-reborn/tools/create/cmd/create	1.280s
```

- `TestValidateNameRefusesNamesWhoseGoPackageCannotCompile` checks, for the three templates, that Go's 25 keywords,
  `go-to`, `main`, `ma-in`, `init`, `in-it`, `l-og` and every name of `taken` are refused by the templates whose Go
  cannot compile them and by no other, that `c`, `mux`, `server`, `router`, `sql`, `embed` and `fmt` are accepted by
  all three, and that each refusal names the name and its Go package.
- `TestTakenHoldsTheNamesTheTemplatesUse` derives the names again from a generated project of each Go template: the
  runners' other imports, the variables they declare before their last use of the package and the predeclared
  identifiers they use, and the package's own declarations with their first letter lowered. It finds `taken` equal to
  them.
- `TestValidateName`, which checks the form of a name, moved from `ports_test.go` to `create_test.go`, beside the other
  tests of `create.go`, and runs for the three templates.
- Broken on purpose: with `panic` left out of `taken`, both new tests fail for the fullstack template; with the backend
  runner calling `os.Getpid()`, `TestTakenHoldsTheNamesTheTemplatesUse` fails with
  `the template's Go uses ["db" "http" "log" "new" "os" "store"]`; without the keyword check, 52 cases fail, the 25
  keywords and `go-to` in both Go templates; without the `init` check, `init` and `in-it` fail; and with a client's
  name checked as Go, every keyword is refused for a client and the test fails. Restored, all pass.
- In the throwaway worktree `s0-10-probe`, made from `main` and given this task's `tools/create`:
  - First, without the change, 209 names were written with both Go templates by the tool's own `write`, and
    `go vet ./...` run in their folders: every identifier of the Go templates and its form with the first letter
    lowered, Go's keywords and predeclared identifiers, `main`, `init`, and folder names such as `internal`, `vendor`
    and `testdata`. A name whose folder exists already was tried with a dash, which gives the same Go package:
    `st-ore`, `as-tro` and `se-rver`. Besides the keywords, which `write` refuses since s0-09, the backend template
    failed for `db`, `http`, `init`, `log`, `main`, `new` and `store`, and the fullstack template for those and
    `astro`, `err`, `fs`, `httputil`, `nil`, `option`, `panic`, `proxy`, `resolver` and `url`. Both also failed for
    `internal` and `vendor`, and the backend template for `testdata`, whose dashed forms compile: they are
    [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md).
  - Then, with the change, the same names and `ma-in`, `go-to`, `in-it`, `l-og`, `ni-l`, `pa-nic`, `inter-nal`,
    `ven-dor` and `test-data`, 218 in all: no name that `validateName` refuses compiles, and every name it accepts
    compiles and passes `gofmt`, 179 with the backend template and 168 with the fullstack one, except `internal`,
    `vendor` and the backend's `testdata`.
  - `make create name=log template=backend`, `make create name=nil`, `make create name=option`,
    `make create name=go-to template=backend`, `make create name=main` and `make create name=in-it template=backend`
    stop at once and make no folder, with messages such as
    `create: name cannot be log: its Go package would be log, which the backend template's Go already uses`,
    `create: name cannot be go-to: its Go package would be goto, a Go keyword` and
    `create: name cannot be main: its Go package would be main, which Go keeps for programs`.
  - `make create name=nil template=backend`, `make create name=option template=backend`, `make create name=router`,
    `make create name=c`, `make create name=se-rver` and `make create name=func template=client` exit 0. In their ten
    Go folders `gofmt -l .` lists nothing, and `go vet ./...` and `go test ./... -race` pass; their eight runners
    build. The runners of `se-rver` import `server "github.com/kronothepenguin/project-reborn/packages/se-rver"` and
    declare their variable `server` after their last use of it. `pnpm build` in `packages/func` writes
    `dist/index.html` and `dist/assets/index-DH3grF1E.js`.
  - The worktree and its branch were removed.

# Notes

- Found by [s0-09](/tasks/s0-09-go-template-names.md) in its throwaway worktree, once the dash and the import order were
  fixed. `go vet ./...` fails in the folders made for these names:
  - with both templates: `main` ("is a program, not an importable package"); `log` and `http`, which the runners
    import ("redeclared in this block"); `db`, the runners' variable, which hides the package (`db.New undefined`); and
    `new`, whose type `New` meets the function `New` ("redeclared in this block");
  - with the fullstack template, besides those: `fs`, `url` and `httputil`, which its runners import; `err`,
    `resolver` and `proxy`, variables of its runners; `nil`, which its runners compare with `err`; and `option`, whose
    type meets `Option`.
- A Go keyword such as `func` makes nothing since s0-09: the generated Go does not parse, so `create` stops with
  `create: templates/backend/apps/[[name]]/cmd/[[name]]/main.go.tmpl: 14:11: expected '(', found '.'` and removes the
  folders it made.
- `c`, `mux`, `server`, `router`, `sql` and `embed` compile, and so does `nil` with the backend template.
- Runs on the branch `s0`.
- The list derived from the templates adds three names to s0-09's: `store` in both templates and `astro` in the
  fullstack one, which the runners import, and `panic`, which the fullstack dev runner calls. `create` refused `store`
  and `astro` already in this repository, whose `packages/store` and `packages/astro` exist.
- `init`, which s0-09 did not try, fails as `main` does, with or without a dash (`in-it`): Go cannot import a package
  as `init` (`cannot import package as init - init must be a func`). Its Go package name cannot compile in either Go
  template, so `validateName` refuses it under [0025](/decisions/0025-refuse-names-whose-go-package-cannot-compile.md).
- The names are a list in `create.go`, `taken`, and `TestTakenHoldsTheNamesTheTemplatesUse` derives them again from a
  generated project, so a template that starts using one more name fails the gates until `taken` has it.
- `internal`, `vendor` and `testdata` fail because of their folder, not their Go package name, which 0025 does not
  cover: [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md) asks the user.
