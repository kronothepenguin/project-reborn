---
type: Decision
title: plans/index.md maps the plans, and the port stays one bundle
description: plans/index.md lists every plan, the sources each one reads and how to work on them, in OKF's index format without declaring a bundle, and this bundle is not split.
status: accepted
timestamp: 2026-11-06T15:44:51+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:44:51+00:00"}
tags: [process, plans]
---

# Decision

- `plans/index.md` lists every plan with what it covers, the sources each one reads and how to work on any of them.
  It uses OKF's index format but declares no `okf_version`, so `plans/` is not a bundle and every plan stays a bundle
  of its own.
- The root `AGENTS.md` sends agents to it, and the `tracking-plans` skill names it.
- This bundle stays whole: it is not split into the CMS, housekeeping and the installer.

# Context

The user: "btw, maybe it'll be worth to to add something like index.md to @plans/ in okf format so the agents do not
get struggle, and we can split @plans/holo-port/ into parts if it is worth to do it as well, because we now have holo
cms and holo emu sources, but we are creating a new system based on holo r26, not actually translating it."

OKF allows frontmatter only in a bundle's root `index.md` and resolves a link that starts with `/` from that root, so
an `okf_version` in `plans/index.md` would make this bundle's root index and its 1,633 bundle-absolute links wrong.
Offered the map with this bundle whole, the map with a split once P5 to P7 end, or the map with a split now, the user
chose the map with this bundle whole. At the time 154 of its 159 tasks were done, its 98 decisions served the CMS,
housekeeping and the installer alike, and P5 was in progress on its own branch.

# Consequences

- A plan is added to `plans/index.md` when it is created, with the sources it reads.
- `plans/later.md` stays beside the bundles ([0072](/decisions/0072-later-work-in-plans-later.md)).
