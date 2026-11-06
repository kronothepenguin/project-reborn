---
type: Task
title: Show the staff page
description: GET /staff lists the staff in one list, as Holo, and shows the two BBCode boxes, while features.staffPage is on.
status: done
phase: p4
depends_on: [p4-02]
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holocms/staff.php]
timestamp: 2026-11-04T16:24:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T16:24:45+00:00"}
---

# Goal

Anyone sees the staff team, as in Holo's `staff.php` ([0076](/decisions/0076-one-staff-list.md)).

# Steps

- [x] The list: every member of a listed group once, sorted by habbo name, with avatar, home link, online state, motto (`No motto`), `Rank:` and `Last Visit:`, and the worn badge.
- [x] The two boxes with their headings, BBCode bodies and colours.
- [x] With `features.staffPage` off, the page sends visitors to the landing page, as Holo's did.
- [x] The store's staff operation and its docs.
- [x] Tests and a browser suite `staff`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && pnpm test staff
```

Results (2026-11-04T16:24:45+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms` and `packages/store`; `make check-docs` and
  `go tool sqlc diff` pass in `packages/store`; the component tests pass (125).
- `pnpm test staff` passes all 12 checks: the title and sub-tab, no Housekeeping tab for a guest, each member once by
  name and no player, `No motto` and the highest group as `Rank:`, Holo's `Last Visit:` format, the worn badge, the
  offline state and the avatar from the imager, the home link, the two boxes with Holo's headings and texts in green,
  a white box with its heading in black and a body with BBCode and no smilies after changing the settings, and the page
  sending visitors to the landing page when switched off. The screenshots `staff` and `staff-boxes` were read by eye.
- The store test lists each member of the listed groups once, under the highest group (the oldest on a tie), as the
  habbo chosen for it or else the first habbo not archived, with the worn badge, and leaves out unlisted groups and
  members whose habbos are all archived. The CMS tests find the list, the last visit from a session, a sign-in or the
  habbo's creation, the boxes as Holo's until changed, the switch and maintenance.
- Breaking these on purpose fails a test: the visit in the news format, the session or the sign-in ignored, no creation
  date, an empty motto, a badge without its path, smilies in the boxes, a colour from the heading, the switch ignored,
  the page open during maintenance, and in the query unlisted groups, the lowest level first, the newest group on a
  tie, archived habbos shown, every membership listed, and an unworn badge.

# Notes

- The group badge waits for [P5](/phases/p5-groups-forum.md).
- `Last Visit:` is Holo's `lastvisit` in its `d-m-Y H:i:s`, in UTC: when the habbo was last seen on the site, or else
  signed in, or else was made, when Holo first wrote it.
- The page takes the 460/310/160 of `body#home`, as Holo gave pages without a `body_id` no widths. The avatar keeps
  Holo's size `b`, direction 2 and head direction 3, and the boxes are BBCode without smilies, as Holo's HTML had none.
- The screenshot showed guests a Housekeeping tab: the page's `Staff` list hid the layout's `Staff`. The list is now
  `Members`, and `TestNoPageHidesAFieldOfTheLayout` guards every CMS page, as housekeeping's does for its layout.
- `Card`'s white header writes its text in black, as Holo's white boxes did; every other colour stays white on its bar.
