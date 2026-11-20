---
type: Spec
title: Hotel status
description: The site shows whether the game runs and who is in it, staff start and stop the game in housekeeping, and maintenance closes it.
status: active
projects: [packages/services, packages/server, packages/settings, packages/cms, packages/housekeeping, packages/reborn, apps/reborn, apps/server, apps/cms, apps/housekeeping, tests/e2e]
---

# What

The site knows whether the game runs. While it runs, every page shows the habbos online and "Enter <site name>", and
each habbo shows as online or offline. While it is stopped, the site shows "offline" and "Hotel Closed". Staff start
and stop the game in housekeeping, and closing the site for maintenance stops it too. It works the same under reborn
and with the programs run apart, where a game that gives no answer counts as stopped.

The user asked for it in these words: "the site should show "online" if game server is open/running, the "Enter
<site name>" is shown if game server is running. I think we can add an option to housekeeping to start/stop the
game-server. remember we have two modes, orchestractor and standalone, i want to keep "offline" and "Hotel Closed"
behaviors when the game server is off, either because it is turned off in the housekeeping, maintenance or when
running standalone the game server mus or api doesn't respond."

It builds on [habbos](/features/habbos/spec.md), [the client](/features/client/spec.md) and
[hotel settings](/features/hotel-settings/spec.md).

# Behaviours

## The game

- The game starts with the hotel open and the site open: its doors open, and a client connects.
- The game starts with the hotel closed or the site closed: its doors stay closed, and its program keeps running.
- The game is stopped with habbos inside: each is sent the client's "hotel closed" notice and logged out with its
  last time online saved, and the doors close. Each connection stays open for 5 seconds after the notice, so the
  client shows it, then closes.
- The game is started after a stop: its doors open again, and a client connects.
- The game is started while the site is closed for maintenance: its doors stay closed.
- A program asks the game for its status: it learns whether the doors are open and how many habbos are inside.
- A program asks which of some habbos are online: the game answers for each of them.
- A program asks who is online: the game lists every habbo inside.
- With the programs run apart, the same questions and commands go through the game's `/api/`, which answers 404
  without the secret.

## The site

- The game runs: every page shows the number of habbos online with the online picture, and the header shows "Enter
  <site name>".
- The game is stopped, or gives no answer within 1 second: every page shows 0 online with the offline picture, and
  the header shows "<site name> is offline".
- A habbo opens its Me page: the Enter button shows while the game runs, and "Hotel Closed" while it is stopped.
- A habbo opens the client page while the game is stopped: it is sent to its Me page.
- A habbo's client loses its connection while the game is stopped: its window shows "Hotel Closed" with the hotel's
  name; while the game runs, it shows the error page as before.
- A page shows a habbo that is in the hotel: the online picture shows beside it, on the profile widget, the community
  page, the staff page and the forum's posts; a habbo outside the hotel shows the offline picture.

## Housekeeping

- Staff choose Hotel Closed in "Turn your hotel on/off": the game stops, and it stays stopped after a restart.
- Staff open the hotel again: the game starts.
- Staff close the site for maintenance: the game stops; staff open the site again: the game starts, unless the hotel
  is closed.
- Staff open the settings page: "Turn your hotel on/off" shows whether the game runs and how many habbos are inside,
  or that the game gives no answer.
- Staff save the hotel's switch while the game gives no answer: the choice is saved, and the game follows it when it
  next starts.
- Staff open the dashboard: the number of habbos online shows beside Members.
- Staff with `housekeeping.users` open Online Users: Holo's table lists every habbo in the hotel, with the link to
  edit it; staff without it are refused.

## Next

- A program asks the game and gets no answer, page after page: its log holds one line for the moment the answers
  stopped, and one for the moment they came back.
