# Tables

Concepts for the tables declared under `packages/store/schema/`, one per table.

## Identity

- [users](users.md) — The person behind one or more habbos, with email, birth date, newsletter opt-in and registration IP.
- [avatars](avatars.md) — Habbos, the in-hotel identities owned by a user, with name, figure, gender and motto.
- [avatar_game_data](avatar_game_data.md) — What the game server saves of a habbo, its last time online, the machine id of its last game login and its sound setting; a habbo that never logged in to the game has no row.
- [avatar_badges](avatar_badges.md) — Badges owned by a habbo, each worn in a slot 1 to 5 or not worn.
- [wardrobe_outfits](wardrobe_outfits.md) — Outfits a habbo saved in numbered wardrobe slots.
- [referrals](referrals.md) — The habbo that referred each new user, and when the referral reward was paid.

## Authentication

- [credentials](credentials.md) — One argon2id password hash per user, stored as a PHC string.
- [sessions](sessions.md) — Signed-in browsers of a user with their active habbo, keyed by the digest of the cookie token.
- [login_attempts](login_attempts.md) — Every login attempt, successful or not, used for throttling and for the IP history of users and habbos.
- [password_resets](password_resets.md) — Single-use, expiring password-reset tokens, stored as digests of the emailed token.
- [sso_tickets](sso_tickets.md) — Login tickets the CMS makes for a session's active habbo and the game server spends once, kept as text and dying with the session.

## Access

- [access_groups](access_groups.md) — Admin-defined named groups that grant attributes to their members.
- [access_group_attributes](access_group_attributes.md) — The attributes each access group grants, one row per group and attribute.
- [user_attributes](user_attributes.md) — Attributes given to a user directly, on top of those of their access groups.
- [access_group_members](access_group_members.md) — Users who belong to an access group, with the habbo shown for them on the staff page.

## Settings

- [settings](settings.md) — Runtime settings, one JSON literal per declared setting key path.

## Profiles and homes

- [profiles](profiles.md) — One web profile per habbo, the anchor of its home page and tags.
- [profile_tags](profile_tags.md) — Tags a habbo put on its profile, used by tag search, the tag cloud and tag fight.
- [homes](homes.md) — A home page owned by exactly one profile or one group, with its background.
- [home_items](home_items.md) — Stickers, sticky notes and widgets placed on a home, with position, stacking order and skin.
- [home_store_categories](home_store_categories.md) — Categories of the home store, ordered by position, some reserved for staff.
- [home_store_items](home_store_items.md) — Stickers, note packs and backgrounds for sale in the home store.
- [home_inventory](home_inventory.md) — Bought home store items a user has not placed yet, with their remaining quantity.

## Community

- [groups](groups.md) — Groups created by habbos, with owner, badge code and access mode.
- [group_members](group_members.md) — Members, admins and pending membership requests of groups, with each habbo's favourite group.
- [forum_threads](forum_threads.md) — Threads of the site-wide discussion board, with sticky and locked flags and a view counter.
- [forum_posts](forum_posts.md) — BBCode posts of a discussion board thread, with their last edit.
- [news_articles](news_articles.md) — News articles written by staff, with category, top-story image, summary and BBCode body.
- [images](images.md) — Pictures staff upload, such as the top stories of news, with their format, bytes and size.
- [banners](banners.md) — Promotional banners with image, link, position and an enabled flag.

## Economy

- [wallets](wallets.md) — The credits, tickets and film of a user, which can never go negative.
- [wallet_transactions](wallet_transactions.md) — The credit ledger, with one signed row per change of a user's credits.
- [vouchers](vouchers.md) — Credit vouchers created by staff, matched ignoring case, and kept after redemption for audit.
- [club_subscriptions](club_subscriptions.md) — Paid Habbo Club periods of a user; the user is a member while a period covers the current time.

## Moderation

- [bans](bans.md) — Bans of a user, an IP or both, with reason, expiry and lifting.
- [alerts](alerts.md) — Staff messages shown in a habbo's feed until dismissed.
- [help_tickets](help_tickets.md) — Help requests from habbos and forum post reports, picked up and closed by staff.
- [staff_logs](staff_logs.md) — One row per staff action, with the acting user, the target and the IP.

## Updates

- [migrations](migrations.md) — One row per update file applied to the database, with its version, name and time.
- [room_categories](room_categories.md) — A category of the navigator, which holds either public rooms or habbo rooms, with the level a habbo needs to use it.
- [room_models](room_models.md) — A room's floor plan: its door, its heightmap and a public room's furni, with which models a habbo may build on and which need the club.
- [public_rooms](public_rooms.md) — A public room of the hotel: its unit, the casts the client loads for it, its model, its category and its most visitors.
- [rooms](rooms.md) — A habbo's room: its creator and owner, category, model, name, description, door, hashed password and settings.
- [favourite_rooms](favourite_rooms.md) — A habbo's favourite room: a public room or a habbo room, never both, each at most once.
- [room_rights](room_rights.md) — A habbo with rights in a room, which lets it move the room's furni and answer its doorbell.
- [room_bans](room_bans.md) — A habbo kept out of a room until a time, game.roomBanMinutes after the owner's ban.
- [room_votes](room_votes.md) — A habbo's vote on a room, 1 or -1, once; the room's rating is their sum.
- [chat_messages](chat_messages.md) — A line said in a public room or a habbo room, chat, whisper or shout, kept for moderators for game.chatHistoryDays.
- [ignored_habbos](ignored_habbos.md) — A habbo whose chat another habbo does not want to see.
