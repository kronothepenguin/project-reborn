---
type: Reference
title: Holo database and the new schema
description: Holo's tables, the problems found in them, Holo's settings, and the new normalized schema that replaces them.
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [store, holo]
---

# Holo tables

The CMS tables (`cms_*`) are created in `source/holo/install.php:249-470` and `upgrade.php`. The emulator tables
are not defined in the repository; their columns were inferred from the queries. All are MyISAM latin1, with no
foreign keys, no transactions and no secondary indexes.

| Holo table | Holds | New home |
| --- | --- | --- |
| `users` | login, contact, in-game identity, presence, rank | `users`, `credentials`, `avatars`, `wallets`, `login_attempts`, `sessions`, `access_*` |
| `users_badges` | badge per user, `iscurrent` | `avatar_badges` |
| `users_bans` | ban by user id or IP, string expiry | `bans` |
| `users_club` | club start (string), months left/expired | `club_subscriptions` |
| `cms_alerts` | staff messages shown on me.php | `alerts` |
| `cms_banners` | banners on me and community | `banners` |
| `cms_content` | key/value texts and toggles, no PK | `settings` |
| `cms_system` | single-row site settings, no PK | `settings` |
| `system_config` | emulator settings | deferred (game server) except the web keys |
| `cms_forum_threads`, `cms_forum_posts` | site-wide discussion board | `forum_threads`, `forum_posts` |
| `cms_help` | help tickets and post reports | `help_tickets` |
| `cms_homes_catalouge` [sic] | home store catalogue (303 seed rows) | `home_store_categories`, `home_store_items` |
| `cms_homes_inventory` | bought, unplaced items | `home_inventory` |
| `cms_homes_stickers` | every item on user and group homes (polymorphic) | `homes`, `home_items` |
| `cms_homes_group_linker` | "currently editing group X" per user, no PK | not stored: the edit target is the `home_id` in the URL |
| `cms_minimail` | defined, never written | not ported |
| `cms_news` | news with raw HTML | `news_articles` |
| `cms_tags` | user tags | `profile_tags` |
| `cms_transactions` | credit ledger (incomplete) | `wallet_transactions` |
| `cms_wardrobe` | 5 outfit slots, no PK | `wardrobe_outfits` |
| `groups_details`, `groups_memberships` | groups and members | `groups`, `group_members` |
| `vouchers` | credit or item vouchers, deleted on redeem | `vouchers` (credits only) |
| `system_stafflog` | staff audit log | `staff_logs` |
| `rooms`, `messenger_friendships`, `furniture`, `catalogue_items`, `system`, `system_chatlog`, `system_strings` | emulator data | deferred ([0013](/decisions/0013-defer-game-server-features.md)) |

# Users columns

| Holo column | Concern | New place |
| --- | --- | --- |
| `id` | key | `users.id` and `avatars.id` |
| `name` | login + display + foreign key by value | `avatars.name` (`NOCASE`, unique); references by id |
| `password` | md5(static salt) | `credentials.password_hash` (argon2id) |
| `email` | contact, not unique | `users.email` (unique) |
| `birth` | 'D-M-YYYY' string; also a security question | `users.born_on` (DATE) |
| `hbirth` | registration date string | `users.created_at`, `avatars.created_at` |
| `figure`, `sex`, `mission` | look, gender, motto | `avatars.figure`, `avatars.gender`, `avatars.motto` |
| `credits`, `tickets` | currencies | `wallets` |
| `rank` | role + Habbo Club (2) + title | access groups ([0014](/decisions/0014-attribute-based-access.md)) and `club_subscriptions` |
| `badge_status` | duplicate of the current badge | `avatar_badges.worn` |
| `ticket_sso` | reusable SSO ticket | `sso_tickets` (deferred API) |
| `lastvisit`, `online`, `ipaddress_last` | presence and audit | `sessions.last_seen_at`, `login_attempts` |
| `postcount` | denormalized forum count | counted from `forum_posts` |
| `noob` | onboarding flag | not ported (welcome page deferred) |

# Data problems fixed

- Dates as strings in mixed formats (`users.birth`, `hbirth`, `lastvisit`, `users_bans.date_expire`,
  `users_club.date_monthstarted`, `groups_details.created`, forum, help, transactions, stafflog); ban expiry
  parsing swapped day and month. → `DATETIME`/`DATE` ([0012](/decisions/0012-sqlite-native-types.md)).
- Numbers as strings (`cms_homes_inventory.amount` varchar(3), sticker coordinates varchar(6), transaction amounts
  varchar(10), wardrobe slots varchar(1), `vouchers.credits` varchar(255)). → INTEGER with CHECKs.
- Booleans as `'0'/'1'` strings and enums. → `BOOLEAN`.
- Magic numbers: rank 1–7, forum thread type 1–4 packing sticky and closed, group type 0–3, home item type 1–4 and
  widget subtypes, catalogue category ids as text. → named columns and TEXT vocabularies documented in the
  entity concepts.
- Sentinels: `groupid = -1`, `userid = -1`, `x/y/z = -1` for backgrounds, 'Noone', 'Never', `ST-Guest` tickets.
  → nullable foreign keys and dedicated columns.
