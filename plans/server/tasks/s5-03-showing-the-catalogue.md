---
type: Task
title: Show the catalogue
description: GCIX lists the catalogue's pages a habbo may see as 126, and GCAP sends a page with its texts, images and items as 127.
status: todo
phase: s5
depends_on: [s5-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_cat_code/3_Catalogue Interface Class.ls", "packages/client-r26/src/game/hh_cat_code/4_Catalogue Component Class.ls", "packages/client-r26/src/game/hh_cat_code/5_Catalogue Handler Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A habbo opens the catalogue and reads its pages ([hh_cat_code](/reference/r26/hh_cat_code.md)).

# Steps

- [ ] `GCIX` (101) answers 126 with the pages the habbo's access group level lets it see, in their order.
- [ ] `GCAP` (102) answers 127 with the page: its id, name, layout, images and texts, and a `p` line per item, a deal's
  with the furni it gives. A `p` line's purchase code names the catalogue item, since a sprite does not.
- [ ] A page the habbo may not see is not sent.
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-showing-the-catalogue`.
- To settle before it starts:
  - What the pages show whose furni works only from [S7](/phases/s7-club-help-extras.md): Pets, Camera and the five Trax
    pages.
  - What the client gets for a page the habbo may not see; Holo sent a page named `holo.cast.catalogue.access_denied`.
