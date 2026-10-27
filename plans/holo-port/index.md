---
okf_version: "0.2"
---

# HoloCMS port

State of the port of HoloCMS (`source/holo/`, PHP + MySQL, 2008) to Project Reborn: Go, SQLite + sqlc, Astro,
Svelte 5 and Tailwind 4. The public site becomes `packages/cms`, the admin panel becomes `packages/housekeeping`
and `install.php` becomes `packages/installer`.

## Resume here

1. Read the [rules](/rules.md).
2. Read the newest entries of the [log](/log.md).
3. Open the [task index](/tasks/index.md): in-progress tasks first, then the todo tasks of the current phase.

Current phase: [P0 Foundations](/phases/p0-foundations.md).

## Contents

- [Rules](/rules.md) — How tasks, decisions, phases and log entries of the HoloCMS port are created and kept up to date.
- [Log](/log.md) — Dated history of the port, newest first.
- [Decisions](/decisions/index.md) — Design decisions confirmed by the user.
- [Phases](/phases/index.md) — The ordered phases of the port with scope and exit criteria.
- [Tasks](/tasks/index.md) — Units of work and their status, grouped by phase.
- [Reference](/reference/index.md) — What Holo contains and where each part goes in the new system.

## Ground rules from the user

They come from the original request and `AGENTS.md` and apply to every task.

| Concern | Rule |
| --- | --- |
| Small components (button, link, card, paper…) | `packages/components` |
| Composed CMS UI | `packages/cms/src/components/<feature>/` |
| Housekeeping | `packages/housekeeping` + `apps/housekeeping`, created with `tools/create` |
| Installer | `packages/installer` + `apps/installer`, created with `tools/create` |
| Configuration | `packages/config` |
| Database | `packages/store` with sqlc, documented as OKF; simplified and fixed before writing |
| Authentication | `packages/auth`, shared, rewritten from scratch |
| Identity | user, habbo, auth and profile are separate tables |
| Colours | the closest Tailwind colour, found with `tools/tw-color` |
| `specs/` | ignored |
| Environment variables | never, unless the user asks |
| Architecture | follow the user's decisions; anything not covered is asked before acting |
| Code comments | only for non-obvious architecture or tricky edge cases |