- Polymorphism: `cms_homes_stickers` for every item kind on user and group homes; `vouchers.credits` holding a
  credit amount or an item code; `cms_help` holding both tickets and post reports. → `homes` + `home_items`,
  credit-only vouchers, `help_tickets.forum_post_id`.
- Denormalized data: `users.postcount`, thread reply counts and last post, duplicated badge state, rank 2 for the
  club, group owner stored twice, credits changed by read-then-SET (lost updates). → computed by queries, atomic
  `UPDATE … SET credits = credits + ?` guarded by `>= 0`, ledger rows in the same transaction.
- References by name (`rooms.owner`, forum authors, `cms_news.author`, `cms_help.username`, chatlog). → ids.
- Missing keys and uniqueness (`cms_content`, `cms_system`, `cms_wardrobe`, `cms_homes_group_linker` had no PK; no
  unique name, email, badge, membership or tag). → primary keys, unique indexes, partial unique indexes for "one
  worn badge" and "one favourite group".
- Inconsistent names (`userid`/`ownerid`/`owner`/`author`, `iscurrent`/`is_current`, `num`/`id`, `mission`,
  `catalouge`, `recycle_minownertime` vs `recycler_minownertime`, `enable-smilies` vs `smilies-enabled`). →
  repository naming rules.
- Text stored HTML-escaped, staff HTML stored raw. → raw text escaped by `html/template`; news in BBCode.
- Secrets: md5 passwords, the password hash kept in the session, a remember-me cookie equal to
  `sha1("zomq" . hash)`, plaintext SSO tickets from `rand()`, database root credentials in `config.php`. → argon2id,
  hashed session tokens, no secrets in the repository.

# Holo settings

Every new key below is a setting declared in `packages/virtual`; `config.json` holds only startup keys
([0023](/decisions/0023-config-holds-startup-keys.md)).

| Holo source | Key | New setting key |
| --- | --- | --- |
| `cms_system` | `sitename`, `shortname` | `site.name`, `site.shortName` |
| `cms_system` | `site_closed` | `site.maintenance` |
| `cms_system` | `start_credits` | `registration.startCredits` |
| `cms_system` | `admin_notes` | `housekeeping.note` |
| `cms_system` | `enable_sso`, `ip`, `port`, `texts`, `variables`, `dcr`, `reload_url`, `localhost`, `loader` | deferred (client page) |
| `cms_system` | `language` | dropped (English only) |
| `config.php` | `$path`, `$reward`, `$sysadmin` | `site.url`, `referral.reward`, access groups |
| `cms_content` | `forum-enabled`, `allow-group-purchase`, `birthday-notifications`, `enable-flash-promo`, `mod_staff-enabled`, `smilies-enabled` | `features.forum`, `features.groupPurchase`, `features.birthdayNotifications`, `features.landingPromo`, `features.staffPage`, `features.smilies` |
| `cms_content` | `hc-maxmonths` | `club.maxMonths` |
| `cms_content` | `staff1/2`, `staff1/2-heading`, `staff1/2-color` | `staffPage.box1Body`, `box1Heading`, `box1Color`, `box2…` |
| `cms_content` | `credits1/2`, `credits1/2-heading` | `creditsPage.box1Body`, `box1Heading`, `box2…` |
| `cms_content` | `client-widescreen`, `allow-guests` | deferred / replaced by [0017](/decisions/0017-guest-read-access.md) |
| hard-coded | group price 20, max 3 owned, 10 memberships, 500 members, name 25, description 200 | `groups.*` |
| hard-coded | club 1/3/6 months = 20/50/80 credits, 31 days per month | `club.*` |
| hard-coded | 200 home items, 500-char notes, 20 tags, 5 wardrobe slots | `homes.*` |
| hard-coded | password 6–25, remember-me 100 days | `auth.*` |

# New schema

Rules: [0012](/decisions/0012-sqlite-native-types.md) types; references by id; a second reference to the same table,
or a non-owner role, gets a role prefix; `ON DELETE CASCADE` for owned data and `SET NULL` for authorship;
`CHECK` only for closed sets.

