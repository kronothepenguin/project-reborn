---
type: Decision
title: The installer has no modes
description: The installer has no standalone or orchestrator mode, its fields stay editable with the development ports as defaults, and it asks for the Housekeeping Address.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [installer, settings]
---

# Decision

- The installer has no modes, no select and no `WithOrchestrator()`.
- Its fields stay editable, and they default to the development ports.
- It asks for the Housekeeping Address. `site.housekeepingUrl` defaults to `http://localhost:18465/housekeeping`, in the
  installer and on an empty database.
- The orchestrator overrides these values when it runs the installer. How it does is designed with the orchestrator.

# Context

The Housekeeping tab answered 404 on a new install, because a CMS running alone does not serve `/housekeeping`. Offered
a third installer option, the user answered: "no `WithOrchestractor()` looks odd, better to allow modify these fields,
orchestractor can override settings when running installer, by default use the dev ports" and "as we don't have modes
anymore, we can get rid of this select."

# Consequences

- The tab works in development with nothing to configure, and a production install sets its address in the form.
- [0029](/decisions/0029-package-level-settings-and-auth.md) keeps options for what differs between runners.
