---
type: Decision
title: Housekeeping is the single writer of settings
description: Housekeeping alone updates settings, the CMS only reads them, the installer runs once, and programs running alone will be told of a change instead of polling for it.
status: superseded
superseded_by: "0051"
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [settings, housekeeping, architecture]
---

# Decision

- Housekeeping is the single writer of settings. Nobody is expected to edit the database by hand.
- The installer writes settings once, and is not expected to run again.
- The CMS only reads settings.
- Housekeeping has no refresh interval, because it holds the values it writes.
- Together in one process, the programs share the settings and need nothing more.
- Running alone, they may need IPC, disabled when the orchestrator runs everything in one process. Its design is open
  ([HK-A](/phases/hk-a-housekeeping-core.md)).

# Context

The agent asked which setting a housekeeping running alone reads for its reload interval. The user answered: "housekeeping
is the one updating settings, it's not expected that the admin updates database directly, so housekeeping should not have
refresh interval. HK is the single writer of settings, installer is not expected to run more than once, CMS is merely a
reader of the settings. We can design a better system. may require IPC enabled when running the apps as standalone, and
disabled when running everything into a single process with the orchestractor. we might need to create some architecture
OKF docs or just describe how projects communicate and interact as standalone vs together".

# Consequences

- [How the programs work together](/reference/architecture.md) describes both ways of running.
- The question about the reload interval in [0024](/decisions/0024-settings-catalogue-and-getters.md) is closed.
- Until the IPC exists, a CMS running alone sees a housekeeping change at its next start, as
  [0029](/decisions/0029-package-level-settings-and-auth.md) says.
- `cms.refresh` has no reader. It stays until the IPC design decides its fate.
