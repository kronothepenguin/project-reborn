---
type: Decision
title: HoloCMS's source lives in source/holocms
description: HoloCMS's source moves from source/holo to source/holocms, a name that cannot be mistaken for the new packages/cms, and every path to it in the bundle follows.
status: accepted
timestamp: 2026-11-06T15:44:51+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:44:51+00:00"}
tags: [process, sources]
---

# Decision

- HoloCMS's source is `source/holocms/`, no longer `source/holo/`.
- Every path to it in this bundle names `source/holocms/`: the tasks' `holo:` lines, the phases, the reference
  documents, [the rules](/rules.md), the root [index](/index.md) and three accepted decisions,
  [0005](/decisions/0005-argon2id-passwords.md), [0016](/decisions/0016-installer.md) and
  [0017](/decisions/0017-guest-read-access.md), where only the path changed.
- The task field that lists the Holo sources a task ports keeps its name, `holo:`.

# Context

On 2026-11-06 the user added the Holograph Emulator's source beside HoloCMS's and asked: "i want to rename
@source/holo/ as something like holocms or just cms and @"source/Holo V26/" as holoemu, holoserver or just server. you
will find out there is a bunch of files for planning referencing them in @plans/ , so i want to update them as well
with the new names".

Offered `holocms` and `holoemu`, `cms` and `server`, or `holocms` and `holoserver`, the user chose `holocms` and
`holoemu`, which name the products themselves, over `cms`, which would also name `packages/cms`. The emulator is a
reference of the game server, `plans/server/decisions/0016-holoemu-is-a-reference.md`.

# Consequences

- The paths in 0005, 0016 and 0017 are the only change made to accepted text, at the user's request; what those
  decisions say is unchanged.
- A branch that started before the move, such as `p5`, meets a conflict on the `holo:` line of each task it touched
  when it merges `main`: it keeps its own status and timestamp, and the new path.
- `plans/index.md` lists every source and the plans that read it.
