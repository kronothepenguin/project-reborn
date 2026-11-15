---
type: Decision
title: The CMS address comes from config.json
description: config.json gains cms.host, and the CMS runners listen on cms.host and cms.port instead of a fixed localhost.
status: accepted
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [config, cms]
---

# Decision

- `config.CMS.Host`, key `cms.host`, is a startup key with the default `localhost`, so nothing changes until someone sets
  it. A pod sets it to `0.0.0.0`.
- Both CMS runners build their address from `cms.host` and `cms.port`.

# Context

The runners bound `localhost`, so a pod could not be reached from outside. The user answered: "use the value from config,
create config value if it does not exists yet, like config.CMS.Host as example". That request covers the change in
`apps/cms/cmd/**`.

# Consequences

- The installer's runner keeps its fixed address, because it runs before `config.json` exists.
