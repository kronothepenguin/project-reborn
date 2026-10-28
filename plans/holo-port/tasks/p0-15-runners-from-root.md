---
type: Task
title: Run the dev runners from the repository root
description: make dev starts air from the repository root, so the installer and the CMS read and write the root config.json; tools/create generates new apps the same way.
status: done
phase: p0
depends_on: [p0-14]
packages: [apps/installer, apps/cms, tools/create]
holo: []
timestamp: 2026-10-28T01:42:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:38:42+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:42:49+00:00"}
---

# Goal

Implement [0027](/decisions/0027-runners-run-from-the-root.md).

# Steps

- [x] `tools/create` templates: the app `Makefile` runs `cd ../.. && go tool air -c apps/<app>/.air.toml`, and the
      paths in `.air.toml` are relative to the root.
- [x] `apps/installer` and `apps/cms`: the same `Makefile` change and a root-relative `.air.toml`.
- [x] Docs: the `AGENTS.md` of both apps, `packages/installer/AGENTS.md` and the templates' `AGENTS.md`.

# Verification

```sh
cd tools/create && go build ./... && go vet ./... && go test ./...
make create name=probe dry-run=1
```

Run `make dev` in `apps/installer` and check that the runner's working directory is the repository root.

Results (2026-10-28T01:42:49+00:00):

- `tools/create`: build, vet and tests pass. The writer test now checks the root-relative `cmd` line of the generated
  `.air.toml` and the `cd ../.. && go tool air -c apps/probe/.air.toml` line of the generated `Makefile`.
- `make create name=probe dry-run=1` lists `apps/probe/.air.toml` and `apps/probe/Makefile`.
- `make dev` in `apps/installer`:
  - the process listening on 17306 is `apps/installer/tmp/installer`;
  - its working directory is the repository root;
  - `GET /` answered 200, and no root `config.json` appeared.
- `make dev` in `apps/cms`: the process listening on 17387 is `apps/cms/tmp/cms`, its working directory is the
  repository root, and `GET /` answered 200.

# Notes

Air settings:

- `exclude_dir` also lists `packages/<app>/node_modules` and `packages/<app>/dist`. Air matches excluded paths exactly
  from the root, and including `packages/<app>` would otherwise walk `node_modules`.
- The installer's air also watches the Go packages it imports: `auth`, `config`, `store` and `virtual`.
- `apps/cms/.air.toml` lost `include_file = [".air.cms.toml"]`, which named a file that does not exist.

Docs:

- The production steps in the `AGENTS.md` files and their templates now build and run from the root, so a local
  production run reads the root `config.json` too.

Found, not changed:

- When the test sent SIGTERM to the process group of `make dev` in `apps/cms`, the Astro dev server started by
  `pnpm dev` kept running and had to be stopped by hand. This behavior predates this task; Ctrl-C was not tried.
- The root `Makefile`'s `dev` and `build` targets point at `apps/reborn`, which does not exist.
