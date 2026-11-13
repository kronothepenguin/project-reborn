---
type: Task
title: Check the habbos slice's exit criteria
description: The user's demonstration is run under reborn and with the separate programs, and its evidence written here.
status: todo
slice: habbos
depends_on: [habbos-04, habbos-05, client-02]
packages: []
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

The habbos slice is done, with evidence for each exit criterion of [the slice](/slices/habbos.md).

# Steps

- [ ] Under reborn, with the client files of the main checkout: sign in on the site, open the client, enter a room, see
  the habbo; a second habbo in the same room.
- [ ] Save a new look on the site's looks page, a motto on the motto page and on the profile page, and both in
  housekeeping's habbo editor: each shows in both clients at once. Screenshots kept in the scratchpad, and the steps
  written here.
- [ ] With the separate programs and the runners' changes the user accepted, the same through the game's `/api/`; a
  request without the secret is answered 404.
- [ ] What fails becomes a new task of the slice.

# Verification

```sh
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `habbos-06`. The coordinator shows the result to the user and closes the slice.
