# Entities

Domain entities represented by the store's tables: their meaning, invariants, lifecycle and relations.

## Identity

- [User](user.md) — The person who owns habbos, signs in with a password and receives access attributes.
- [Habbo](habbo.md) — An in-hotel identity owned by a user, with its name, look, motto, badges and wardrobe.
- [Referral](referral.md) — The record that a habbo's referral link brought in a new user, and whether the reward was paid.

## Authentication and access

- [Credential](credential.md) — A user's argon2id password hash and the single-use tokens that reset it.
- [Session](session.md) — A signed-in browser of a user with its active habbo, together with the login-attempt history and game-client tickets.
- [Access group](access-group.md) — An admin-defined group of users that grants attributes; code checks attributes, never group names.

## Settings

- [Setting](setting.md) — One runtime value declared in the packages/virtual catalogue, stored as a JSON literal and edited from the installer and housekeeping.

## Profiles and homes

- [Profile](profile.md) — A habbo's web presence, which anchors its home page and its tags.
- [Home](home.md) — A decorated home page owned by a profile or a group, with stickers, sticky notes, widgets and a background.
- [Home store](home-store.md) — The catalogue of stickers, note packs and backgrounds for homes, and each habbo's inventory of bought items.

## Community

- [Group](group.md) — A group bought by a habbo, with a badge, an access mode, members, admins, pending requests and a home.
- [Forum thread](forum-thread.md) — A thread of the site-wide discussion board with its BBCode posts.
- [News article](news-article.md) — A news article written by staff, shown on the news pages and the news promo.
- [Banner](banner.md) — A promotional banner shown in the side column of the Me and community pages.

## Economy

- [Wallet](wallet.md) — A habbo's credits, tickets and film, the ledger of every credit change, and the vouchers that add credits.
- [Club subscription](club-subscription.md) — A paid Habbo Club period of a habbo; club membership is a habbo property, not an access attribute.

## Moderation

- [Ban](ban.md) — A ban of a user (all their habbos), an IP or both, with reason, optional expiry and early lifting.
- [Alert](alert.md) — A staff message shown in a habbo's Me feed until the habbo dismisses it.
- [Help ticket](help-ticket.md) — A help request from a habbo or a report of a forum post, handled by staff in housekeeping.
- [Staff log](staff-log.md) — The audit trail of every staff action, with the acting user, the target user or habbo, and the IP.
