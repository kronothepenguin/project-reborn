---
type: Task
title: Show groups across the site
description: The header's My Groups menu, the MY GROUPS widget of habbo homes with its group info, and the favourite group's badge on the profile widget and the staff page show a habbo's groups as in Holo.
status: todo
phase: p5
depends_on: [p5-04, p5-10]
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holo/quickmenu.php, source/holo/user_profile.php, source/holo/groupinfo.php, source/holo/staff.php, source/holo/templates/community/header.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

A habbo's groups show where Holo showed them, which [P2](/phases/p2-me-account.md), [P3](/phases/p3-homes.md) and
[P4](/phases/p4-community.md) left for P5.

# Steps

- [ ] The header's `My Groups` for signed-in visitors: `GET /me/groups` lists the active habbo's groups with the
  favourite, admin and owner marks, as `quickmenu.php?key=groups`.
- [ ] The `MY GROUPS` widget: placed once from the Widgets tab, it lists the habbo's groups with badges and marks,
  and `GET /groups/{id}/info` fills its info box, as `groupinfo.php`.
- [ ] The profile widget and the staff page show the favourite group's badge, linking to the group.
- [ ] The rows waiting for P5 leave the [differences](/reference/holo-differences.md).
- [ ] Go tests, and the `groups`, `homes` and `staff` browser suites check them.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && node run.mjs groups homes staff
```
