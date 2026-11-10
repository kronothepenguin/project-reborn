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
