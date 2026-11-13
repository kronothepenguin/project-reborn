---
type: Decision
title: tools/create refuses the names the go tool treats specially as folders
description: For the backend and fullstack templates, validateName refuses internal, vendor and testdata, whose folders the go tool treats specially, with a plain message; the client template, which has no Go, keeps accepting them.
status: accepted
timestamp: 2026-11-09T18:00:06+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:00:06+00:00"}
tags: [tools, packages]
---

# Decision

- For the backend and fullstack templates, `validateName` refuses the names `internal`, `vendor` and `testdata`
  with a plain message, such as `name cannot be vendor: the go tool treats a folder named vendor specially`.
- The check is on the name, which names the folders, not on its Go package: `ven-dor` gives the package `vendor`
  and compiles, since no folder is named `vendor`.
- The client template, which has no Go, keeps accepting them.

# Context

s0-10 found that these three names compile as Go package names, but not as
folders: the runners may not import `packages/internal`, the go tool reads `packages/vendor` as vendored code, and
`./...` skips folders named `testdata`, which fails a backend's gates
(s0-11). Offered refusing them for the Go templates, refusing
them for every template, or leaving them, the user chose "Refuse them (Recommended)": "Like decision 0025: the backend
and fullstack templates stop with a plain message, e.g. \"vendor cannot be a project name: the go tool treats a folder
named vendor specially\". The client template, which has no Go, keeps accepting them."

# Consequences

- s0-11 makes `validateName` follow it, as
  [0025](/decisions/server/0025-refuse-names-whose-go-package-cannot-compile.md) did for the names whose Go package cannot
  compile.
