---
type: Decision
title: A client project builds as a plain Vite app
description: A project made with tools/create -template=client builds as a page of its own, pnpm build writing dist/index.html and dist/assets/index-<hash>.js, and its vite.config.js holds only the derived port.
status: accepted
timestamp: 2026-11-06T17:51:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:51:44+00:00"}
tags: [tools, packages]
---

# Decision

A client project is a plain Vite app. `pnpm build` builds `index.html` and `src/main.js` into `dist/index.html` and
`dist/assets/index-<hash>.js`, a page of its own. `vite.config.js` holds only the dev server's port, derived from the
name ([0017](/decisions/0017-client-vite-port.md)).

# Context

[s0-02](/tasks/s0-02-create-templates.md) found that `packages/client-r26`'s `vite.config.js` builds `src/main.js` in
Vite's library mode, into `dist/main.es.js` and `dist/main.umd.js`, and that the UMD file needs a global name:
`_director` in client-r26, the director runtime's. A client copied without that name failed its `pnpm build`. The
question: how should a client project build? The options, each tried on a generated `client-r18`, where all four
built:

1. a library like client-r26, as an ES module only: `dist/main.es.js`, with no global name;
2. a library exactly like client-r26: `dist/main.es.js` and `dist/main.umd.js`, every client named `_director`;
3. a library like client-r26 with a global name from the project's name, such as `clientR18`;
4. a plain Vite app: `dist/index.html` and `dist/assets/index-<hash>.js`, with only the port in `vite.config.js`.

The user chose the fourth, "A plain Vite app".

# Consequences

- The client template's `vite.config.js` has no `build` section, so Vite's default build takes `index.html` as its
  entry.
- `packages/client-r26` keeps its own library build.
