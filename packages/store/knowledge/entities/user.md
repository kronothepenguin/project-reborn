---
type: Entity
title: User
description: The person who owns habbos, signs in with a password and receives access attributes.
tags: [store, entity, identity]
timestamp: 2026-10-27T21:17:19+00:00
---

# Definition

A user is the person behind one or more habbos. The password, the sessions and the access attributes belong to the
user; everything seen in the hotel belongs to a habbo.

# Invariants

- Email is unique, ignoring case.
- Exactly one credential row per user.
- Every user owns at least one habbo: the first is created in the same transaction as the user.

# Lifecycle

- Created at registration, or by the installer for the first administrator, together with the credential and the
  first habbo.
- Email and newsletter opt-in change from the account settings.
- Deleting a user deletes their credential, habbos, sessions, login attempts, password resets, access memberships
  and referral row.

# Vocabularies

None.

# Relations

- Owns [habbos](/entities/habbo.md).
- Has a [credential](/entities/credential.md) and [sessions](/entities/session.md).
- Belongs to [access groups](/entities/access-group.md).
- May have been brought in by a [referral](/entities/referral.md).
- Can be the target of a [ban](/entities/ban.md); as staff, appears in the [staff log](/entities/staff-log.md).

# Tables

- [users](/tables/users.md)
