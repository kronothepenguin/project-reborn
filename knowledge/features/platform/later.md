---
type: Note
title: "Platform: reborn runs the whole hotel: later"
description: Work set aside for the platform: what is left of reborn, opening the installer again, and the game server learning of a habbo archived on the site.
---

# The orchestrator

`apps/reborn` runs the installer, the site, housekeeping and the game server from one binary
([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)). It is built; what is left is below.

## One binary

Reborn is distributed as one file. An administrator updates a hotel by replacing the file and restarting the process,
and the database follows through its updates (`packages/store/knowledge/database-updates.md`).
Each release archive holds `reborn` beside `cms`, `housekeeping`, `installer` and `server`, so an administrator runs one
binary or several ([0008](/decisions/reborn/0008-releases-ship-reborn-and-the-separate-programs.md)).

The user: "i want to distribute reborn as single binary, so every admin can just replace the old file and restart the
proccess. this is why i want an updating system."

## Install only when nothing is installed

reborn serves the installer under `/installer/` until an administrator exists, and the hotel after
([0004](/decisions/reborn/0004-the-installer-inside-reborn.md)). This is built.

The user: "i like the installer currently knowns that everything is installed so it just show that everything is
installed, i also would like to include a verification step for the orchestractor so the installer only runs if nothing
is installed yet."

## Opening the installer again

An installed hotel may open its installer again only as an administrator's decision, blocked and secured, because
someone of a lower rank could use it to make themselves administrator.

The user: "i like the idea of enabling the installer anytime, but that should be an admin descision and should be
blocked and secured because the installer is a vector of attack, a malicius moderator or someone with smaller rank would
try to enable the installer to set them as the administrator."

## Already decided for it

- One scheduler runs every program's tasks ([holo-port 0043](/decisions/holo-port/0043-scheduler.md)).
- Every program reads each setting from the store when it uses it
  ([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).
- How the programs run together: [How the programs work together](/programs.md).
- The game server keeps a WebSocket listener on the host and port of each of its connections, and WebSocket paths on
  reborn's mux wait for later ([server 0020](/decisions/server/0020-info-and-mus-websocket-ports.md)).
- The site and housekeeping tell the game of a change through services
  ([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)).

# The game server and a habbo archived on the site

Archiving a habbo on the site changes the store alone (the server's task s5-19): its
hand goes to the shared inventory and its rooms to the active habbo. A game server that runs learns of neither. A room
that is loaded keeps the owner it loaded with until its last habbo leaves, and an archived habbo that is in the hotel,
through a game session opened before it was archived, stays until it logs out, with a hand that is now empty. The site
would tell the game through a service of its own
([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)).
