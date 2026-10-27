---
type: Entity
title: Setting
description: A runtime override of one config value, edited from housekeeping and merged over config.json.
tags: [store, entity, settings]
timestamp: 2026-10-27T21:17:19+00:00
---

# Definition

`packages/config` declares every key with its type, default and validator; a setting row replaces the value of one
key at runtime. `packages/virtual` merges the rows over the config values.

# Invariants

- `key` is a declared config key path; rows with an undeclared key are ignored.
- `value` is a JSON literal that decodes into the key's type and passes its validator; an invalid row is ignored.
- A row equal to the config value is deleted instead of stored.
- Startup-only keys (`store.path`, `cms.port`, `housekeeping.port`) are never stored.

# Lifecycle

- Written by `virtual.Settings.Update` from the installer and from housekeeping.
- Deleting a row restores the config value.
- Read once at startup and again on `Reload`.

# Vocabularies

- `key`: the key paths declared in `packages/config` (`site.name`, `club.price1Month`, …).

# Relations

- Last changed by a [user](/entities/user.md).

# Tables

- [settings](/tables/settings.md)

# Queries

- [settings.query.sql](/queries/settings.md)
