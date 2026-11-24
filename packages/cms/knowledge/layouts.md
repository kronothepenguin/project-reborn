---
type: Reference
title: Layouts
description: The site's two layouts and its pages at today's sizes, Holo's font on a 16px base, the community layout in flexbox for phones, tablets and wide screens, and where each of Holo's numbers went.
---

# The sizes

- `src/styles/global.css` sets Holo's font, `Verdana, Arial, Helvetica, sans-serif`, as the theme's `--font-sans`. Every
  page, island and shared part of the site takes it.
- The body text is Tailwind's 16px `text-base`, Holo's 11px.
- A width is Holo's times 1240/960, a padding, gap or height Holo's times 4/3, each on Tailwind's scale. Borders,
  corner radii and pictures keep Holo's sizes.

# Community layout

`src/layouts/community.astro`, Holo's `templates/community`, in flexbox, written new. Holo's CSS is the measure of
proportions alone: text is Holo's times 16/11, a box, a column and a gap keep Holo's proportion around that text, and
Holo's pictures keep their own size.

## The page

- The page is Holo's 930px at 16/11: at most 1352px (`max-w-338`), centred, and as wide as the screen below that,
  with `px-3.5` at its sides, `px-2` on a phone.
- The header, the sub-navigation and the footer share the page. On a wide screen (`lg`, 1024px) the header's left
  part, the sub-navigation and the footer end at 82% of it, where Holo's 762 of 930 ended, the second column's right
  edge; the users-online box stands over the third column, 2% after, 14% wide.
- A page passes `fluid` to the layout once it is reviewed beside Holo's: the Me and community pages. The others keep
  `w-310`, the 1240px page, inside the new header, until the user has judged the two.

## The header

| Part | Holo | Here |
| --- | --- | --- |
| Header | 104px: 16 above the logo, 42 of logo, 18 below, the 28px tabs | the logo's row `lg:h-27.5` (110px), the tabs 40px |
| Logo | 111x42 of `habbo.png` in a 190px strip | the same picture, in 25% of the left part |
| Top bar | left 190, 572 wide, 28 tall, white | the rest of the left part, `h-10 rounded-bl bg-white` |
| Help, Sign Out | 10px | `text-sm` |
| Habbo search | the field 171x27 | `h-9 w-62` (248px), its button as tall |
| Mini login | 300px, 420px while pointed at; fields 120px | `w-109`, `lg:hover:w-152`; fields `w-44` |
| Users online | 110px and 10px padding, 10px text, top 15 | 14% of the page, `p-3.5`, `text-sm`, `mt-5.5` |

- The middle part may run down beside the tabs, as Holo's mini login did: the logo's row is 110px tall on a wide
  screen, and the tabs follow it.
- A tablet (`md`, 768px) keeps one header row: the logo, the middle part as wide as is left, the users online.
- A phone shows the logo with the users online at its right, then the middle part as wide as the screen: the top
  bar, the hotel's status and the search, or the mini login without its labels. The tabs share the width, each by
  its text, and truncate.

## The columns

`src/components/site/columns.astro` holds Holo's three columns of the Me and community pages, 460, 310 and 160 with
8px after each box: the boxes of each column grow in Holo's 452 / 302 / 160, 12px apart (`gap-3`), and the boxes of
a column stand 10px apart (`gap-2.5`). Its default slot is the first column, `second` and `third` the others.

| Screen | Columns |
| --- | --- |
| Wide, `lg` and up | three, 452 / 302 / 160 |
| Tablet, `md` | two, 452 / 302, the third column under the second |
| Phone | one, each box as wide as the page |

## Pictures in the boxes

- The Me page's hotel view keeps its 450x143. Where the column is 640px or wider (a container query), the links,
  Change looks, the credits and the club, stand beside it in the box's olive, so the box wraps the picture; on a
  narrower column they run under the motto as Holo's. On a phone the view shows as much of itself as fits. The motto
  row is tall enough for the habbo's plate, which hangs 43px under the view.
- Random Habbos: the stripes fill the box 6px inside its frame, as Holo's 4px, and Holo's 435x230 grid of habbos
  stands at its own size in their middle; a phone cuts off its sides.
- A top story's picture, 187px tall, stands at the left of its box as Holo's, on Holo's olive; the stories share one
  cell of a grid, so the box is as tall as the longest story.
- `?pictures=smooth` and `?pictures=pixelated` on the community page grow its pictures by 16/11 (`zoom`, and
  `background-size` for the top story), for the user to compare; `styles/global.css` holds the rules, and
  `picture-grow` marks the pictures. The site shows its pictures at their own size.

