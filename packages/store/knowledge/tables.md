---
type: Reference
title: Tables
description: Every table of packages/store/schema, grouped by the entity it holds, with what it holds and its schema file, to find a table before adding one.
tags: [store, sqlite, schema]
---

Each table is in `packages/store/schema/<file>`. The schema file has the columns, keys and checks. `make check` in
`packages/store` verifies that this list and the schema files name the same tables.

# Users

A user is the person behind an account, who owns one or more habbos.

| Table | Holds | Schema file |
| --- | --- | --- |
| users | One row per user: email, birth date, newsletter opt-in, registration IP | users.schema.sql |

# Habbos

A habbo is one avatar of a user.

| Table | Holds | Schema file |
| --- | --- | --- |
| avatars | One row per habbo: name, figure, gender, motto, archive time | avatars.schema.sql |
| avatar_badges | The badges a habbo owns, each worn in slot 1 to 5, or 0 when not worn | avatars.schema.sql |
| avatar_game_data | What the game server saves of a habbo: last time online, machine id, sound setting | avatars.schema.sql |
| ignored_habbos | The habbos whose chat a habbo hides | rooms.schema.sql |

# Wardrobe outfits

A wardrobe outfit is a look a habbo keeps in a numbered slot of the club wardrobe.

| Table | Holds | Schema file |
| --- | --- | --- |
| wardrobe_outfits | One figure and gender per habbo and slot | avatars.schema.sql |

# Referrals

A referral records that a habbo's referral link brought in a new user.

| Table | Holds | Schema file |
| --- | --- | --- |
| referrals | The habbo that referred each new user, and when the reward was paid | referrals.schema.sql |

# Credentials

A credential is a user's password hash and the tokens that reset it.

| Table | Holds | Schema file |
| --- | --- | --- |
| credentials | One argon2id password hash per user, as a PHC string | auth.schema.sql |
| password_resets | Single-use, expiring reset tokens, as SHA-256 digests of the emailed token | auth.schema.sql |

# Sessions

A session is a signed-in browser of a user with its active habbo.

| Table | Holds | Schema file |
| --- | --- | --- |
| sessions | Signed-in browsers, keyed by the SHA-256 digest of the cookie token, with the active habbo | auth.schema.sql |
| login_attempts | Every login attempt with its user, habbo and IP, for throttling and IP history | auth.schema.sql |
| sso_tickets | Game login tickets the CMS makes for a session's habbo and the game server spends once | auth.schema.sql |

# Access groups

An access group is an admin-defined group of users that grants attributes and the game's fuses.

| Table | Holds | Schema file |
| --- | --- | --- |
| access_groups | Named groups with a level and a staff page flag | access.schema.sql |
| access_group_attributes | The attributes and fuses each group grants | access.schema.sql |
| access_group_members | The users of each group, with the habbo the staff page shows | access.schema.sql |
| user_attributes | Attributes given to a user directly, on top of those of their groups | access.schema.sql |

# Settings

A setting is one runtime value declared in the list of `packages/settings`.

| Table | Holds | Schema file |
| --- | --- | --- |
| settings | One JSON literal per declared setting key path | settings.schema.sql |

# Profiles

A profile is a habbo's web presence, which anchors its home page and its tags.

| Table | Holds | Schema file |
| --- | --- | --- |
| profiles | One profile per habbo | profiles.schema.sql |
| profile_tags | The tags a habbo put on its profile | profiles.schema.sql |

# Homes

A home is a decorated page owned by a profile or a group.

| Table | Holds | Schema file |
| --- | --- | --- |
| homes | One home per profile or group, with its background | homes.schema.sql |
| home_items | Stickers, notes and widgets placed on a home, with position, stacking order and skin | homes.schema.sql |

# Home store

The home store sells stickers, note packs and backgrounds for homes.

| Table | Holds | Schema file |
| --- | --- | --- |
| home_store_categories | The store's categories, ordered by position, some for staff only | home-store.schema.sql |
| home_store_items | The items for sale, with kind, asset, price, quantity and an enabled flag | home-store.schema.sql |
| home_inventories | The bought items a user has not placed yet, with their quantity | home-store.schema.sql |

# Groups

A group is a community a habbo buys, with members, admins and pending requests.

| Table | Holds | Schema file |
| --- | --- | --- |
| groups | One row per group: owner, name, badge, access mode | groups.schema.sql |
| group_members | Members, admins and pending requests, with each habbo's favourite group | groups.schema.sql |

# Forum threads

