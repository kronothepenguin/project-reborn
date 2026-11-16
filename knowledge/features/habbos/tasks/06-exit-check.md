---
type: Task
title: Check the habbos feature's behaviours
description: The user's demonstration is run under reborn and with the separate programs, in real browsers, and its evidence written in the report.
scope: []
depends_on: []
skills: [testing-behaviours]
---

# Goal

The habbos feature is done, with evidence for each behaviour of [the spec](/features/habbos/spec.md), and for the
first behaviour of [the client](/features/client/spec.md). The user's demonstration, in their words: "create a room
where i can see my habbo and allow me to go into cms, open the client, get into a room in the client, then if i modify
my look in the cms, the client (server) should reflect that." The behaviours it proves:

- Under reborn, a signed-in habbo opens the client from the site, enters a room and sees its habbo.
- A signed-in habbo opens the client page: the R26 client runs on LibreShockwave's player and logs in to the game with
  the page's SSO ticket.
- A habbo in a room has its look or motto changed outside the game: it and every habbo in the room see the new look
  and motto at once.
- With the separate programs, the same changes reach the game through its `/api/`, and the `/api/` answers 404 without
  the secret.

# Context

- [Spec](/features/habbos/spec.md) and [Plan](/features/habbos/plan.md)
- [The client's spec](/features/client/spec.md), `packages/cms/knowledge/client.md` and
  `packages/reborn/knowledge/run.md`.
- The main checkout holds what git ignores and the check needs: the user's client files in
  `/mnt/media/Projects/habbo/assets/` and the built player in
  `/mnt/media/Projects/habbo/packages/cms/public/libreshockwave/`. A worktree has neither: copy the player into the
  worktree's `packages/cms/public/libreshockwave/` before `make frontends`, and set `assets.path` of the test hotel's
  `config.json` to the main checkout's `assets` folder. Leave both folders of the main checkout as they are.
- The hotel of the check is a new one in a temporary folder, on free ports. The user's own hotel (`config.json` and
  `habbo.db` at the root of the main checkout) and any server of theirs stay untouched.
- The spike that first ran the client: `/tmp/claude-1000/-mnt-media-Projects-habbo/5838a8a3-d542-499e-90bf-949c857d87fb/scratchpad/reports/client-spike.md`, with its page and scripts in
  `/tmp/claude-1000/-mnt-media-Projects-habbo/5838a8a3-d542-499e-90bf-949c857d87fb/scratchpad/client-01/` while that folder lasts. It drove the client in headless Chromium and read the game's log.
- The client opens in a room when its page is asked for one: `/client?roomId=<id>&forwardId=2`
  (`packages/cms/knowledge/client.md`).
- The site's address setting (`site.url`) is the address the browser uses, and the written variables take the
  client's version from the game's setting, so the two agree.
- The master shows the result to the user and closes the feature.

# Steps

- [ ] Build reborn (`make frontends`, `make build`) and start it in a temporary folder. Install the hotel through the
  installer's pages; the installer imports the client's variables and texts from the assets folder.
- [ ] Two habbos of two users sign in on the site in two browser contexts, open the client from the header's Enter
  link, and reach the same room. Evidence: the game's log lines for both logins and room entries, and a screenshot of
  each client showing both habbos.
- [ ] One habbo saves a new look on the site's looks page: both clients show it without a reload. Then a motto on the
  Me page, a motto on the profile page, and a look and a motto in housekeeping's habbo editor. Evidence for each: the
  game's log, and a screenshot of each client before and after.
- [ ] The same hotel with the separate programs (the CMS, housekeeping and the game server's own runners): a look
  saved on the site reaches a client through the game's `/api/`, and a call without the secret is answered 404.
- [ ] Keep the screenshots and the logs in a folder of your own inside the scratchpad, and write in the report, in
  plain steps, how the user repeats the demonstration on their own hotel with `make dev` or the built `reborn`.
- [ ] What fails becomes a finding in the report, with what you saw and where: change no program, and the master
  writes a task for it.

# Checks

```sh
make check
make e2e
```
