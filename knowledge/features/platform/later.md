---
type: Note
title: "Platform: reborn runs the whole hotel: later"
description: Work set aside for the platform: the orchestrator, and the game server learning of a habbo archived on the site.
---

# The orchestrator

`apps/reborn` runs the installer, the CMS, housekeeping and the game server from one binary
([holo-port 0039](/decisions/holo-port/0039-orchestrator-is-a-later-project.md)). Nothing of it is built.

## One binary

Reborn is distributed as one file. An administrator updates a hotel by replacing the file and restarting the process,
and the database follows through its updates (`packages/store/knowledge/database-updates.md`).
Releases then publish one binary instead of the three of
[holo-port 0062](/decisions/holo-port/0062-ci-and-releases.md).

The user: "i want to distribute reborn as single binary, so every admin can just replace the old file and restart the
proccess. this is why i want an updating system."

## Install only when nothing is installed

When it starts, the orchestrator checks the installation. It runs the installer only when nothing is installed yet, and
otherwise runs the hotel.

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

- It sets the installer's addresses when it runs it
  ([holo-port 0052](/decisions/holo-port/0052-installer-has-no-modes.md)).
- One scheduler runs every program's tasks ([holo-port 0043](/decisions/holo-port/0043-scheduler.md)).
- One copy of the settings serves every program, with no refresh
  ([holo-port 0051](/decisions/holo-port/0051-one-machine-and-a-refresh.md)).
- How the programs run together: [How the programs work together](/programs.md).
- The game server keeps a WebSocket listener on the host and port of each of its connections, and WebSocket paths on
  the orchestrator's mux wait for later ([server 0020](/decisions/server/0020-info-and-mus-websocket-ports.md)).
- The CMS and housekeeping change the game server's virtual state directly
  ([server 0013](/decisions/server/0013-site-changes-like-mus.md)).

# The game server and a habbo archived on the site

Archiving a habbo on the site changes the store alone (the server's task s5-19): its
hand goes to the shared inventory and its rooms to the active habbo. A game server that runs learns of neither. A room
that is loaded keeps the owner it loaded with until its last habbo leaves, and an archived habbo that is in the hotel,
through a game session opened before it was archived, stays until it logs out, with a hand that is now empty. The site
would have to tell the server, which today only reads what the site wrote.
