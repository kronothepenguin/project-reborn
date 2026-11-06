# Plans

Project Reborn is a new system built on Habbo's R26 era, not a translation of an old one. HoloCMS, the Holograph
Emulator and the R26 client are sources it reads. Each plan here is an OKF 0.2 bundle of its own, with its own root
`index.md`, rules, decisions, phases, tasks and log. This page lists the plans, the sources each one reads, and how to
work on any of them.

## Plans

- [HoloCMS port](holo-port/index.md) — The public site, housekeeping and the installer, ported from HoloCMS page by page to Go, SQLite + sqlc, Astro, Svelte 5 and Tailwind 4, each page behaving exactly as Holo's.
- [Game server](server/index.md) — The game server that speaks the R26 client's protocol over TCP and WebSocket, built in the structure of the deleted packages/server, with its state in packages/virtual.
- [Later](later.md) — Work planned for later that belongs to no phase yet, such as the orchestrator and r18.

## Sources

| Source | What it is | Read by |
| --- | --- | --- |
| `source/holocms/` | HoloCMS, the site and housekeeping of 2008, in PHP on MySQL | holo-port, which ports each page to behave exactly as Holo's ([0034](holo-port/decisions/0034-behaviour-matches-holo.md)) |
| `source/holoemu/` | The Holograph Emulator for V26, a game server of 2008, in C# on MySQL | server, only when the client's `.ls` scripts are not enough ([0016](server/decisions/0016-holoemu-is-a-reference.md)) |
| `packages/client-r26/src/game/` | The R26 client's casts: their Lingo scripts (`.ls`) beside their JavaScript translations | server, which takes the protocol from the `.ls` scripts only ([0008](server/decisions/0008-reverse-engineer-ls-only.md)) |
| `vendor/HabboWidgets/` | Habbo's Flash widgets ported to HTML5, a git submodule | holo-port, for the landing promo, the registration's look editor and the group badge editor |

## Working on a plan

1. Load the `tracking-plans` skill. The plan's own `rules.md` wins over it.
2. Resume from the plan's `index.md`, then the newest entries of its `log.md`, then its `tasks/index.md`.
3. Never work on `main`: each line of work has its own feature branch and worktree under `.claude/worktrees/`, which
   the agent merges into `main` once every gate passes, and it never pushes
   ([0097](holo-port/decisions/0097-no-agent-works-on-main.md)).
4. A new plan is started with the `tracking-plans` skill and listed here.
