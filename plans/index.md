# Plans

Project Reborn is a new system built on Habbo's R26 era, not a translation of an old one. HoloCMS, the Holograph
Emulator and the R26 client are sources it reads. Every plan here is an OKF 0.2 bundle with its own root `index.md`.

## The live plan

- [Project Reborn](reborn/index.md) — Everything planned from 2026-11-13 on, by feature slice: each slice is one feature
  across the store, the game server, the site, housekeeping, the installer and the client, with one folder of tasks, one
  series of decisions and one board that says what is being worked on.

## History

What was built before, planned by project. Nothing is added to their tasks, decisions or logs; their reference documents
stay in use, and the code cites their decisions by bundle and number.

- [HoloCMS port](holo-port/index.md) — The public site, housekeeping and the installer, ported from HoloCMS page by page
  to Go, SQLite + sqlc, Astro, Svelte 5 and Tailwind 4, each page behaving exactly as Holo's. Done.
- [Game server](server/index.md) — The game server that speaks the R26 client's protocol over WebSocket, with its state
  in packages/virtual: S0 to S5 done, from the foundations to furni, the catalogue and trading.
- [Client](client/index.md) — How the R26 client reaches the player's browser: its foundations, and the reference on
  LibreShockwave.
- [Later](later.md) — What was set aside for later, each section now named with the slice it belongs to.

## Sources

| Source | What it is | Read for |
| --- | --- | --- |
| `source/holocms/` | HoloCMS, the site and housekeeping of 2008, in PHP on MySQL | The site's pages, which behave exactly as Holo's ([0034](holo-port/decisions/0034-behaviour-matches-holo.md)), and Holo's client page |
| `source/holoemu/` | The Holograph Emulator for V26, a game server of 2008, in C# on MySQL | The game server, only when the client's `.ls` scripts are not enough ([0016](server/decisions/0016-holoemu-is-a-reference.md)) |
| `packages/client-r26/src/game/` | The R26 client's casts: their Lingo scripts (`.ls`) beside their JavaScript translations | The game's protocol, which comes from the `.ls` scripts only ([0008](server/decisions/0008-reverse-engineer-ls-only.md)) |
| `vendor/LibreShockwave/` | LibreShockwave, a Shockwave player, decompiler and SDK in C++ with a WebAssembly player, under the AGPL-3.0, a git submodule | The `#mus` framing ([0015](server/decisions/0015-client-on-libreshockwave.md)), and the client, which runs the `.dcr` on it ([0003](client/decisions/0003-libreshockwave-submodule.md)) |
| `vendor/HabboWidgets/` | Habbo's Flash widgets ported to HTML5, a git submodule | The landing promo, the registration's look editor and the group badge editor |

## Working on the plan

1. Load the `tracking-plans` skill. The bundle's own `rules.md` wins over it.
2. Resume from [reborn/index.md](reborn/index.md), then run the board: `python3 -I
   .agents/skills/tracking-plans/scripts/board.py`.
3. Never work on `main`: each task has its own branch and worktree under `.claude/worktrees/`, and nothing is pushed
   ([0097](holo-port/decisions/0097-no-agent-works-on-main.md),
   [0101](holo-port/decisions/0101-agents-clean-up-worktrees.md)). The coordinating session merges finished branches,
   one run of the gates for each batch ([reborn
   0002](reborn/decisions/0002-a-coordinator-shares-tasks-and-merges-in-batches.md)).
