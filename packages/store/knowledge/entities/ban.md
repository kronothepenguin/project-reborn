---
type: Entity
title: Ban
description: A ban of a user (all their habbos), an IP or both, with reason, optional expiry and early lifting.
tags: [store, entity, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

A ban stops a person from signing in. It targets the user, so every habbo of that user, an IP, or both.

# Invariants

- A ban has a user or an IP.
- A ban is active while `lifted_at` is NULL and `expires_at` is NULL or in the future.

# Lifecycle

- Issued from housekeeping with `housekeeping.bans`; issuing also ends every session of the user.
- Lifted early from housekeeping; expired bans stay as history.
- Deleting the user deletes their bans.

# Vocabularies

None.

# Relations

- Targets a [user](/entities/user.md); checked at every [session](/entities/session.md) sign-in.

# Tables

- [bans](/tables/bans.md)
