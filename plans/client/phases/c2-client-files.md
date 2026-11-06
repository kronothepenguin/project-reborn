---
type: Phase
title: C2 The client's files
description: One program serves the client's files, the .dcr and its casts from a folder outside the binary and the external texts and variables that housekeeping edits, from inside the one binary.
status: planned
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [c2, client]
---

# Goal

One program serves everything the client loads: the `.dcr` and its casts from a folder outside the binary, and
`external_texts.txt` and `external_variables.txt`, which administrators edit in housekeeping. It runs inside the one
binary of `plans/later.md`, with the other programs.

# Scope

The user, who said it is an idea for now: "i also want a project to serve dcrs, so the binary gets all-in-one, so we
can edit external_text.txt, external_variables.txt in the housekeeping and add into an external folder the dcr to
serve... this is something i'm just thinking for the moment."

- An administrator adds the `.dcr` and its casts to the external folder, and the client page loads them from there.
- Housekeeping edits the external texts and variables, and the next client to load them gets the change.

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- Whether it is a new project, a package and a runner made with `tools/create`, or a part of an existing one, and its
  name.
- Where the external folder is set, and what it may hold: the `.dcr`, its `.cct` casts, and whatever else the client
  loads, such as the figure data.
- Where housekeeping keeps the texts and the variables, in the database or as files in the folder, and what fills them
  the first time.
- Which housekeeping attribute lets someone edit them.
- How it runs alone and under the orchestrator, beside the other programs.
- Whether the binary embeds a default set of files, or serves only what the folder holds.
