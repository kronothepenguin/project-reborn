# Later

Work planned for later that belongs to no phase yet ([0072](holo-port/decisions/0072-later-work-in-plans-later.md)). An
item becomes a phase, with its decisions, when the user starts it. The state of the port lives in
[holo-port](holo-port/index.md), and the state of the game server in [server](server/index.md); [the plans'
index](index.md) lists every plan.

## The orchestrator

`apps/reborn` runs the installer, the CMS, housekeeping and the game server from one binary
([0039](holo-port/decisions/0039-orchestrator-is-a-later-project.md)). Nothing of it is built.

### One binary

Reborn is distributed as one file. An administrator updates a hotel by replacing the file and restarting the process,
and the database follows through its updates ([How database updates work](holo-port/reference/database-updates.md)).
Releases then publish one binary instead of the three of
[0062](holo-port/decisions/0062-ci-and-releases.md).

The user: "i want to distribute reborn as single binary, so every admin can just replace the old file and restart the
proccess. this is why i want an updating system."

### Install only when nothing is installed

When it starts, the orchestrator checks the installation. It runs the installer only when nothing is installed yet, and
otherwise runs the hotel.

The user: "i like the installer currently knowns that everything is installed so it just show that everything is
installed, i also would like to include a verification step for the orchestractor so the installer only runs if nothing
is installed yet."

### Opening the installer again

An installed hotel may open its installer again only as an administrator's decision, blocked and secured, because
someone of a lower rank could use it to make themselves administrator.

The user: "i like the idea of enabling the installer anytime, but that should be an admin descision and should be
blocked and secured because the installer is a vector of attack, a malicius moderator or someone with smaller rank would
try to enable the installer to set them as the administrator."

### Already decided for it

- It sets the installer's addresses when it runs it ([0052](holo-port/decisions/0052-installer-has-no-modes.md)).
- One scheduler runs every program's tasks ([0043](holo-port/decisions/0043-scheduler.md)).
- One copy of the settings serves every program, with no refresh
  ([0051](holo-port/decisions/0051-one-machine-and-a-refresh.md)).
- How the programs run together: [How the programs work together](holo-port/reference/architecture.md).
- The game server keeps a WebSocket listener on the host and port of each of its connections, and WebSocket paths on
  the orchestrator's mux wait for later ([server 0020](server/decisions/0020-info-and-mus-websocket-ports.md)).
- The CMS and housekeeping change the game server's virtual state directly
  ([server 0013](server/decisions/0013-site-changes-like-mus.md)).

## r18

A second protocol for the game server, `packages/server/r18`, beside `r26`, served on listeners of its own
([server 0007](server/decisions/0007-protocols-per-listener.md)). The repository has no r18 client yet. Whether r18 and
r26 players share one hotel is documented both ways and settled when this starts.

The user: "create a way out for the server to have dynamic protocol, this means i can change between r26 and r18 or
support both at the same time" and "both, we can document it and just focus on r26 for now".

## Staff tools for groups

A housekeeping page, behind its own attribute, that renames a group, resets its badge or deletes it, so that staff can
deal with an offensive group ([0085](holo-port/decisions/0085-no-housekeeping-group-tools-yet.md)). Holo's housekeeping
only counted groups, and P5 keeps to that.

## Holo's chat commands

The chat commands Holo's server answered, behind fuses access groups already grant
([server 0045](server/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)): `:alert` and `:ra`
(`fuse_alert`), `:roomalert` (`fuse_room_alert`), `:kick` (`fuse_kick`), `:roomkick` (`fuse_room_kick`), `:shutup` and
`:unmute` (`fuse_mute`), `:roomshutup` and `:roomunmute` (`fuse_room_mute`), `:ban` (`fuse_ban`), `:superban`
(`fuse_superban`), `:commandlist`, `:teletome`, `:jatlook`, `:userinfo` and `:whosonline` (`fuse_moderator_access`),
`:refresh`, `:cat_transform`, `:ha`, `:offline`, `:mycoords` and `:masscredits` (`fuse_administrator_access`),
`:teleport` and `:warp` (`fuse_teleport`), `:credits` (`fuse_credits`), and `:freeze` and `:unfreeze` (`fuse_freeze`).
The game server has no phase for chat commands yet. [The Holograph Emulator](server/reference/holoemu.md#fuses) says
where Holo handled each.

The user chose "Every checked fuse (Recommended)": "The client's 14 and Holo's server's 15, 29 in all. Our server checks
each one when the phase of its feature comes (S3 navigator, S4 rooms, S7 mod tool and calls for help); Holo's chat
commands (:ha, :teleport, :freeze) have no phase yet and go to plans/later.md. The 11 unchecked names stay out."

## The word filter

Holo replaced each word of its `wordfilter` table with `wordfilter_censor`, `bobba`, ignoring case, in chat, room
names and descriptions, and messenger messages, while `wordfilter_enable` was on. The game server filters nothing yet
([server 0077](server/decisions/0077-the-word-filter-waits.md)); a task of its own brings a word list that housekeeping
edits and filters the three together.

The user chose "Later, on its own (Recommended)": "No filter in S4. plans/later.md keeps Holo's filter, a word list
that housekeeping edits, for one task that covers chat, room names and messages together. Example: in S4, chat shows
exactly what was typed."

## Five badges on the site

A habbo wears up to five badges in slots, as the R26 client's badge window sets them
([server 0083](server/decisions/0083-a-habbo-wears-five-badges-in-slots.md)). The site, from HoloCMS, shows one: the
badge of the first slot a habbo fills, on homes, forum posts and the staff page, and its club purchase and
housekeeping's badge tool wear a badge in slot 1, in place of the one there. Every phase of the port is done
([holo-port 0072](holo-port/decisions/0072-later-work-in-plans-later.md)), so how the site shows the five waits here.

The user chose "Five slots": "The store keeps a slot, 1 to 5, per worn badge; the site's badge page then needs a change
(plans/holo-port) to show several. Example: choosing 3 badges in the client shows all 3 in rooms."

## Achievements

The habbos have no achievements yet ([server 0051](server/decisions/0051-no-achievements-yet.md)): 436 lists none, the
server sends no 437, and `GETSELECTEDBADGES` (159), which the client sends only after a 437, has no handler. A phase
that brings achievements decides which ones exist, their levels and badges, how a habbo earns them, and what answers
`GETSELECTEDBADGES`.

The user chose "None yet (Recommended)": "436 lists no achievements and the server never sends 437. GETSELECTEDBADGES,
which the client sends only after a 437, then waits for the phase that brings achievements; plans/later.md notes it."

## Known issues

Issues the user has seen and chose to fix later.

### Group badge tint 15 is not brown

Group badges use the closest Tailwind colour to each of Holo's 18 tints
([0102](holo-port/decisions/0102-badges-keep-the-tailwind-palette.md)). For tint 15 that is olive-500 (`#7c7c67`), which
looks grey-olive beside Holo's brown `#977641`, and none of yellow-700, yellow-800, amber-800 or taupe-500 looked like
it either. The palette is `packages/cms/internal/badge/badge.go`, and the badge editor's copy is
`packages/cms/public/habbo-widgets/badge-editor/data/badge_data.xml`.

The user: "none looks like the original, you can use the closest, olive-500, but add this to known issues to fix it
later".
