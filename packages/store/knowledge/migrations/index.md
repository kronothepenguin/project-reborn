# Updates

Concepts for the update files under `packages/store/migrations/`, applied in version order, each once. A new database gets
them all when `store.Open` creates it.

- [0001-baseline.sql](0001-baseline.md) — Creates every table and index of the schema files as they were before updates existed, so a database created then passes through it unchanged.
- [0002-home-store.sql](0002-home-store.md) — Writes Holo's home store, its 20 categories and 298 items with Holo's ids, keeping the rows already there.
- [0003-ranks.sql](0003-ranks.md) — Creates Holo's five staff ranks as access groups with their attributes, only on a hotel that has no access group yet.
- [0004-database-attribute.sql](0004-database-attribute.md) — Grants housekeeping.database to every group and every user that holds housekeeping.accessGroups.
- [0005-images.sql](0005-images.md) — Creates the images table for the pictures staff upload, such as the top stories of news.
- [0006-news-image-links.sql](0006-news-image-links.md) — Links each news article to the uploaded picture it shows, so that a picture in use cannot be deleted, and fills the link for the articles that show one.
- [0007-game-login-data.sql](0007-game-login-data.md) — Creates avatar_game_data, where the game server saves each habbo's last time online, the machine id of its last game login and its sound setting.
- [0008-sso-tickets-as-text.sql](0008-sso-tickets-as-text.md) — Makes sso_tickets keep each ticket as text with the CMS session that made it, so the client page can show one and the game server can spend it.
- [0009-holo-fuses.sql](0009-holo-fuses.md) — Gives every access group the game fuses Holo's ranks held up to the group's level, from fuse_use_club_dance at level 2 to fuse_see_flat_ids at level 7.
- [0010-navigator.sql](0010-navigator.md) — Creates the navigator's tables, and seeds Holo's English categories, its 12 public rooms that are not games and its 42 room models.
- [0011-room-life.sql](0011-room-life.md) — Creates room_rights, room_bans, room_votes, chat_messages and ignored_habbos, and grants housekeeping.chatLogs to every group and user that manages access.
- [0012-badge-slots.sql](0012-badge-slots.md) — Rebuilds avatar_badges with a slot 1 to 5 for each worn badge in place of worn, the badge a habbo wore taking slot 1.
- [0013-catalogue.sql](0013-catalogue.md) — Creates the furni definitions and the catalogue's tables, and seeds Holo's English catalogue: 67 pages, 1,256 furni and 1,275 items.
- [0014-furni.sql](0014-furni.md) — Creates furni, the pieces of furni habbos own, each in a hand, in a room or in its user's shared inventory.
- [0015-presents.sql](0015-presents.md) — Lets a furni wait inside a present by adding to furni the box that holds it.
- [0016-rollers.sql](0016-rollers.md) — Rebuilds furni_definitions with the kind roller, and gives it to the ten rollers of Holo's catalogue.
- [0017-room-decorations.sql](0017-room-decorations.md) — Adds to rooms the wallpaper, the floor and the landscape a habbo's room was decorated with.
- [0018-post-its.sql](0018-post-its.md) — Creates furni_notes, what a habbo wrote on a post-it.
- [0019-teleports.sql](0019-teleports.md) — Adds to furni the other teleport of a teleport's pair.
- [0020-recycler.sql](0020-recycler.md) — Creates recycler_rewards, with Holo's four rewards, and recyclings, and adds to furni the habbo whose recycler a piece waits in.
- [0021-item-vouchers.sql](0021-item-vouchers.md) — Rebuilds vouchers so that a voucher gives credits or one furni.
