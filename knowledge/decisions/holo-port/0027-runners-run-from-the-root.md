---
type: Decision
title: Runners run from the repository root in development
description: In development every app runner runs with the repository root as its working directory, so all of them read the root config.json.
status: accepted
timestamp: 2026-10-28T01:38:42+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:38:42+00:00"}
tags: [config, tooling]
---

# Decision

- `make dev` in `apps/<app>` starts air from the repository root (`go tool air -c apps/<app>/.air.toml`), so the
  runner's working directory is the root.
- Every runner therefore reads and writes the root `config.json`, which `.gitignore` already ignores. A relative
  database path in it also resolves from the root, where `*.db*` is ignored.
- The paths in each `.air.toml` are relative to the root, and `tools/create` generates new apps that way.

# Context

The installer writes `config.json` in its working directory and the CMS reads it from its own. `make dev` ran each
runner in its `apps/<app>` folder, so the two never met. The user chose to run the runners from the root so that they
read the root `/config.json`.

# Consequences

- New apps created with `tools/create` follow this from the start.
