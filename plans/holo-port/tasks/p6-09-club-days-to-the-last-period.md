---
type: Task
title: Count the club days to the end of the last period
description: The club days of the Me page and the account pages run to the end of the user's last period while one covers now, as Holo's HCDaysLeft counted every month bought, where GetClubEnd stops at the end of the period that covers now.
status: todo
phase: p6
depends_on: [p6-02]
packages: [packages/store, packages/cms]
holo: [source/holocms/core.php, source/holocms/me.php, source/holocms/account.php]
timestamp: 2026-11-06T22:58:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:58:16+00:00"}
---

# Goal

A club member's days left count every period bought, as Holo's `HCDaysLeft` counted every month left, now that a
period bought during the club starts at the end of the running one ([p6-05](/tasks/p6-05-club-page.md)).

# Steps

- [ ] The club days of the Me page and the account pages (`clubDays` in `packages/cms/internal/router/me.go`) run to
  the end of the user's last period while a period covers now: 1 month and then 3 months bought 10 days later leave
  114 days, as Holo's `HCDaysLeft` gives, and a user whose periods have all ended has none.
- [ ] Tests: two periods back to back give the days to the end of the second, in the store or the router, and on the
  Me page and an account page.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store and packages/cms
```

# Notes

- Found by [p6-02](/tasks/p6-02-store-economy.md): `GetClubEnd` gives the end of the period that covers now, the first
  of two periods back to back, so those two purchases leave 21 days on the Me page where Holo gives 114.
  `GetLatestClubEnd` gives the end of the user's last period.
- The club page's days ([p6-05](/tasks/p6-05-club-page.md)) need the same count, so this task comes before it or with
  it, and before [p6-08](/tasks/p6-08-exit-check.md).
