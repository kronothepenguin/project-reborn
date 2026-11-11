# Entities

Domain entities represented by the store's tables: their meaning, invariants, lifecycle and relations.

## Identity

- [User](user.md) — The person who owns habbos, signs in with a password and receives access attributes.
- [Habbo](habbo.md) — An in-hotel identity owned by a user, with its name, look, motto, badges and wardrobe.
- [Wardrobe outfit](wardrobe-outfit.md) — A look a habbo keeps in a numbered slot of the club wardrobe, to dress in again from the account's looks page.
- [Referral](referral.md) — The record that a habbo's referral link brought in a new user, and whether the reward was paid.

## Authentication and access

- [Credential](credential.md) — A user's argon2id password hash and the single-use tokens that reset it.
- [Session](session.md) — A signed-in browser of a user with its active habbo, together with the login-attempt history and game-client tickets.
- [Access group](access-group.md) — An admin-defined group of users that grants attributes and the game's fuses; code checks them, never group names.

## Settings

- [Setting](setting.md) — One runtime value declared in the packages/virtual catalogue, stored as a JSON literal and edited from the installer and housekeeping.

## Profiles and homes

- [Profile](profile.md) — A habbo's web presence, which anchors its home page and its tags.
- [Home](home.md) — A decorated home page owned by a profile or a group, with stickers, sticky notes, widgets and a background.
- [Home store](home-store.md) — The catalogue of stickers, note packs and backgrounds for homes, and each user's inventory of bought items.

## Community

- [Group](group.md) — A group bought by a habbo, with a badge, an access mode, members, admins, pending requests and a home.
- [Forum thread](forum-thread.md) — A thread of the site-wide discussion board with its BBCode posts.
- [News article](news-article.md) — A news article written by staff, shown on the news pages and the news promo.
- [Image](image.md) — A picture staff upload, such as a news top story, kept in the database and served by the CMS at an address of its own.
- [Banner](banner.md) — A promotional banner shown in the side column of the Me and community pages.

## Economy

- [Wallet](wallet.md) — A user's credits, tickets and film, shared by all their habbos, and the ledger of every credit change.
- [Voucher](voucher.md) — A code worth credits that staff create in housekeeping and a habbo redeems once into the user's purse, kept as redeemed for audit.
- [Club subscription](club-subscription.md) — A paid Habbo Club period of a user; club membership covers all their habbos and is not an access attribute.

## Moderation

- [Ban](ban.md) — A ban of a user (all their habbos), an IP or both, with reason, optional expiry and early lifting.
- [Alert](alert.md) — A staff message shown in a habbo's Me feed until the habbo dismisses it.
- [Help ticket](help-ticket.md) — A help request from a habbo or a report of a forum post, handled by staff in housekeeping.
- [Staff log](staff-log.md) — The audit trail of every staff action, with the acting user, the target user or habbo, and the IP.

## Updates

- [Update](update.md) — A change to the database that a release brings as an update file, applied once, in version order, and recorded in migrations.
- [Room category](room-category.md) — A category of the navigator's tree, holding public rooms or habbo rooms, that a habbo's access group level may need to use.
- [Room model](room-model.md) — A room's floor plan: its door, heightmap and, for a public room, its furni; some are the models habbos build on, some need the club.
- [Public room](public-room.md) — One of the hotel's public rooms, which the client draws from its casts, in a category of public rooms.
- [Room](room.md) — A habbo's room, created with the room-o-matic, with its creator, owner, category, model, door and settings.
- [Favourite room](favourite-room.md) — A public room or a habbo room that a habbo keeps among its favourites, up to a limit.
- [Chat message](chat-message.md) — A line a habbo said, whispered or shouted in a room, kept for moderators for game.chatHistoryDays.

## Catalogue

- [Furni definition](furni-definition.md) — What a kind of furni is, apart from who sells it: its sprite, where it stands, its size and colours, and what may be done with it.
- [Catalogue page](catalogue-page.md) — A page of the catalogue with its layout, images and texts, shown to the habbos its level and the club allow, which sells catalogue items.
- [Catalogue item](catalogue-item.md) — Something a catalogue page sells for credits, which gives one piece of a furni or, as a deal, several.
