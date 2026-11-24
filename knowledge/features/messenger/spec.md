---
type: Spec
title: "Messenger: friends and their chat"
description: Habbos keep a friends list, send and answer friend requests, search for habbos, follow friends into rooms and chat with friends who are online, and the site shows a habbo's friends.
status: active
projects: [packages/store, packages/virtual, packages/server, packages/cms]
---

# What

Habbos keep a friends list, send and answer friend requests, search for habbos, follow friends into rooms, and chat with
friends who are online. It was the server's phase S6.

# Behaviours

## Next

### The friends list

- A habbo logs in: its client gets its friends, each with its name, look, motto, whether it is in the hotel and
  whether it can be followed, and the limits of friends and of waiting requests.
- A friend enters the hotel, leaves it, changes its look or its motto, or enters or leaves a room: the client of each
  of its friends in the hotel shows it at the next update.
- The hotel restarts: every friendship and every waiting request is as it was.

### Friend requests

- A habbo asks another to be its friend: the request is saved, and the other gets it at once when it is in the hotel,
  or with its list at its next login.
- A habbo accepts a request: the two are friends, and each client in the hotel shows the new friend at once.
- A habbo declines a request: the request is gone, and the asker is told nothing.
- A habbo asks itself, a friend it has, a habbo it already asked, or a name that no habbo has: nothing is saved.
- A habbo with a full friends list asks or accepts: it is refused with the client's own notice, and nothing is saved.
- A habbo asks one whose friends list or waiting requests are full: it is refused with the client's own notice.
- A habbo removes a friend: the two are friends no more, and each client in the hotel shows it at once.
- A habbo may have 200 friends, 600 with club, and 200 waiting requests; staff change the three numbers in
  housekeeping.

### Search and follow

- A habbo searches a name: it gets the habbos whose names start with it, its friends first, each with whether it is
  in the hotel.
- A habbo follows a friend who is in a room: it goes to that room and meets its door as anyone does: the bell, the
  password, the queue.
- A habbo follows a habbo that is no friend, a friend outside the hotel, or a friend in no room: it is told which, and
  stays where it is.

### The chat

- A habbo writes to a friend in the hotel: the friend's client shows the line at once.
- A habbo writes to a friend outside the hotel, or to a habbo that is no friend: its client is told which, and the
  line is dropped.
- A habbo invites friends to its room: each friend in the hotel gets the invitation with its text.
- A line of chat lives in memory alone: the hotel saves none.

# Open questions

- The mail notices of the client wait for the minimail ([HoloCMS 3.1.1](/sources/holocms/3.1.1-against-1.3.1.md)): the
  game sends none until it exists.
- The site's part: My Friends, friend requests and friend management, as 3.1.1 has them.
