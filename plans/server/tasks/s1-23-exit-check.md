---
type: Task
title: Check S1's exit criteria
description: Cross-check the R26 reference against every registration in the client's scripts, so that no message, command or sender is missing, and close the phase.
status: done
phase: s1
depends_on: [s1-01, s1-02, s1-03, s1-04, s1-05, s1-06, s1-07, s1-08, s1-09, s1-10, s1-11, s1-12, s1-13, s1-14, s1-15, s1-16, s1-17, s1-18, s1-19, s1-20, s1-21, s1-22, s1-24]
packages: []
client: []
timestamp: 2026-11-09T21:39:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T21:39:41+00:00"}
---

# Goal

S1 meets its [exit criteria](/phases/s1-protocol-reference.md#exit-criteria) on `main`.

# Steps

- [x] Every script in [Registering scripts](/reference/client-r26.md#registering-scripts) is covered by a document.
- [x] Every message id and command name that any `.ls` script registers appears in exactly one document's tables,
  and ids that several casts register are cross-linked in their notes.
- [x] Every `send(` and `sendNew(` call in every cast, `hh_furni_classes`, `hh_room_ui` and `hh_pets_common`
  included, is listed as a sender of its command.
- [x] The counts of [Registering scripts](/reference/client-r26.md#registering-scripts) are corrected where a document
  found them different.
- [x] S1 is `done`; `/index.md` names the active phases.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
```

The cross-checks are scripted in the task, and their output is written here.

Results, on `main` at `37cbd71d`, once every other S1 task had merged, in the worktree `s1-exit-check`:

- The bundle check: 99 concepts, 0 problems.
- The script below, over `plans/server/reference/r26` and an LF copy of every `.ls` script:
  `31 registering scripts, 240 message ids, 218 commands, 329 sends`, and no problem.
  - Every script that registers a message or a command, 31 of them, has its cast's document, and every message id,
    with its handler, and every command name, with its id, is in that document's tables. With `fuse_client`'s Binary
    Manager, whose `#mus` subjects it checks apart, that is the 32 scripts of
    [Registering scripts](/reference/client-r26.md#registering-scripts).
  - Every send of a registered command, in any cast, is in its row in the document of every cast that registers it.
    `CHAT`, `SHOUT` and `WHISPER` are sent under the chat mode's name, and were checked by reading `sendChat`.
  - The four names sent but registered by no cast, `ADCLICK`, `GETBINDATA`, `LOGIN` and `POLL_CANCEL`, and the seven
    `#mus` subjects the client listens to are each named in a document.
  - Every id or name that several casts register is named, with the other casts, in each of their documents.
  - The counts of [Registering scripts](/reference/client-r26.md#registering-scripts) match the scripts, `-1` left out
    as its note says.
- Its first run found two problems, fixed here: `hh_entry_init`'s table had no row for `-1`, now added; and
  [Registering scripts](/reference/client-r26.md#registering-scripts) counted 72 commands for `hh_room`, now 73, the
  symbol `#room_directory` included. `hh_entry_init`'s sentence that no script sends `GET_AVAILABILITY_TIME` now says
  it is sent only on a message no script executes.

"Every message id and command name appears in exactly one document's tables" is read as one document for each
registering cast: an id that several casts register has a row in each of their documents, cross-linked in their notes.

```python
"""S1 exit check: every registration in every .ls script, and every send, against the R26 reference.

Usage: check_s1.py <reference/r26 dir> <LF copy of the casts>

- Every script that registers messages or commands, found by scanning all casts, has its cast's document, and
  each registered message id (with its handler) and command name (with its id) is in that document's tables.
- Every send of a registered command, in any cast, is listed in its row in the document of every cast that
  registers the command.
"""
import re
import sys
from pathlib import Path

ref, lf = Path(sys.argv[1]), Path(sys.argv[2])


def tables(doc):
    def table(heading):
        if f"# {heading}\n" not in doc:
            return []
        part = doc.split(f"# {heading}\n", 1)[1].split("\n# ", 1)[0].split("\n## ", 1)[0]
        return [[c.strip() for c in l.strip("|").split("|")] for l in part.splitlines()
                if l.startswith("| ") and not l.startswith("| ---") and not l.startswith("| Id ")]
    msgs = {int(r[0]): r[1] for r in table("Messages from the server") if re.fullmatch(r"-?\d+", r[0])}
    cmds = {r[1].strip("`"): (int(r[0]), r[3]) for r in table("Commands from the client") if r[0].isdigit()}
    return msgs, cmds


registrations = {}  # (cast, script) -> (msgs {id: {handlers}}, cmds {name: id})
for path in sorted(lf.rglob("*.ls")):
    text = path.read_text(errors="replace")
    msgs, cmds = {}, {}
    for m in re.finditer(r"\b(?:tMsgs|tMessages)\.setaProp\((-?\d+), #(\w+)\)", text):
        msgs.setdefault(int(m.group(1)), set()).add(m.group(2))
    for m in re.finditer(r"^\s*registerListener\([^\[\n]*\[([^\]]*)\]\)", text, re.M):
        for pair in re.finditer(r"(-?\d+): #(\w+)", m.group(1)):
            msgs.setdefault(int(pair.group(1)), set()).add(pair.group(2))
    for m in re.finditer(r'\b(?:tCmds|tCommands)\.setaProp\((?:"(\w+)"|(#\w+)), (\d+)\)', text):
        cmds[m.group(1) or m.group(2)] = int(m.group(3))
    for m in re.finditer(r"^\s*registerCommands\([^\[\n]*\[([^\]]*)\]\)", text, re.M):
        for pair in re.finditer(r'"(\w+)": (\d+)', m.group(1)):
            cmds[pair.group(1)] = int(pair.group(2))
    if msgs or cmds:
        registrations[(path.parent.name, path.name)] = (msgs, cmds)

problems = []
docs = {}
registered_by = {}  # command name -> {cast}
for (cast, script), (msgs, cmds) in registrations.items():
    doc_path = ref / f"{cast}.md"
    if not doc_path.exists():
        problems.append(f"{cast}/{script}: no document {doc_path.name}")
        continue
    if cast not in docs:
        docs[cast] = tables(doc_path.read_text())
    dmsgs, dcmds = docs[cast]
    for mid, handlers in msgs.items():
        for h in handlers:
            if f"`{h}`" not in dmsgs.get(mid, ""):
                problems.append(f"{cast}/{script}: message {mid} ({h}) not in {cast}.md")
    for name, cid in cmds.items():
        registered_by.setdefault(name, set()).add(cast)
        if name not in dcmds:
            problems.append(f"{cast}/{script}: command {name} ({cid}) not in {cast}.md")
        elif dcmds[name][0] != cid:
            problems.append(f"{cast}/{script}: command {name} is {cid}, {cast}.md says {dcmds[name][0]}")

sends = 0
for path in sorted(lf.rglob("*.ls")):
    handler = None
    for line in path.read_text(errors="replace").splitlines():
        h = re.match(r"on (\w+)", line)
        if h:
            handler = h.group(1)
        for name, casts in registered_by.items():
            quoted = rf"{name}\b" if name.startswith("#") else rf'"{name}"'
            if re.search(rf"\.send(New)?\({quoted}", line):
                sends += 1
                for cast in casts:
                    row = docs.get(cast, ({}, {}))[1].get(name, (0, ""))[1]
                    if path.name not in row or f"`{handler}`" not in row:
                        problems.append(f"{name}: {path.parent.name}/{path.name} {handler} not in {cast}.md's row")

# Names sent that no cast registers, and the #mus subjects: each must be named in some document.
alltext = "\n".join(f.read_text() for f in sorted(ref.glob("*.md")))
unregistered = {}
for path in sorted(lf.rglob("*.ls")):
    handler = None
    for line in path.read_text(errors="replace").splitlines():
        h = re.match(r"on (\w+)", line)
        if h:
            handler = h.group(1)
        for m in re.finditer(r'\.send(?:New)?\("([A-Za-z_0-9]+)"', line):
            if m.group(1) not in registered_by:
                unregistered.setdefault(m.group(1), []).append(f"{path.parent.name}/{path.name} {handler}")
for name, where in sorted(unregistered.items()):
    if f"`{name}`" not in alltext:
        problems.append(f"sent but registered by no cast, and in no document: {name} ({'; '.join(where)})")
mus = set()
for path in sorted(lf.rglob("*.ls")):
    text = path.read_text(errors="replace")
    for m in re.finditer(r'tList\["([A-Z_]+)"\] = #\w+', text):
        mus.add(m.group(1))
    for m in re.finditer(r'getMultiuserManager\(\)\.registerListener\([^\[\n]*\[([^\]]*)\]\)', text):
        mus.update(re.findall(r'"(\w+)": #\w+', m.group(1)))
for subject in sorted(mus):
    if f"`{subject}`" not in alltext:
        problems.append(f"#mus subject {subject} in no document")
# The Registering scripts table's counts, against the scripts. -1 is left out of "In" by the table's own note.
client = (ref.parent / "client-r26.md").read_text()
part = client.split("# Registering scripts\n", 1)[1].split("\n# ", 1)[0]
for line in part.splitlines():
    cells = [c.strip() for c in line.strip("|").split("|")]
    if len(cells) != 5 or not cells[0].startswith("`hh_") and not cells[0].startswith("`fuse"):
        continue
    cast, script = cells[0].strip("`"), cells[1].strip("`")
    if (cast, script) not in registrations:
        if cells[2] != "—":
            problems.append(f"table: {cast}/{script} registers nothing the check reads")
        continue
    msgs, cmds = registrations[(cast, script)]
    n_in = len([m for m in msgs if m != -1])
    if not cells[2].startswith(str(n_in)):
        problems.append(f"table: {cast}/{script} In says {cells[2]}, the script registers {n_in} (without -1)")
    if cells[3] != str(len(cmds)):
        problems.append(f"table: {cast}/{script} Out says {cells[3]}, the script registers {len(cmds)}")

# Ids and names that several casts register: each of their documents names the other casts.
by_id, by_name = {}, {}
for (cast, script), (msgs, cmds) in registrations.items():
    for mid in msgs:
        by_id.setdefault(mid, set()).add(cast)
    for name in cmds:
        by_name.setdefault(name, set()).add(cast)
for label, table in (("message", by_id), ("command", by_name)):
    for key, casts in sorted(table.items(), key=lambda kv: str(kv[0])):
        if len(casts) < 2:
            continue
        for cast in casts:
            text = (ref / f"{cast}.md").read_text()
            for other in casts - {cast}:
                if other not in text:
                    problems.append(f"{label} {key}: {cast}.md does not name {other}, which registers it too")

print(f"{len(unregistered)} names sent but registered by no cast: {', '.join(sorted(unregistered))}")
print(f"{len(mus)} #mus subjects listened to: {', '.join(sorted(mus))}")
print(f"{len(registrations)} registering scripts, {sum(len(m) for m, _ in registrations.values())} message ids, "
      f"{sum(len(c) for _, c in registrations.values())} commands, {sends} sends")
for p in problems:
    print("PROBLEM", p)
sys.exit(1 if problems else 0)
```

# Notes

- Runs on the branch `s1-exit-check`.