A forum thread is a thread of the site-wide discussion board.

| Table | Holds | Schema file |
| --- | --- | --- |
| forum_threads | Threads with title, sticky and locked flags and a view counter | forums.schema.sql |
| forum_posts | The BBCode posts of a thread, with their last edit | forums.schema.sql |

# News articles

A news article is written by staff and shown on the news pages.

| Table | Holds | Schema file |
| --- | --- | --- |
| news_articles | Articles with category, top-story image, summary and BBCode body | news.schema.sql |

# Images

An image is a picture staff upload, kept in the database.

| Table | Holds | Schema file |
| --- | --- | --- |
| images | Uploaded pictures with format, bytes and size | images.schema.sql |

# Banners

A banner is a promotion in the side column of the Me and community pages.

| Table | Holds | Schema file |
| --- | --- | --- |
| banners | Banners with image, link, position and an enabled flag | site.schema.sql |

# Wallets

A wallet is a user's credits, tickets and film, shared by all their habbos.

| Table | Holds | Schema file |
| --- | --- | --- |
| wallets | One row per user: credits, tickets and film, never below zero | economy.schema.sql |
| wallet_transactions | The credit ledger: one signed row per change of a user's credits | economy.schema.sql |

# Vouchers

A voucher is a code that staff create and a habbo redeems once for credits or one furni.

| Table | Holds | Schema file |
| --- | --- | --- |
| vouchers | Codes worth credits or one furni, kept after redemption | economy.schema.sql |

# Club subscriptions

A club subscription is a paid Habbo Club period of a user.

| Table | Holds | Schema file |
| --- | --- | --- |
| club_subscriptions | The club periods of a user, with start and end | club.schema.sql |

# Bans

A ban keeps out a user with all their habbos, an IP, or both.

| Table | Holds | Schema file |
| --- | --- | --- |
| bans | Bans with target, reason, expiry and lifting | moderation.schema.sql |

# Alerts

An alert is a staff message shown in a habbo's Me feed until dismissed.

| Table | Holds | Schema file |
| --- | --- | --- |
| alerts | Staff messages to a habbo, with when it dismissed them | moderation.schema.sql |

# Help tickets

A help ticket is a help request from a habbo or a report of a forum post.

| Table | Holds | Schema file |
| --- | --- | --- |
| help_tickets | Requests and reports, picked up and closed by staff | moderation.schema.sql |

# Staff logs

A staff log is the audit trail of every staff action.

| Table | Holds | Schema file |
| --- | --- | --- |
| staff_logs | One row per staff action: actor, target, action, detail and IP | moderation.schema.sql |

# Updates

An update is a change a release brings to the database as an update file.

| Table | Holds | Schema file |
| --- | --- | --- |
| migrations | One row per applied update: version, name and time | migrations.schema.sql |

# API secret

The API secret is what a program run apart sends the game's `/api/` to be heard.

| Table | Holds | Schema file |
| --- | --- | --- |
| api_secret | One row: the secret, random hex an update generates once per hotel | api.schema.sql |

# Room categories

A room category is a node of the navigator's tree, holding public rooms or habbo rooms.

| Table | Holds | Schema file |
| --- | --- | --- |
| room_categories | Categories with parent, kind, name and the level a habbo needs | navigator.schema.sql |

# Room models

A room model is a room's floor plan.

| Table | Holds | Schema file |
| --- | --- | --- |
| room_models | Door, heightmap, a public room's furni, and which models habbos build on or need the club | navigator.schema.sql |

# Public rooms

A public room is one of the hotel's own rooms, which the client draws from its casts.

| Table | Holds | Schema file |
| --- | --- | --- |
| public_rooms | Public rooms with category, model, unit, casts and most visitors | navigator.schema.sql |

# Rooms

A room is a habbo's room, created with the room-o-matic.

| Table | Holds | Schema file |
| --- | --- | --- |
| rooms | Creator, owner, category, model, name, door, password hash, settings and decorations | navigator.schema.sql |
| room_rights | The habbos with rights in a room | rooms.schema.sql |
| room_bans | The habbos kept out of a room, until a time | rooms.schema.sql |
| room_votes | Each habbo's vote on a room, 1 or -1 | rooms.schema.sql |

# Favourite rooms

A favourite room is a public room or a habbo room that a habbo keeps among its favourites.

| Table | Holds | Schema file |
| --- | --- | --- |
| favourite_rooms | A habbo's favourites, each a public room or a habbo room | navigator.schema.sql |

# Chat messages

A chat message is a line a habbo said, whispered or shouted in a room.

