---
type: Task
title: Make the room forward work and take the client's addresses from the request
description: The client page sends forward.type beside forward.id, and the page and the written variables build the client's addresses from the address the browser used in place of the site address setting.
scope: [packages/cms]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

Two faults the habbos exit check found ([Plan](/features/client/plan.md), the two decisions of 2026-11-16). The
behaviours of the spec:

- A habbo opens the client page with a habbo's room to go to: the client really enters that room, because the page
  tells it the kind of room too.
- A habbo opens the client on any address the hotel answers on: the client loads its files, its variables and its
  texts from that same address.

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `packages/cms/knowledge/client.md`: the client page's parameters, and `/dcr/` with `dcrHotel`.
- The client's navigator forwards only when both `forward.id` and `forward.type` exist
  (`packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls`, around lines 767 and 792 to 801; read
  it through `tr '\r' '\n'`). `2` is a habbo's room.
- Under reborn the hotel answers on reborn's address, while `site.url` keeps its default, the CMS's own port: the
  exit check had to set it by hand before the client would load.
- `packages/auth` knows the trusted proxies of `config.json` (`RealIP`): a request that came through one carries the
  visitor's host and scheme in its forwarding headers.

# Steps

- [ ] The client page's `sw9` carries `forward.type=2` beside `forward.id` when the room exists.
- [ ] The client page and `dcrHotel` build the hotel's address from the request: its scheme and its host, and the
  forwarding headers of a trusted proxy when the request came through one. `dcr.Hotel` keeps its shape. The site
  address setting keeps every other use.
- [ ] One test per behaviour of the goal, through the router: the forward's two values on the page; and a request on
  another host and port, whose page and variables name that host and port.
- [ ] Check the forward in a real browser if the client's files and the player are at hand in the main checkout
  (`/mnt/media/Projects/habbo/assets` and `packages/cms/public/libreshockwave`, read only), on a hotel of your own in
  a temporary folder: say in the report whether the client entered the room.
- [ ] Update `packages/cms/knowledge/client.md`.

# Checks

```sh
make -C packages/cms check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`.
