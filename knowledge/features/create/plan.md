---
type: Plan
title: "Create: how"
description: The Go command in tools/create renders the templates of its kind, derives the package and the ports from the name, and wires the new folders into the workspaces.
---

# Architecture

| Project | Part |
| --- | --- |
| Root `Makefile` | `make create name=<name> [template=…] [app-port=N] [astro-port=N] [dry-run=1]` builds the tools and runs `tools/create/bin/create` from the repository root |
| `tools/create` | `cmd/create`: checks the name, derives the Go package and the ports, renders the folder of `cmd/create/templates/` for the kind, then runs the workspace steps. Its knowledge, `tools/create/knowledge/index.md`, holds the names, the ports and the templates |

# Decisions

- `make create` is a feature of its own. The user chose "A feature each" on 2026-11-15.
- [tools/create makes fullstack, backend and client projects](/decisions/server/0003-create-templates.md) — Each kind
  is a template folder, and fullstack is the default.
- [The client template derives its Vite port from the name, in a range of its own](/decisions/server/0017-client-vite-port.md)
  — Ports come from the name, each kind of server in its own range.
- [A client project builds as a plain Vite app](/decisions/server/0018-client-is-a-plain-vite-app.md) — A client
  holds only a Vite app and its `Makefile`.
- [Go package names drop the dash](/decisions/server/0024-go-package-names-drop-the-dash.md) — Folders keep the dash,
  the Go package drops it.
- [Refuse names whose Go package cannot compile](/decisions/server/0025-refuse-names-whose-go-package-cannot-compile.md)
  and [refuse names the go tool treats specially](/decisions/server/0026-refuse-names-the-go-tool-treats-specially.md)
  — A template with Go refuses those names, and a client accepts them.
- [The backend template of tools/create keeps its HTTP
  server](/decisions/reborn/0014-the-backend-template-keeps-its-http-server.md) — The backend starts with a router and
  an HTTP server.
- [Project folders hold a README and a make install](/decisions/holo-port/0038-project-docs-and-install.md) — Each
  folder of a new project has its `README.md` and `make install`.
- Each folder's `Makefile` includes the shared recipe, so `make check` runs in it from the start
  ([checks](/features/checks/plan.md)).
