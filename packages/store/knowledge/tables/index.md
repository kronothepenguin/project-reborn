# Tables

Concepts for the tables declared under `packages/store/schema/`, one per table.

## Identity

- [users](users.md) — The person behind one or more habbos, with email, birth date, newsletter opt-in and registration IP.
- [avatars](avatars.md) — Habbos, the in-hotel identities owned by a user, with name, figure, gender and motto.
- [avatar_badges](avatar_badges.md) — Badges owned by a habbo, at most one of them worn.
- [wardrobe_outfits](wardrobe_outfits.md) — Outfits a habbo saved in numbered wardrobe slots.
- [referrals](referrals.md) — The habbo that referred each new user, and when the referral reward was paid.

## Authentication

- [credentials](credentials.md) — One argon2id password hash per user, stored as a PHC string.
- [sessions](sessions.md) — Signed-in browsers of a user with their active habbo, keyed by the digest of the cookie token.
- [login_attempts](login_attempts.md) — Every login attempt, successful or not, used for throttling and for the IP history of users and habbos.
- [password_resets](password_resets.md) — Single-use, expiring password-reset tokens, stored as digests of the emailed token.
- [sso_tickets](sso_tickets.md) — One-time login tickets handed to the game client for a habbo, stored as digests; their API waits for the game server.

## Access

- [access_groups](access_groups.md) — Admin-defined named groups that grant attributes to their members.
- [access_group_attributes](access_group_attributes.md) — The attributes each access group grants, one row per group and attribute.
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
- [home_inventory](home_inventory.md) — Bought home store items a habbo has not placed yet, with their remaining quantity.

## Community

- [groups](groups.md) — Groups created by habbos, with owner, badge code and access mode.
- [group_members](group_members.md) — Members, admins and pending membership requests of groups, with each habbo's favourite group.
- [forum_threads](forum_threads.md) — Threads of the site-wide discussion board, with sticky and locked flags and a view counter.
- [forum_posts](forum_posts.md) — BBCode posts of a discussion board thread, with their last edit.
- [news_articles](news_articles.md) — News articles written by staff, with category, top-story image, summary and BBCode body.
- [banners](banners.md) — Promotional banners with image, link, position and an enabled flag.

## Economy

- [wallets](wallets.md) — The credits, tickets and film of a habbo, which can never go negative.
- [wallet_transactions](wallet_transactions.md) — The credit ledger, with one signed row per change of a habbo's credits.
- [vouchers](vouchers.md) — Credit vouchers created by staff, matched ignoring case, and kept after redemption for audit.
- [club_subscriptions](club_subscriptions.md) — Paid Habbo Club periods of a habbo; the habbo is a member while a period covers the current time.

## Moderation

- [bans](bans.md) — Bans of a user, an IP or both, with reason, expiry and lifting.
- [alerts](alerts.md) — Staff messages shown in a habbo's feed until dismissed.
- [help_tickets](help_tickets.md) — Help requests from habbos and forum post reports, picked up and closed by staff.
- [staff_logs](staff_logs.md) — One row per staff action, with the acting user, the target and the IP.
