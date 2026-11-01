---
type: Task
title: Check that every program works on an empty database
description: Prove that the CMS works on a database it creates itself, and that the installer still works on that database afterwards.
status: todo
phase: p0
depends_on: []
packages: [packages/installer, packages/cms]
holo: []
timestamp: 2026-11-01T19:50:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
---

# Goal

Implement [0047](/decisions/0047-every-program-works-on-an-empty-database.md) for the programs that exist today.

# Steps

- [ ] Start the CMS in an empty directory: it creates `config.json` and the database with default values.
- [ ] Register on that database.
- [ ] Run the installer on the same directory: it changes the defaults and creates the administrator.
- [ ] After that the installer refuses to run again.
- [ ] Fix whatever fails, and add a test for it.
- [ ] Docs: the READMEs of `packages/cms` and `packages/installer`.

# Verification

On the production binaries, in an empty directory.

# Notes

- None yet.
