---
type: Reference
title: Names
description: How tools/create validates a project's name and derives its Go package and type from it.
resource: tools/create/cmd/create/create.go
---

# Every kind

- A name starts with a lowercase letter.
- It holds only lowercase letters, digits and `-`.
- It stops when `packages/<name>` or `apps/<name>` already exists.

# Go package

The fullstack and backend templates name the Go package after the project without its dashes: `game-server` gives
`package gameserver` and the type `Gameserver`. Folders and module paths keep the dash (decision server/0024).

# Refused names

For the fullstack and backend templates, `validateName` refuses with a plain message:

- a name whose Go package is a Go keyword, `main` or `init` (decision server/0025);
- a name whose Go package clashes with an identifier the template's own Go uses, listed in `taken` in `create.go` and
  tested (decision server/0025);
- the names `internal`, `testdata` and `vendor`, which the go tool treats specially as folders. The check is on the
  name: `ven-dor` gives the package `vendor` and passes (decision server/0026).

The client template has no Go, so it accepts these names.