| Feature file | Table | Columns | Keys / indexes |
| --- | --- | --- | --- |
| `users` | `users` | id, email `NOCASE`, born_on DATE, newsletter BOOLEAN, created_ip, created_at, updated_at | `idx_users_email` UNIQUE, `idx_users_created_ip_created_at` |
| `auth` | `credentials` | user_id PK→users, password_hash, updated_at | |
| | `sessions` | id TEXT PK (token digest), user_id, avatar_id (active habbo), remember BOOLEAN, ip, user_agent, created_at, last_seen_at, expires_at | `idx_sessions_user_id`, `idx_sessions_avatar_id`, `idx_sessions_expires_at` |
| | `login_attempts` | id, user_id NULL, avatar_id NULL, ip, succeeded BOOLEAN, created_at | `(ip, created_at)`, `(user_id, created_at)`, `(avatar_id, created_at)` |
| | `password_resets` | id TEXT PK (digest), user_id, created_at, expires_at | `idx_password_resets_user_id` |
| | `sso_tickets` | id TEXT PK (digest), avatar_id, ip, created_at, expires_at | `idx_sso_tickets_avatar_id` |
| `avatars` | `avatars` | id, user_id, name `NOCASE`, figure, gender 'M'/'F', motto, created_at, updated_at | `idx_avatars_name` UNIQUE, `idx_avatars_user_id` |
| | `avatar_badges` | avatar_id, code, worn BOOLEAN, granted_at | PK (avatar_id, code); UNIQUE (avatar_id) WHERE worn |
| | `wardrobe_outfits` | avatar_id, slot ≥ 1, figure, gender, updated_at | PK (avatar_id, slot) |
| `access` | `access_groups` | id, name `NOCASE`, description, staff_listed BOOLEAN, created_at, updated_at | `idx_access_groups_name` UNIQUE |
| | `access_group_attributes` | access_group_id, attribute | PK (access_group_id, attribute) |
| | `access_group_members` | access_group_id, user_id, display_avatar_id NULL, granted_at, granted_by_user_id | PK (access_group_id, user_id), `idx_access_group_members_user_id` |
| `settings` | `settings` | key TEXT PK (setting key path), value TEXT (JSON literal), updated_at, updated_by_user_id | |
| `referrals` | `referrals` | referred_user_id PK→users, referrer_avatar_id NULL, created_at, rewarded_at NULL | `idx_referrals_referrer_avatar_id` |
| `profiles` | `profiles` | id, avatar_id UNIQUE, created_at, updated_at | |
| | `profile_tags` | profile_id, tag, created_at | PK (profile_id, tag), `idx_profile_tags_tag` |
| `homes` | `homes` | id, profile_id UNIQUE NULL, group_id UNIQUE NULL, background_home_store_item_id NULL, updated_at; CHECK exactly one owner | |
| | `home_items` | id, home_id, kind (sticker/note/widget), home_store_item_id NULL, widget NULL, skin, body, x, y, z, created_by_avatar_id, created_at, updated_at | `idx_home_items_home_id` |
| `home-store` | `home_store_categories` | id, name, staff_only BOOLEAN, position | |
| | `home_store_items` | id, home_store_category_id, kind (sticker/note/background), asset, name, price ≥ 0, quantity ≥ 1, enabled BOOLEAN | `idx_home_store_items_home_store_category_id` |
| | `home_inventory` | avatar_id, home_store_item_id, quantity ≥ 0 | PK (avatar_id, home_store_item_id) |
| `groups` | `groups` | id, avatar_id (owner), name `NOCASE`, description, badge, access (open/moderated/closed), created_at, updated_at | `idx_groups_name` UNIQUE, `idx_groups_avatar_id` |
| | `group_members` | group_id, avatar_id, role (member/admin), favourite BOOLEAN, requested_at, joined_at NULL (= pending) | PK (group_id, avatar_id), `idx_group_members_avatar_id`, UNIQUE (avatar_id) WHERE favourite |
| `economy` | `wallets` | avatar_id PK, credits ≥ 0, tickets ≥ 0, film ≥ 0, updated_at | |
| | `wallet_transactions` | id, avatar_id, credits (signed), reason, detail, created_at | `(avatar_id, created_at)` |
| | `vouchers` | code TEXT `NOCASE` PK, credits > 0, created_by_user_id, created_at, redeemed_by_avatar_id, redeemed_at | |
| `club` | `club_subscriptions` | id, avatar_id, starts_at, ends_at (CHECK > starts_at), created_at | `(avatar_id, ends_at)` |
| `forums` | `forum_threads` | id, avatar_id, title, sticky BOOLEAN, locked BOOLEAN, views, created_at | `idx_forum_threads_created_at` |
| | `forum_posts` | id, forum_thread_id, avatar_id, body (BBCode), created_at, edited_at, edited_by_avatar_id | `(forum_thread_id, created_at)`, `idx_forum_posts_avatar_id` |
| `news` | `news_articles` | id, avatar_id, title, category, image_url, summary, body (BBCode), published_at, created_at, updated_at | `idx_news_articles_published_at` |
| `moderation` | `bans` | id, user_id NULL, ip NULL, reason, issued_by_user_id, created_at, expires_at NULL (permanent), lifted_at, lifted_by_user_id; CHECK user or ip | `idx_bans_user_id`, `idx_bans_ip` |
| | `alerts` | id, avatar_id, sender_user_id, message, created_at, dismissed_at | `(avatar_id, dismissed_at)` |
| | `help_tickets` | id, avatar_id, forum_post_id NULL, subject, message, ip, created_at, picked_up_by_user_id, picked_up_at, closed_at | `idx_help_tickets_closed_at` |
| | `staff_logs` | id, user_id, target_user_id NULL, target_avatar_id NULL, action, detail, ip, created_at | `idx_staff_logs_created_at`, `idx_staff_logs_target_user_id`, `idx_staff_logs_target_avatar_id` |
| `site` | `banners` | id, title, image_url, link_url, enabled BOOLEAN, position, created_at, updated_at | |

Invariant: a group's owner also has an `admin` row in `group_members`, written in the same transaction as the group.
