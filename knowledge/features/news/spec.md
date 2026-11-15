---
type: Spec
title: News
description: Staff write news articles in housekeeping in BBCode, with a top-story picture, and anyone reads them on the site.
status: done
projects: [packages/cms, packages/housekeeping, packages/store, packages/components]
---

# What

Staff write news in housekeeping, each article with a category, a summary, a BBCode story and a top-story picture.
The picture is one of Holo's five local images, an address, or an upload cut in the browser. The site shows the
archive, each category, each article and the headlines. Housekeeping lists the uploaded pictures and deletes the
unused ones.

# Behaviours

## Reading

- Anyone opens the news archive, a category listing, an article, and housekeeping's Compose News Item, its list of
  articles, an article's edit form and Uploaded Images: Holo's title, headings, labels and columns show, with the tab or
  menu place marked.
- Anyone opens `/news`: the archive lists every article, newest first, with its date (decision holo-port/0017).
- The headlines column lists the 10 newest articles and a link to the archive.
- Anyone opens a category: it says what it lists and shows its last 25 articles; a name with `&` finds them too.
- Anyone opens an article: its heading, its date as `YYYY-MM-DD` and its category show.
- An article's summary keeps its line breaks and shows its text as typed.
- An article's body shows its BBCode, links included, with no smilies and no HTML (decision holo-port/0020).
- An article shows its author, the active habbo of the staff member who wrote it, whose icon opens its home.
- Anyone opens an article without an author: it shows no author.
- An unknown article shows the archive with status 404.
- A new hotel has no news: Holo's empty texts say so (decision holo-port/0075).

## Writing in housekeeping

- Staff open the news: the articles show newest first, with title, summary, date and author.
- Staff with `housekeeping.news` compose an article: Holo's form, labels, help and categories show, with the club of
  the site.
- Staff write the story: the BBCode editor shows it as the site will, with no smilies (decision holo-port/0092).
- Staff format a selection with the toolbar: the story holds that BBCode, and an untouched story keeps its BBCode.
- Without JavaScript the story is a plain field.
- Staff save, edit or delete an article: Holo's answer shows, and the change appears on the site.
- An edit keeps the author and the date, and the category it had.
- The edit form links to the article on the site.
- An article that is gone answers Holo's message with 404.
- Each change writes a staff log row with who made it.
- Staff without `housekeeping.news` open the news: Access Denied.

## Pictures

- The picker offers Holo's five local top-story images, `top_story_news.png` first, or an http(s) address
  (decision holo-port/0074).
- Staff type, pick or upload a top-story picture: the preview follows the field, and a thumbnail in Uploaded fills the
  field and the preview.
- Staff upload a picture: the editor cuts it to fill the 300x187 frame or fits it whole, previews it, and sends a PNG
  (decision holo-port/0074).
- Staff drag or zoom a picture in Cut: it follows the drag up to the picture's edge, and zoom keeps the middle of the
  frame.
- Staff upload a picture: every article stays as it is until one is saved with the picture.
- A GIF of exactly 300x187 goes up as it is, with its animation.
- An upload over 2 MB, or a GIF over 500 frames, is refused (decision holo-port/0078).
- A file that is no picture is refused with the reason.
- A bad picture answers 422, and the form keeps what was typed.
- The CMS serves an uploaded picture as it was previewed.
- `Uploaded` offers every uploaded picture again, newest first (decision holo-port/0079).
- Staff open Uploaded with no picture uploaded: it says so.
- Staff save an article with an uploaded picture as its top story: the article links the picture, and another address
  unlinks it.
- Staff save an article whose picture was deleted meanwhile: it is refused with what was typed, and nothing changes.

## Uploaded Images

- Staff open Uploaded Images: the pictures show newest first with format, size, uploader and articles, ten a page
  (decision holo-port/0080).
- Newer and Older turn the pages in the browser; the address keeps the page through a delete, a reload and Back.
- Staff open Uploaded Images at a page past the last: the last page shows, and a page that is no number shows the first.
- Staff open Uploaded Images without JavaScript: every picture is listed.
- Staff click an article named in Uploaded Images: its edit form opens.
- Staff delete a picture an article uses: the answer is 422 and names the article (decision holo-port/0079).
- Staff delete an unused picture: it goes, and the CMS stops serving it.
