# Later

Work planned for later that belongs to no phase yet ([0072](holo-port/decisions/0072-later-work-in-plans-later.md)). An
item becomes a phase, with its decisions, when the user starts it. The state of the port lives in
[holo-port](holo-port/index.md).

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
