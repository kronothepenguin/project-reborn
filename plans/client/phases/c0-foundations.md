---
type: Phase
title: C0 Foundations
description: The plan's bundle, listed with every plan, and LibreShockwave's source in the repository as a submodule.
status: done
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [c0, client]
---

# Goal

The client can be planned, resumed and worked by any agent, and LibreShockwave's source is in the repository at the
commit the plans read.

# Scope

| Part | Where | Decisions |
| --- | --- | --- |
| The plan bundle, listed in `plans/index.md` and the `tracking-plans` skill | `plans/client` | [0001](/decisions/0001-plan-in-plans-client.md) |
| LibreShockwave as a submodule | `vendor/LibreShockwave`, `.gitmodules` | [0003](/decisions/0003-libreshockwave-submodule.md) |

# Exit criteria

- The bundle passes its checks, and so do `plans/holo-port` and `plans/server` after the pointers to it.
- `vendor/LibreShockwave` is at `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b`.
- Every gate passes.

# Tasks

- [c0-01 Create the plan bundle](/tasks/c0-01-plan-bundle.md) — done
- [c0-02 Add LibreShockwave as a submodule](/tasks/c0-02-libreshockwave-submodule.md) — done
