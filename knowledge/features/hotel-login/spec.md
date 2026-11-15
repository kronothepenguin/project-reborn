---
type: Spec
title: Hotel login
description: A habbo signed in on the site enters the hotel with an SSO ticket, and the game server keeps its session alive until it leaves.
status: done
projects: [packages/auth, packages/store, packages/server, packages/virtual, packages/housekeeping]
---

# What

Signing in on the site makes an SSO ticket for the active habbo. The R26 client connects to the game server, passes
the version check and logs in with that ticket. The habbo reaches the hotel view with its name, look, credits, badges
and sound setting. Pings keep the session alive, and a second login ends the first.

# Behaviours

## The ticket

- A user signs in on the site: an SSO ticket names its active habbo (decision server/0030).
- A signed-in user switches habbo: the old ticket goes, and the next ticket names the new habbo (decision server/0030).
- A user signs out of the site: the session's ticket dies with it (decision server/0030).
- The sign-in fails to make a ticket: the sign-in succeeds, and a ticket is made when one is asked for
  (decision server/0043).
- A guest asks for a ticket: none is made.

## The handshake

- A client connects: the server answers its encryption request at once, and every byte stays plain
  (decision server/0027).
- A client connects: it gets HELLO first.
- A client sends text with accents: the server reads and writes it as UTF-8 (decision server/0014).
- A client with the accepted version and its links on the site's address checks its version: it goes on to the login
  (decision server/0033).
- A client with empty links checks its version: it goes on to the login (decision server/0041).
- A new hotel checks a client's version: version 1 passes (decision server/0040).
- A client with another version or links elsewhere checks its version: it gets "Version not correct" and is closed
  (decision server/0049).
- A client logs in before its version check passed: it gets "Version not correct" and is closed
  (decision server/0049).
- A client sends a habbo's command before LOGIN_OK: it gets no answer.
- A client asks for the session parameters: it gets the ten that staff set in housekeeping (decision server/0034).

## Packets

- The server has a message the client would read wrongly, such as a character 1 in its body or an id past 4095: it sends
  none of it.
- A client sends a malformed or cut-short packet: only its session closes.
- A client sends a command no handler takes: the server logs its name and goes on.
- A client sends any packet: the log leaves its body out (decision server/0021).
- A client sends commands: they run in the order it sent them, and its messages arrive in the order the server sent
  them.
- A client stops reading its messages: it is closed.
- Two clients play at once: each runs at its own pace.

## The login

- A client logs in with a valid ticket: the habbo reaches the hotel view, and the ticket is spent
  (decision server/0028).
- A client logs in with a spent or unknown ticket, or one whose site session ended: it gets "login incorrect".
- A client logs in with a name and a password in its own login box: it gets "login incorrect" (decision server/0028).
- A habbo logs in: the client shows its name, figure, motto, credits, tickets, film and badges.
- A habbo logs in: it gets everyone's fuses, the club's when a member, and those of its staff groups
  (decision server/0045).
- A habbo logs in at any hour: the hotel is open (decision server/0032).
- A habbo turns the sound off: its next login starts with the sound off (decision server/0038).
- A habbo logs in: its machine id is saved with it (decision server/0035).
- A habbo logs in or leaves: its last time online is saved (decision server/0037).
- A habbo that is online logs in again: the first client opens the "logged in elsewhere" page and is closed, and the
  new one plays (decision server/0029).

## Keeping the session alive

- A client answers the server's ping, sent every 30 seconds: its session stays open (decision server/0042).
- A client stays silent for 90 seconds: it is closed, and its habbo logged out (decision server/0042).
- A client reports its latency: the server writes it to its log (decision server/0036).
- A client sends a latency test: it gets its id back.
- A client asks for the server's date: it gets today's date.
- Staff change the ping times in housekeeping: each session takes them at its next ping (decision server/0042).
- Staff set the ping timeout no longer than the ping interval: the value is refused.
