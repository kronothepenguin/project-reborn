# Specs Archive

Archived feature specs. This directory holds completed spec directories that are
no longer active features but must remain auditable: they keep their spec, plan,
research, contracts, data-model, tasks, and checklists exactly as they were.

**These are historical records, not active features.** Do not implement from
them. Use the current consolidated or successor spec instead.

## Convention

- **What goes here**: superseded, consolidated, or retired feature directories,
  moved intact with `git mv specs/<NNN-name> specs/archive/<NNN-name>`.
- **What does not**: active features, and anything still being amended. A
  directory is archived only once its decisions are fully absorbed elsewhere or
  explicitly retired.
- **Spec Kit tooling**: the toolkit has no archive/deprecated setting; this
  directory is a team convention. Commands resolve the active feature from
  `.specify/feature.json`, and sequential feature numbering only scans `specs/`
  for `NNN-` prefixed directories, so nothing under `archive/` affects tooling.
- **Paths**: old text inside archived specs may reference
  `specs/<NNN-name>/...`; those paths are now
  `specs/archive/<NNN-name>/...` and are intentionally left as history.
- **Lineage**: when a spec supersedes or consolidates archived work, the
  successor links back here and records the mapping (e.g. a traceability or
  supersession appendix). Archived specs themselves are not edited.
- **Naming**: keep the original directory name so references remain stable.

## Contents

### Director Runtime series (001–011)

Eleven specs built `@project-reborn/director` (the Director MX 2004 / Shockwave
runtime). They were consolidated by **spec 015**, the authoritative contract:
[`../015-director-runtime/spec.md`](../015-director-runtime/spec.md)
(historical build plan: [`../015-director-runtime/contracts/build-plan.md`](../015-director-runtime/contracts/build-plan.md)).

| # | Spec | Commit | Role |
|---|------|--------|------|
| 001 | director-runtime | `690f795c` | Original vision (superseded by 002–011) |
| 002 | engine-base | `f67f8b4f` | Data types, constants, stabilization, test cleanup |
| 003 | engine-core | `d30b042f` | Functional sprites (Sprite ↔ Score) |
| 004 | engine-subsystem | `8352f455` | DirectorContext, subsystems, Score, lifecycle |
| 005 | engine-syntax | `b53b33e0` | Chunk helpers, put-*, `the` proxy |
| 006 | api | `45a3d233` | Method surface, owner registry, context consts |
| 007 | pack | `8c7fe620` | Definition contract + pack generator (habbo, fuse_client) |
| 008 | player | `b5bf80cb` | Worker runner, rendering, input, audio, net relay |
| 009 | browser | `3647b466` | Custom elements over `run()` |
| 010 | member-classes | `3edde81e` | 19 member media classes + `newMember` |
| 011 | scripting-objects | `5eada905` | Fileio, NetLingo, SpeechXtra, XMLParser, `xtra()` |

<!-- Add new archived series below using the same subsection pattern. -->