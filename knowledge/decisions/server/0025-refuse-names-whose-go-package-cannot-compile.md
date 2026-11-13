---
type: Decision
title: tools/create refuses names whose Go package cannot compile
description: validateName refuses, with a plain message, a name whose Go package name cannot compile in the template being made, main, a Go keyword or a name the template's own Go already uses, and every generated project stays as it is.
status: accepted
timestamp: 2026-11-07T02:30:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T02:30:45+00:00"}
tags: [tools, packages]
---

# Decision

- `validateName` refuses, with a plain message, a name whose Go package name (the name without its dashes,
  [0024](/decisions/server/0024-go-package-names-drop-the-dash.md)) cannot compile in the template being made:
  - `main`;
  - Go's keywords: `func`, or `go-to`, which becomes `goto`;
  - the names that clash with identifiers the templates' own code uses.
    s0-09 found `log`, `http`, `db` and `new` in both Go templates, and `fs`,
    `url`, `httputil`, `err`, `resolver`, `proxy`, `nil` and `option` in the fullstack one. The full list is derived
    from the templates and tested, rather than taken from this one.
- Every generated project stays as it is today.

# Context

s0-09 found that these names still make projects that do not compile. Offered refusing them or changing the templates
(importing the project under a fixed alias and renaming the runner's variables, so that only keywords and `main` would
be refused), the user chose "Refuse them (Recommended)": "validateName refuses these names with a plain message; every
generated project stays exactly as today. Keywords and `main` could only be refused anyway."

# Consequences

- s0-10 makes `validateName` follow it.
