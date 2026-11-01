---
type: Task
title: Bring the tools/create templates to the current conventions
description: Generate apps that open the db with store.FromConfig, pass it to New and report a failed server, so that housekeeping is right from its first commit.
status: todo
phase: hk-a
depends_on: []
packages: [tools/create]
holo: []
timestamp: 2026-11-01T21:07:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
---

# Goal

`tools/create` generates what `packages/cms` and `apps/cms` look like today, before housekeeping is generated with it.

# Steps

- [ ] Both runner templates open the db with `store.FromConfig()` and call `New(db, WithResolver(…), WithStatic(…))`.
- [ ] Both runner templates end with `log.Fatalln(server.ListenAndServe())`.
- [ ] The package template's `New` takes `db *sql.DB` first, as [0029](/decisions/0029-package-level-settings-and-auth.md)
  says, and passes it to the router's `Deps`.
- [ ] The generated app type is exported, as `CMS` and `Installer` are.
- [ ] `.air.toml` watches the packages the generated code imports, and `go.mod` names the Go version of `go.work`.
- [ ] The Svelte starter uses runes and the page hydrates it, as `adding-svelte-interactivity` says.
- [ ] `TestWriteGeneratesFormattedFiles` keeps passing, and a test holds the new runner and package shape.

# Verification

```sh
cd tools/create && gofmt -l cmd && go vet ./... && go test ./... -race
make create name=probe
cd apps/probe && go build ./... && go vet ./...
cd packages/probe && go build ./... && go vet ./...
```

The generated `probe` project is removed afterwards.

# Notes

- The runner's address stays baked in the template: a new app has no config section yet.
