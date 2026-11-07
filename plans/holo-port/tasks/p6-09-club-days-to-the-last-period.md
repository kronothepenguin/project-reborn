---
type: Task
title: Count the club days to the end of the last period
description: The club days of the Me page and the account pages run to the end of the user's last period while one covers now, as Holo's HCDaysLeft counted every month bought, where GetClubEnd stops at the end of the period that covers now.
status: done
phase: p6
depends_on: [p6-02]
packages: [packages/store, packages/cms]
holo: [source/holocms/core.php, source/holocms/me.php, source/holocms/account.php]
timestamp: 2026-11-07T00:20:09+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:58:16+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:20:09+00:00"}
---

# Goal

A club member's days left count every period bought, as Holo's `HCDaysLeft` counted every month left, now that a
period bought during the club starts at the end of the running one ([p6-05](/tasks/p6-05-club-page.md)).

# Steps

- [x] The club days of the Me page and the account pages (`clubDays` in `packages/cms/internal/router/me.go`) run to
  the end of the user's last period while a period covers now: 1 month and then 3 months bought 10 days later leave
  114 days, as Holo's `HCDaysLeft` gives, and a user whose periods have all ended has none.
- [x] Tests: two periods back to back give the days to the end of the second, in the store or the router, and on the
  Me page and an account page.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store and packages/cms
```

Results (2026-11-07T00:20:09+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/cms`; in `packages/store`,
  `go tool sqlc diff` and `make check-docs` pass too.
- `TestTheClubEndsWithItsLastPeriod`, in the store, buys the periods in order and reads each at or after its
  purchase: a month bought on day 0 ends on day 31; with three months bought on day 10, the club ends on day 124 read
  on day 10 and on day 50; it has none before day 0, at its end on day 124, or on day 150 while another user's period
  runs; and a month bought on day 200, after the club ended, ends on day 231.
- `TestClubDaysRunToTheEndOfTheLastPeriod`, in the CMS, gives a month bought 10 days ago and three months bought now:
  the Me page and `/account/profile` both show 114 days. The tests of one period, `TestMeCountsClubDays`,
  `TestClubMembersSeeTheirDays` and `TestHabbosShareTheWalletAndTheClub`, still pass, a period that has ended giving
  0 days.
- Breaking the query on purpose fails the store test, 6 of 6: the old query, which ends at the period that covers now;
  any user's last period; any user's period covering now; a period counted before it starts; one counted at its end;
  and the earliest end. With the old query, the Me page and `/account/profile` show 21 days and the CMS test fails.

# Notes

- Found by [p6-02](/tasks/p6-02-store-economy.md): `GetClubEnd` gives the end of the period that covers now, the first
  of two periods back to back, so those two purchases leave 21 days on the Me page where Holo gives 114.
  `GetLatestClubEnd` gives the end of the user's last period.
- The club page's days ([p6-05](/tasks/p6-05-club-page.md)) need the same count, so this task comes before it or with
  it, and before [p6-08](/tasks/p6-08-exit-check.md).
- `GetClubEnd` now gives the end of the user's last period while a period covers now, which is the club's end, since
  a period bought during the club starts where the last one ends. `clubDays` keeps its signature and its code, and
  the home page's `inClub` keeps reading `GetClubEnd` as it did: found or not found means the same.
