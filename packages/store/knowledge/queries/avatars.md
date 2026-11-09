---
type: SQL Query
title: avatars.query.sql
description: Habbo operations for creation, lookup by id or name, the habbos of a user and random habbos, their badges, a badge for every habbo of a user, their wardrobe outfits, and what the game server saves of a habbo at login and in play.
resource: packages/store/queries/avatars.query.sql
tags: [store, query, habbo]
timestamp: 2026-11-09T23:20:00+00:00
---

# Operations

## CreateAvatar

- Cardinality: `:one`
- Inputs: `user_id`, `name`, `figure`, `gender`, `motto`, `created_at`, `updated_at`
- Result: the created `Avatar` (`RETURNING *`); a conflict when the name exists, ignoring case
- Tables: `avatars`

## GetAvatar

- Cardinality: `:one`
- Inputs: `id`
- Result: `Avatar`
- Tables: `avatars`

## GetAvatarByName

- Cardinality: `:one`
- Inputs: `name` (matched ignoring case)
- Result: `Avatar`, archived ones too, because their names stay taken; not found for an unknown name
- Tables: `avatars`

## ArchiveAvatar

- Cardinality: `:execrows`
- Inputs: `archived_at`, `updated_at`, `id`, `user_id`
- Result: 1 when the habbo was the user's and not archived yet, 0 otherwise
- Tables: `avatars`

## RestoreAvatar

- Cardinality: `:execrows`
- Inputs: `id`, `updated_at`
- Result: 1 when the habbo was archived, 0 otherwise
- Tables: `avatars`

## ListUserAvatars

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the user's habbos, oldest first (`ORDER BY created_at, id`)
- Tables: `avatars`

## ListAllUserAvatars

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the user's habbos, archived ones too, oldest first, for staff
- Tables: `avatars`

## SearchHabbos

- Cardinality: `:many`
- Inputs: `query`, `private`, `row_limit`, `row_offset`
- Result: habbos with their owner's email, archived ones too, by name. A blank query matches every habbo, and otherwise
  part of a name or a whole id. With `private`, also part of an email, the address the user registered from, or one
  they signed in from.
- Tables: `avatars`, `users`, `login_attempts`

## CountHabbos

- Cardinality: `:one`
- Inputs: `query`, `private`
- Result: how many habbos [SearchHabbos](#searchhabbos) finds
- Tables: `avatars`, `users`, `login_attempts`

## CountAvatars

- Cardinality: `:one`
- Inputs: none
- Result: how many habbos exist, the header's registered users
- Tables: `avatars`

## UpdateAvatarLook

- Cardinality: `:exec`
- Inputs: `id`, `figure`, `gender`, `updated_at`
- Tables: `avatars`

## UpdateAvatarMotto

- Cardinality: `:exec`
- Inputs: `id`, `motto`, `updated_at`
- Tables: `avatars`

## ListRandomAvatars

- Cardinality: `:many`
- Inputs: `count`
- Result: up to `count` habbos in random order, for the landing promo
- Tables: `avatars`

## ListAvatarBadges

- Cardinality: `:many`
- Inputs: `avatar_id`
- Result: the habbo's badges, oldest first
- Tables: `avatar_badges`

## GetWornAvatarBadge

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the badge the habbo wears; not found when it wears none
- Tables: `avatar_badges`

## TakeOffAvatarBadge

- Cardinality: `:exec`
- Inputs: `avatar_id`
- Result: the habbo wears no badge, which must come before wearing another, because a habbo wears one
- Tables: `avatar_badges`

## GrantAvatarBadge

- Cardinality: `:execrows`
- Inputs: `avatar_id`, `code`, `granted_at`
- Result: 1 when the habbo got the badge, worn, and 0 when it already had it
- Tables: `avatar_badges`

## WearAvatarBadge

- Cardinality: `:exec`
- Inputs: `avatar_id`, `code`
- Tables: `avatar_badges`

## DeleteAvatarBadge

- Cardinality: `:execrows`
- Inputs: `avatar_id`, `code`
- Result: 1 when the habbo had the badge, 0 otherwise
- Tables: `avatar_badges`

## GrantBadgeToUserAvatars

- Cardinality: `:execrows`
- Inputs: `code`, `granted_at`, `user_id`
- Result: how many habbos got the badge. Every habbo of the user that lacks it gets it unworn, archived habbos too,
  since they are still the user's; a habbo that holds it keeps it as it is. A habbo wears one badge, so the habbo
  that buys club wears `HC1` with [TakeOffAvatarBadge](#takeoffavatarbadge) and
  [WearAvatarBadge](#wearavatarbadge) (0103).
- Tables: `avatar_badges`, `avatars`

## DeleteBadgeFromUserAvatars

- Cardinality: `:execrows`
- Inputs: `code`, `user_id`
- Result: how many habbos lost the badge; it leaves every habbo of the user, archived habbos too, and no other
  user's, as `HC1` does when the club ends (0103)
- Tables: `avatar_badges`, `avatars`

## ListWardrobeOutfits

- Cardinality: `:many`
- Inputs: `avatar_id`
- Result: the habbo's wardrobe outfits by slot (`ORDER BY slot`)
- Tables: `wardrobe_outfits`

## UpsertWardrobeOutfit

- Cardinality: `:exec`
- Inputs: `avatar_id`, `slot`, `figure`, `gender`, `updated_at`
- Result: the outfit in the habbo's slot, replacing the one there
- Tables: `wardrobe_outfits`

## GetAvatarGameData

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: what the game server saved of the habbo; none when it never logged in to the game
- Tables: `avatar_game_data`

## SetAvatarLastOnline

- Cardinality: `:exec`
- Inputs: `avatar_id`, `last_online_at`
- Result: the row made or updated
- Tables: `avatar_game_data`

## SetAvatarMachineID

- Cardinality: `:exec`
- Inputs: `avatar_id`, `machine_id`
- Result: the row made or updated
- Tables: `avatar_game_data`

## SetAvatarSoundEnabled

- Cardinality: `:exec`
- Inputs: `avatar_id`, `sound_enabled`
- Result: the row made or updated
- Tables: `avatar_game_data`

# Related

- Entities: [Habbo](/entities/habbo.md), [Wardrobe outfit](/entities/wardrobe-outfit.md).
