---
type: Spec
title: Create
description: "`make create` makes a new fullstack, backend or client project from a name: its folders, its ports, a README, a knowledge bundle and a check that passes."
status: done
projects: [tools/create]
---

# What

`make create name=<name>` makes a new project from a template: `fullstack`, the default, `backend` or `client`. It
checks the name, derives the Go package and the ports from it, and writes each folder with a `Makefile` that runs
`make check`, a short `README.md` and, in the package, a knowledge bundle.

# Behaviours

- A name is empty, starts with a digit, or holds a capital, an underscore or a slash: `make create` refuses it.
- A name whose Go package would not compile in the template, such as a keyword, `main` or a name the template uses: a
  template with Go refuses it and names the Go package, and a client accepts it.
- The name is `internal`, `testdata` or `vendor`: a template with Go refuses it, and a client accepts it.
- A name holds a dash: its folders keep the dash, its Go package drops it, and the project compiles.
- A new project gets ports from its name: the same ports each time, in separate app, Astro and Vite ranges.
- `make create` runs as a dry run: it lists only the folders and servers its template has.
- `make create` makes a backend: it holds no frontend files; a client holds no Go and no apps/ folder.
- `make create` makes a project: each of its folders holds a short `README.md` with its title, how to set it up, and a
  link to its knowledge.
- `make create` makes a project: its package holds a `knowledge/index.md` that the knowledge check accepts.
- A new project made by `make create`, `make check` runs in it: it passes.
