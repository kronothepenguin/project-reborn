---
type: Decision
title: The club status splits the club's days by club.daysPerMonth
description: Message 7 gives the days of the running period, 1 to club.daysPerMonth, the whole periods prepaid after it, and the whole periods of club the user has had, with response 1, which opens no window.
status: accepted
timestamp: 2026-11-10T02:32:11+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:32:11+00:00"}
tags: [server, club]
---

# Decision

- The club's days left are those the CMS shows (`clubDays` in `packages/cms/internal/router/me.go`): the days, a day
  that has begun among them, from now to the end of the user's last period, while a period covers now, and 0
  otherwise.
- With `D` the setting `club.daysPerMonth`, message 7 splits them: the days left of the running period are
  `(days − 1) mod D + 1`, and the prepaid periods `(days − 1) div D`. Example: 40 days with `D` 31 give 9 days and 1
  prepaid period. Without club, both are 0.
- The elapsed periods are the club time the user has had, summed over their periods up to now, in whole periods of `D`
  days.
- The product is `club_habbo`, and the response 1, as Holo sent it, so that the client opens no window.

# Context

`club_subscriptions` keeps purchases with their start and end, and a period of the CMS is `club.daysPerMonth` days,
while the client wants the days of the current period, the elapsed periods and the prepaid ones, and its bottom bar
shows the days left plus 31 for each prepaid period. Offered a split by the client's 31 days, by `club.daysPerMonth`,
or every day in the days left, the user chose "Split by club.daysPerMonth": "Using the setting's month. Same split when
it is 31; with 30, 40 days left gives 10 days and 1 prepaid, and the bar shows 10 + 31 = 41."

# Consequences

- s2-07 answers `SCR_GET_USER_INFO` with it.
