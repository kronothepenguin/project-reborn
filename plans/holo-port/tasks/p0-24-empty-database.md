---
type: Task
title: Check that every program works on an empty database
description: Prove that the CMS works on a database it creates itself, and that the installer still works on that database afterwards.
status: done
phase: p0
depends_on: []
packages: [packages/installer, packages/cms]
holo: []
timestamp: 2026-11-01T19:56:23+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:56:23+00:00"}
---

# Goal

Implement [0047](/decisions/0047-every-program-works-on-an-empty-database.md) for the programs that exist today.

# Steps

- [x] Start the CMS in an empty directory: it creates `config.json` and the database with default values.
- [x] Register on that database.
- [x] Run the installer on the same directory: it changes the defaults and creates the administrator.
- [x] After that the installer refuses to run again.
- [x] Fix whatever fails, and add a test for it.
- [x] Docs: the READMEs of `packages/cms` and `packages/installer`.

# Verification

On the production binaries, in an empty directory.

Results (2026-11-01T19:56:23+00:00):

On the production binaries, in an empty directory:

- The CMS wrote a default `config.json`, created the database, answered 200 on `/`, `/register`, `/forgot`, `/logout`,
  `/disclaimer` and `/privacy` with the default name, took a registration, and logged no error.
- The installer then continued on that directory: `/site` set the hotel's name and start credits, and `/admin` created the
  administrator beside the habbo already there.
- A second `POST /site` and `POST /admin` redirected to the status page and changed nothing.
- The restarted CMS read the new name, and both habbos signed in.

`gofmt`, `go vet` and `go test -race` pass in `packages/installer`, with a new test of an administrator on a database that
already has users.

# Notes

- Nothing needed fixing: this was already true since [p0-17](/tasks/p0-17-package-level-settings-and-auth.md), but the
  installer's half had never been run.
- Housekeeping does not exist yet, so its half belongs to [HK-A](/phases/hk-a-housekeeping-core.md).
