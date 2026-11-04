---
type: Phase
title: P4 Community
description: Community page, news, tags with the tag cloud and tag fight, the staff page and banners, with their housekeeping editors.
status: active
timestamp: 2026-11-04T01:27:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [p4, cms, housekeeping]
---

# Goal

Guests and habbos browse community content; staff write news and manage banners.

# Scope

| Holo source | Routes | Astro pages | Composed UI (⚡ = island) |
| --- | --- | --- | --- |
| `community.php`, `includes/news_headlines.php` | `GET /community` | `community.astro` | ⚡`community/random-habbos`, ⚡`news/news-promo` (latest 4, rotates every 10 s), `tags/tag-cloud`, `site/banners` |
| `news.php` | `GET /news` (`?category=`), `GET /news/{id}` | `news.astro`, `news/id.astro` | `news/archive`, `news/article` rendered with `packages/cms/internal/bbcode` ([0020](/decisions/0020-news-in-bbcode.md)) |
| `tags.php`, `tagfight.php`, `tagcloud.php` | `GET /tags` (`?tag=`), `POST /tags`, `POST /tags/fight` | `tags.astro` | `tags/tag-search`, `tags/search-results`, ⚡`tags/tag-fight` (`features.tagFight`); the cloud also goes on the landing and Me pages |
| `staff.php` | `GET /staff` | `staff.astro` | `staff/staff-list` ([0019](/decisions/0019-staff-page-display-habbo.md)), `staffPage.*` boxes, `features.staffPage` |
| `me.php` habblets | — | `me.astro` | ⚡`me/tags-habblet`, news promo, banners column |
| housekeeping `news_compose.php`, `news_manage.php` | `/housekeeping/news` (GET/POST), `GET /housekeeping/news/new`, `/housekeeping/news/{id}` (GET/POST), `POST /housekeeping/news/{id}/delete` | — | `housekeeping.news`; BBCode textarea plus a "view on site" link |
| housekeeping `banners.php` | `/housekeeping/banners` (GET/POST), `POST /housekeeping/banners/{id}`, `POST /housekeeping/banners/{id}/delete` | — | `housekeeping.banners` |
| — | `/housekeeping/images` (GET), `POST /housekeeping/images/{id}/delete` | — | `housekeeping.news`; the uploaded pictures, deleted only when unused ([0079](/decisions/0079-uploaded-images-managed.md)) |

- No P4 page of Holo paginates: the archive lists every article, a category its last 25, the headlines 10 and a tag
  search 20. The Pagination primitive moves to [P5](/phases/p5-groups-forum.md), for the forum.
- News images: Holo's five local top-story images, an address, or an upload cut, fitted and previewed in housekeeping and
  kept in the database ([0074](/decisions/0074-news-images.md)). Banners keep an address.
- Uploads stay within 2 MB and 500 frames ([0078](/decisions/0078-news-upload-limits.md)). The editor offers every uploaded
  picture again, articles link to theirs in the database, and housekeeping deletes only unused ones
  ([0079](/decisions/0079-uploaded-images-managed.md)).
- No news or banner seeds ([0075](/decisions/0075-no-news-or-banner-seeds.md)).
- The staff page is one list, as Holo's ([0076](/decisions/0076-one-staff-list.md)), and its two boxes are BBCode with a
  colour each, edited in new multi-line and choice fields ([0077](/decisions/0077-staff-boxes-in-bbcode.md)).
- Settled by the rules of earlier phases:
  - everything Holo printed raw is escaped, SQL is bound, and changes are POSTs that need a session;
  - Holo's bugs are not ported: banners can be added, `Events & Competitions` lists and edits, tag search matches the
    tag exactly instead of as a `LIKE` pattern, and the news promo leaves out empty items;
  - the online state shows offline, as the profile widget's does, until the game server
    ([0013](/decisions/0013-defer-game-server-features.md));
  - tagging yourself follows P3's rules: `homes.maxTags`, lower case, `^[a-z0-9]{2,20}$`;
  - `features.tagFight` stays, as the plan has it, though Holo had no switch for the tag fight;
  - news has no smilies, as in Holo, and shows its date as `YYYY-MM-DD`; its author is the active habbo of the staff
    member who wrote it;
  - news and banners write staff log rows, and their links join Holo's Content Management box;
  - recommended rooms wait for the game server, and group badges for P5.

# Exit criteria

- Guests read community, news, tags and staff; tag search, tag-yourself and tag fight work; news and banners
  written in housekeeping appear on the site.

# Tasks

- [p4-01 Edit long texts and choices in the settings](/tasks/p4-01-settings-kinds.md) — done
- [p4-02 Declare the staff page and tag fight settings](/tasks/p4-02-staff-settings.md) — done
- [p4-03 Store news, banners and images](/tasks/p4-03-store.md) — done
- [p4-04 Show the news](/tasks/p4-04-news-pages.md) — done
- [p4-05 Write news in housekeeping](/tasks/p4-05-housekeeping-news.md) — done
- [p4-06 Cut, fit and preview news images](/tasks/p4-06-image-editor.md) — done
- [p4-07 Manage banners in housekeeping](/tasks/p4-07-housekeeping-banners.md) — done
- [p4-08 Find habbos by tag and fight tags](/tasks/p4-08-tags-page.md) — done
- [p4-09 Show the community page](/tasks/p4-09-community-page.md) — done
- [p4-10 Show the staff page](/tasks/p4-10-staff-page.md) — todo
- [p4-11 Fill the Me page's habblets and the landing's tag cloud](/tasks/p4-11-me-habblets.md) — todo
- [p4-12 Verify P4](/tasks/p4-12-exit-check.md) — todo
- [p4-13 Escape habbo names in home links](/tasks/p4-13-home-links.md) — done
- [p4-14 Count the updates in the admin suite from the release](/tasks/p4-14-admin-suite-updates.md) — done
- [p4-15 Link articles to their uploaded images](/tasks/p4-15-link-article-images.md) — todo
- [p4-16 Pick an uploaded picture in the news editor](/tasks/p4-16-pick-uploaded-image.md) — todo
- [p4-17 List and delete uploaded images in housekeeping](/tasks/p4-17-uploaded-images-page.md) — todo

p4-05, p4-06 and p4-07 run on the feature branch `p4-housekeeping`, beside the CMS work on `main`
([0046](/decisions/0046-main-and-feature-branches.md)).
p4-15, p4-16 and p4-17 run on the feature branch `p4-images`, beside the CMS work on `main`.
