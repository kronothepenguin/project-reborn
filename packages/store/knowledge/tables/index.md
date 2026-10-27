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

- [settings](settings.md) — Runtime overrides of config values, one JSON literal per config key path.
