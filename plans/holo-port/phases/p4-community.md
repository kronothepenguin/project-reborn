---
type: Phase
title: P4 Community
description: Community page, news, tags with the tag cloud and tag fight, the staff page and banners, with their housekeeping editors.
status: planned
timestamp: 2026-10-27T20:48:19+00:00
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

- Primitives: Pagination.

# Exit criteria

- Guests read community, news, tags and staff; tag search, tag-yourself and tag fight work; news and banners
  written in housekeeping appear on the site.

# Tasks

Created when the phase starts.
