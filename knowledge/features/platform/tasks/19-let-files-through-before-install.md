---
type: Task
title: Let files through before the hotel is installed
description: While nobody is administrator, reborn sends every route the programs registered to /installer/ and serves what falls to the static handlers, so files and the dev server's own paths load during an install.
scope: [packages/reborn]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

The installer's pages reload live under `make dev`, and the rule is the user's
([Plan](/features/platform/plan.md), its last decision). The behaviour of the spec:

- A hotel is not installed: every page of the site and of housekeeping sends the browser to `/installer/`, and files
  and the dev server's own paths are served.

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- `packages/reborn/knowledge/run.md`: the middleware that sends every path outside `/installer/` to `/installer/`
  today, and `dev-server.md`: the dev server's own paths (`/@vite/client`, `/@fs/...`, `/@id/...`).
- The user: "everything of go routing goes to /installer/ special routes like /@vite/* and frontend stuff is passby,
  we can do this by checking in the "/" handler the path and the mux, if mux has it registered then redirect to
  /installer/, if it is an asset or vite then passby."

# Steps

- [ ] The middleware asks the mux which pattern takes the request (`(*http.ServeMux).Handler`). A route a program
  registered goes to `/installer/`; a request that falls to a static handler (the pattern `/`, or housekeeping's
  static pattern) is served.
- [ ] One test of the behaviour, with the programs built as the runner does: before the install, `/me` and
  `/housekeeping/` go to `/installer/`, and a file of the site and a path only the static handler knows are served.
- [ ] The spec's built line "redirects every other path there" changes with this task: name the new wording in the
  report, and the master updates it.
- [ ] Update `packages/reborn/knowledge/run.md`.

# Checks

```sh
make -C packages/reborn check
make -C apps/reborn check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/reborn`.
