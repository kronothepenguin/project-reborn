---
type: Plan
title: "News: how"
description: Housekeeping writes articles and uploads pictures into the store, and the CMS renders them with its BBCode renderer and serves the pictures.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | `/news`, `/news/{id}`, the headlines and the news promo; renders bodies with `internal/bbcode`; serves uploads at `/news/images/{file}`; the five top-story images |
| `packages/housekeeping` | `/housekeeping/news` with the image editor and its upload, and `/housekeeping/images` |
| `packages/store` | Articles, and the `images` table that articles link to |
| `packages/components` | The BBCode editor of the story |

# Decisions

- [News bodies in BBCode](/decisions/holo-port/0020-news-in-bbcode.md) — One renderer, `packages/cms/internal/bbcode`,
  serves news, notes and posts.
- [News images are local art, an address or an upload cut in the
  browser](/decisions/holo-port/0074-news-images.md) — The server keeps only a real 300x187 image, re-encoded, in the
  database.
- [A new hotel starts with no news and no banners](/decisions/holo-port/0075-no-news-or-banner-seeds.md) — No update
  writes news articles.
- [News image uploads stay within 2 MB and 500 frames](/decisions/holo-port/0078-news-upload-limits.md) — The frames
  are counted before they are decoded.
- [Uploaded images can be picked again, and only unused ones
  deleted](/decisions/holo-port/0079-uploaded-images-managed.md) — Articles link to their uploaded picture, so the
  database refuses to delete a picture in use.
- [Uploaded Images shows ten pictures a page, turned in the
  browser](/decisions/holo-port/0080-uploaded-images-in-pages.md) — The news editor's gallery stays one grid.
- [A WYSIWYG BBCode editor of our own wherever BBCode is
  written](/decisions/holo-port/0092-bbcode-editor.md) — The story is written in the shared BBCode editor.

# Notes

- Holo dated its news `Y-m-d`; the port shows the date in UTC.
- The summary goes through `bbcode.Lines`, Holo's `nl2br(htmlspecialchars())`.
- An article written without a habbo shows no author line.
- The category is kept as Holo kept it: any value is saved, and the edit form keeps one no longer offered, so saving
  never moves an article.
- A save that changes nothing writes nothing and logs nothing; the answer is still Holo's.
- The upload's body is the picture itself, and the answer is JSON: `{"path": ...}`, or `{"error": ...}` with 413 or 422.
- An upload is kept even if its article is never saved, until staff delete it in Uploaded Images.
- The article's link is `REFERENCES images(id)` with SQLite's default action. `ON DELETE RESTRICT` would report
  `SQLITE_CONSTRAINT_TRIGGER` (1811), which `store.IsForeignKey` (787) does not know.
- A delete tries the delete, and when an article's link refuses it, lists that picture's articles in the same
  transaction for the answer.
- The `Uploaded` thumbnails are 150x94, half the frame, and load from `site.url` only when the mode opens.
