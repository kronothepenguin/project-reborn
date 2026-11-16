---
type: Reference
title: Tests
description: How the tests of packages/server run, and what each test file and exit criterion proves.
tags: [server]
---

`TestMain`, in `server_test.go`, writes a `config.json` with free ports, opens
one database that every test shares, and starts the info, mus and `/api/` listeners once. `client_test.go` is a test
client that speaks R26 over a WebSocket as the client does on LibreShockwave,
one binary frame per write. Tests insert their own users, CMS sessions and SSO
tickets, as `knowledge/decisions/server/0030-sso-tickets-from-the-cms-sign-in.md`
says, and each uses habbos of its own.

- S0's exit criterion: `TestInfoSendsHelloAndLogsAnUnhandledCommandByName`.
- `entering_test.go` enters public rooms and habbo rooms through every door,
  the doorbell, bans, full rooms, a deletion, a logout and the ads.
- `chat_test.go` chats near and far, shouts, whispers, types, ignores up to the
  limit, dances and waves.
- `look_test.go` changes a habbo's look and motto outside the game, through
  `SendLook`: in a room, in the hotel view, while offline and after a second
  login.
- `api_test.go` tells the game of a saved look through `packages/server/api`, and gets 404 from the `/api/`
  without the secret, with a wrong one, and on any other path or method.
- `extras_test.go` rates a room, hosts an event and lists it, and shows groups
  and tags.
- `rights_test.go` gives and takes rights, kicks a habbo that walks out, bans
  it, lets it in again once its ban ended, and takes every right from the
  navigator.
- `queue_test.go` queues habbos at a full room, lets one in when a place
  frees, puts club members first and takes a spectator until the room empties.
- `walking_test.go` walks two habbos at once, a step every 500 ms, and turns
  one; `game`'s `walking_test.go` tests the way: around walls without cutting
  corners, heights, other habbos and seats.
- `catalogue_test.go`, `buying_test.go`, `hand_test.go` and `presents_test.go`
  read the catalogue as each habbo sees it, buy with and without credits, page
  through the hand, and send and open presents.
- `furni_in_rooms_test.go`, `placing_test.go` and `rollers_test.go` show a
  room's furni, walk around it, sit and lie on it, place, move, turn and pick it
  up, find it there again after the room unloads, and ride rollers.
- `using_test.go`, `postits_test.go`, `teleports_test.go`, `decorating_test.go`
  and `exchange_test.go` use lamps, gates, dice, wheels and drinks, write
  post-its, travel through teleports, decorate a room and turn credit furni into
  credits.
- `trading_test.go` and `recycler_test.go` trade furni, cut a trade short, and
  recycle furni through every state of a recycling.
- Every habbo a test makes has a name of its own across all the test files: the
  tests share one database, where names are unique.
- Tests that need short pings set `game.pingSeconds` and
  `game.pongTimeoutSeconds` for their run.
