# Reference

What HoloCMS (`source/holo/`) contains and where each part goes. These documents replace re-reading the PHP.

## Legacy system

- [Holo public site](/reference/holo-pages.md) — Holo's public pages, layouts, navigation, UI building blocks and interactive behaviours, and the phase that ports each of them.
- [Holo housekeeping](/reference/holo-housekeeping.md) — Holo's admin panel pages, its access model, staff log, layout and risky features, and where each part goes.
- [Holo database and the new schema](/reference/holo-database.md) — Holo's tables, the problems found in them, Holo's settings, and the new normalized schema that replaces them.
- [Holo formats and protocols](/reference/holo-protocols.md) — MUS commands, SSO tickets, group badge codes, promo habbo XML, figure strings, BBCode and the captcha as Holo used them.

## The port

- [The home art](/reference/art.md) — What art the repository holds under packages/cms/public/c_images, where it came from, and what is still missing.
- [How database updates work](/reference/database-updates.md) — How a release's schema and seed changes reach an installed hotel through update files in packages/store, automatic and waiting updates, a copy before each run, and housekeeping's update page with config.json's new keys.
- [How the programs work together](/reference/architecture.md) — Which programs make up Project Reborn, what each one owns, and how they interact when they run alone and when they run together in one process.
- [Where the port differs from Holo](/reference/holo-differences.md) — Every behaviour of the port that differs from HoloCMS on purpose, with the reason, so that the user can veto it.

## Design

- [Holo colours mapped to Tailwind](/reference/colours.md) — The closest Tailwind colour for each Holo colour, computed with tools/tw-color, for the public site, BBCode and housekeeping.
