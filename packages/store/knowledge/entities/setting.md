---
type: Entity
title: Setting
description: One runtime value declared in the packages/virtual catalogue, stored as a JSON literal and edited from the installer and housekeeping.
tags: [store, entity, settings]
timestamp: 2026-10-27T23:04:08+00:00
---

# Definition

`packages/virtual` declares every setting with its key path, type, default and validator. A row stores a value that
differs from the declared default. `config.json` keys are never settings.

# Invariants

- `key` is a declared setting key path; a row with an undeclared key or a `config.json` key is ignored.
- `value` is a JSON literal of the declared type that passes the setting's validator and the rules between
  settings; an invalid row is ignored.
- A value equal to the declared default is deleted instead of stored.

# Lifecycle

- Written by `virtual.Settings.Set`, one key at a time, from the installer and from housekeeping.
- Deleting a row restores the declared default.
- Read when a program starts and again on `Reload`.

# Vocabularies

- `key`: the key paths declared in the `packages/virtual` catalogue (`site.name`, `cms.refresh`, …).

# Relations

- Last changed by a [user](/entities/user.md).

# Tables

- [settings](/tables/settings.md)

# Queries

- [settings.query.sql](/queries/settings.md)
