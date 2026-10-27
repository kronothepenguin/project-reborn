---
name: tracking-holo-port
description: Reads and updates the HoloCMS port state bundle in plans/holo-port (OKF 0.2) — resuming work, creating and updating tasks, logging progress and recording decisions. Use when starting, continuing or finishing any work on porting source/holo to packages/cms, packages/housekeeping or packages/installer, or when asked about the port's status.
---

# Tracking the HoloCMS port

`plans/holo-port/` is the single source of truth for the port: decisions, phases, tasks, reference documents and a
log. `plans/holo-port/rules.md` holds the full rules; this skill is the short version.

## Resume

1. Read `plans/holo-port/index.md`, then the newest entries of `plans/holo-port/log.md`.
2. Open `plans/holo-port/tasks/index.md`. Continue in-progress tasks first, then todo tasks of the current phase
   whose `depends_on` are all done.
3. Read the task's phase file and the decisions and reference documents it links before touching code.

## Work a task

```text
Task:
- [ ] status: in-progress, timestamp updated, "**Start**" log entry
- [ ] every step of "# Steps" done and checked
- [ ] every "# Verification" command run, results written in the task
- [ ] status: done, timestamp updated, verified: [{by, at}] added
- [ ] tasks/index.md and the phase file updated
- [ ] "**Done**" log entry under today's "## YYYY-MM-DD"
```

- Blocked: `status: blocked`, reason in `# Notes`, `**Blocked**` log entry.
- New work found: create a new task (next free `<phase-id>-<nn>`); never widen the current one silently.
- Never delete a task: `status: dropped` with the reason.
- A phase gets its tasks when it starts.

## Decisions

- A decision the user confirms becomes `decisions/NNNN-<slug>.md` with `status: accepted`.
- A changed decision gets a new file; the old one becomes `status: superseded` with `superseded_by`.
- An architecture choice that no decision covers is asked to the user before acting.

## Gotchas

- `index.md` and `log.md` are reserved OKF files: no frontmatter, except the root `index.md` (`okf_version: "0.2"`).
- Every other file needs a non-empty `type` and is listed in its directory `index.md` with its `description`.
- Links inside the bundle are bundle-absolute (`/tasks/p0-02-store-open-returns-db.md`).
- Timestamps are ISO 8601 with an explicit offset.