## Other parts

| Part | Holo | Here |
| --- | --- | --- |
| Sub-navigation | 12px on 18px, padding `6px 0 0 20px` | `md:text-lg md:leading-7`, `pt-2 md:pl-7`; a phone `text-base`, items wrapping |
| Footer | 9px #777, links black, under the first two columns | `text-xs text-neutral-500`, `lg:w-[82%]`, centred |

## The main tabs

`header/main-tabs.astro` draws Holo's `tabs.png` in CSS, as `Button` draws its raised face: the tab's background is
the lower half, `::before` the upper half, inside a 2px outline with 4px top corners. A tab is 40px tall, Holo's 28,
with `pt-2 md:pr-6 md:pl-8`, 18px text (`md:text-lg`) and a 6px gap; on a phone `px-2` and `text-base`.

| Tab | Outline | Upper half | Lower half |
| --- | --- | --- | --- |
| Normal | `blue-900` | `sky-600` | `sky-700` |
| Hover | `blue-900` | `sky-400` | `sky-600` |
| Green | `lime-800` | `lime-500` | `lime-600` |
| Green hover | `lime-800` | `lime-400` | `lime-500` |
| Selected | `black` | white | white |

- The tabs stand 2px over the header's black line. An unselected tab's bottom border is black and lies on the line;
  the selected tab has none, so its white covers the line and opens into the sub-navigation.
- Housekeeping and "Register now!" are green; Housekeeping alone is bold, in `<b>`, as Holo's.

## The habbo search

`header/habbo-search.astro`: the field, then the search button, on one line, both 36px tall, 4px apart, flush with the
top bar's right edge. The field is 248px, Holo's 171.

# Signed-out layout

`src/layouts/signed-out.astro`, Holo's `templates/login` and `process.css`.

- The page is Holo's 766px box, `w-247` (988px), centred, 16px from the top, on `bg-sky-200`, with `px-7` inside.
- The counts stand on one line under the whole `habbo.png`, each right-aligned in Holo's landing widths, 395 and 310:
  `w-127.5` and `w-100`.
- The footer is Holo's: one line of links separated by ` | `, `text-xs text-neutral-500`, links black.

# Pages

Every page inside the layouts follows the same rules.

- A text takes the plan's table by Holo's own size: 11px `text-base`, 10px `text-sm`, 8px and 9px `text-xs`, 12px
  `text-lg`, 14px `text-xl`, 16px `text-2xl`, 18px `text-3xl`. A Tailwind size class written for the old design meant
  its own pixels: an old `text-xs` was Holo's 12px and is now `text-lg`.
- Inside the community layout, a page not yet reviewed beside Holo's keeps the 1240px page, so every width, padding
  and gap there is Holo's times 4/3, on a 2px grid. The columns span the page:

| Page | Holo | Here |
| --- | --- | --- |
| Staff | 460 / 310 / 160 | `w-153.5` / `w-103.5` / `w-53` |
| Credits, club, the pages not found | 460 / 310 | `w-153.5` / `w-103.5` |
| News, an article, tags | 210 / 560 / 160 | `w-70` / `w-187` / `w-53` |
| Account settings | 210 / 560, boxes 8px apart | `w-67.5` / `w-184.5`, `gap-2.5` |
| Discussion board | 750 / 4 / 164 | `w-250` / `w-1.5` / `w-54.5` |

- A box's margin, Holo's `0 8px 7px 0`, is `mr-2.5 mb-2.5`.
- On a signed-out page, Holo's 766px box is 988px, so widths there are Holo's times 1240/960: the landing's columns,
  404 and 310, are `w-130.5` and `w-100`; register's, 435 and 269, are `w-140.5` and `w-87`.
- A picture, a sprite and the box drawn around one keep Holo's pixels: the wardrobe's slots and arrows, the badge
  editor, icon cells. Where the box grew around a picture, the picture stays at its left and the box's colour fills
  the rest. The Me and community pages wrap theirs (the columns, above).
- A heading beside the tabs inside a box is Holo's 14px, `text-xl`.
- Home pages keep their canvas: the playground, its widgets, notes and stickers, and their dialogs keep Holo's pixels.
  The Help Tool's window and the client's top bar keep theirs too.
- BBCode's `[size=small]` is `text-sm` and `[size=large]` `text-2xl`, Holo's `<font size>` 1 and 3; the quote box is
  `m-1 mb-3.5 p-1.5`. `src/bbcode.ts` of the components and `internal/bbcode` change together.