| Table | Holds | Schema file |
| --- | --- | --- |
| chat_messages | Lines said in rooms, kept for moderators | rooms.schema.sql |

# Furni definitions

A furni definition is what a kind of furni is: its sprite, where it stands, its size and what may be done with it.

| Table | Holds | Schema file |
| --- | --- | --- |
| furni_definitions | Sprite, kind, size, height, colours, wall data, door, tradeable and recyclable flags | catalogue.schema.sql |

# Catalogue pages

A catalogue page is a page of the in-game catalogue, with its layout, images and texts.

| Table | Holds | Schema file |
| --- | --- | --- |
| catalogue_pages | Pages with position, code, layout, images, texts and who sees them | catalogue.schema.sql |
| catalogue_page_texts | The numbered texts a page's layout places | catalogue.schema.sql |

# Catalogue items

A catalogue item is what a catalogue page sells for credits: one furni or, as a deal, several.

| Table | Holds | Schema file |
| --- | --- | --- |
| catalogue_items | Items with page, position, code, name and price | catalogue.schema.sql |
| catalogue_item_furnis | The furni definitions an item gives, with their amount | catalogue.schema.sql |

# Furni

A furni is a piece a user owns: in a habbo's hand, in a room, in a present, or in the user's shared inventory.

| Table | Holds | Schema file |
| --- | --- | --- |
| furnis | Each piece: definition, user, hand or room with its place, state, box, teleport partner, recycler | furni.schema.sql |
| furni_notes | The text of each post-it that was written on | furni.schema.sql |

# Recycler

The recycler gives one furni for many, after a time.

| Table | Holds | Schema file |
| --- | --- | --- |
| recycler_rewards | The furni definition given for each number of pieces recycled at once | recycler.schema.sql |
| recyclings | A habbo's running recycling, one at a time: start and reward | recycler.schema.sql |

# Client files

The client's external variables and texts, which the CMS writes out as `external_variables.txt` and
`external_texts.txt`.

| Table | Holds | Schema file |
| --- | --- | --- |
| dcr_variables | One key and value per line of `external_variables.txt`, in the file's order | dcr.schema.sql |
| dcr_texts | One key and value per line of `external_texts.txt`, in the file's order | dcr.schema.sql |

# Notes

- `sso_tickets.id` holds the ticket itself as text, as update `0008-sso-tickets-as-text.sql` made it.
- Open `TEXT` columns take these values, checked in Go:
  - `groups.access`: `open`, `moderated`, `closed`, `unlimited`.
  - `group_members.role`: `member`, `admin`.
  - `home_items.kind`: `sticker`, `note`, `widget`. `home_store_items.kind`: `sticker`, `note`, `background`.
  - `wallet_transactions.reason`: `registration`, `referral`, `store`, `group`, `club`, `voucher`, `staff`,
    `catalogue`, `exchange`.
  - `access_group_attributes.attribute` and `user_attributes.attribute`: the catalogues of `packages/auth`.
  - `settings.key`: the key paths of the list of `packages/settings`.
- A user's level is the highest `level` of their access groups, and each of their habbos has it; `min_level` columns
  compare with it.
- A new user and its first habbo are written in one transaction.
- A new group and its owner's `admin` row in `group_members` are written in one transaction.
- A new forum thread and its opening post are written in one transaction. Post counts and the last post come from
  `forum_posts`.
- Every change of `wallets.credits` writes its `wallet_transactions` row in the same transaction. A debit is one
  `UPDATE … SET credits = credits + ?` guarded by `credits + ? >= 0`, with `:execrows`.
- A voucher is redeemed by one statement that claims an unused code.
- A new club period starts at the later of now and the end of the user's last period.
- `news_articles.image_id` names the uploaded image `image_url` shows, set in the same statement.
- A furni in no hand, no room and no box is in its user's shared inventory. A hand lists its furni by id.
- The furni a recycling took are the rows of `furnis` whose `recycler_avatar_id` is the habbo.
- A `settings` row equal to the declared default is deleted.
- `staff_logs` rows stay as written.
- Archived habbos (`avatars.archived_at`) keep their rows; lists and counts of members and requests leave them out.
- Several `furni_definitions` share one sprite.
- `room_categories.id` starts at 1: the client reads 0 as the end of its list.
- Updates seed `home_store_*`, `access_groups`, `access_group_attributes`, `room_categories`, `room_models`,
  `public_rooms`, the catalogue tables and `recycler_rewards` with Holo's rows and fixed ids.
