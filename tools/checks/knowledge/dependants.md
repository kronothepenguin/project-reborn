---
type: Reference
title: dependants
description: What the dependants command reads to find the projects of the workspace and their links, and what it prints.
resource: tools/checks/cmd/dependants
---

# Usage

```sh
make dependants project=<folder>
```

The root target builds the tools as `make tools` does and runs `tools/checks/bin/dependants <folder>` from the
repository root. The folder is relative to the root.

# Projects

A project is a folder, whatever it holds: a Go module and a `package.json` in one folder are one project.

| Source | Projects |
| --- | --- |
| `go.work`, read with `go work edit -json` | each folder of `use` |
| `pnpm-workspace.yaml` | each folder its `packages` globs match; a `!glob` drops folders |
| `tools/*/package.json` | each tool with its own `package.json` |

# Links

| From | A project uses another when |
| --- | --- |
| Go | a `.go` file of its module, tests included, imports a package of the other module. Folders the go tool ignores (`.`, `_`, `testdata`, `vendor`), `node_modules` and nested modules are skipped. Build tags are not read, so every file counts |
| pnpm | its `package.json` lists the other's package name with a `workspace:` version in `dependencies`, `devDependencies`, `peerDependencies` or `optionalDependencies` |

`go.mod` files are not read for links: the workspace resolves imports that a `go.mod` does not state.

# Output

- Every project that uses the folder, directly or through another project, one folder a line, sorted.
- Nothing, and exit 0, when no project uses it.
- `dependants: <folder> is not a project of the workspace` and exit 1 for a folder that is no project.
- The usage and exit 2 without exactly one argument.

# Examples

```text
$ make dependants project=packages/components
apps/cms
apps/housekeeping
apps/installer
packages/cms
packages/housekeeping
packages/installer
```
