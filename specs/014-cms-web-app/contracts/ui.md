# UI Contract: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-16

The CMS frontend follows `building-astro-components`, `templating-astro-pages`,
and `adding-svelte-interactivity`: Go owns routing, Astro builds the static
page shells, `html/template` substitutes runtime values through `[[ ]]`, and
Svelte 5 is used only where the browser must react to the user. Styling is
Tailwind utility classes only, with every legacy palette value translated to a
Tailwind CSS v4 token by the repository's `tools/tw-color` CLI
(`make tw-color`).

Slice 1 touches three small things in the existing UI: the signed-out header
renders the offline state unconditionally, the footer targets become the fixed
routes `/`, `/disclaimer`, `/privacy`, and the sign-in form gains a hidden
`csrf_token` input. Everything else renders as it does today.

The visual descriptions below are the implementation guide, not a pixel law:
the exact utility composition may adapt as long as the mapped tokens, the
specified structure, and the stated proportions and shadows are preserved.

---

## Color mapping (authoritative)

The table is produced by `make tw-color` against the palette shipped with the
installed Tailwind CSS v4; docs always reference the token, never the hex.

| Legacy intent | Legacy value | Tailwind token |
|---|---|---|
| Document background | `#bce0ee` | `sky-200` |
| Paper border and hard shadow | `#97b3bf` | `mist-400` |
| "users online now" text | `#fc6204` | `orange-500` |
| Banner card body | `#e3e3db` | `taupe-200` |
| Banner card border and hard shadow; Sign In button lower half | `#cccccc` | `mauve-300` |
| Sign In button lower half on hover | `#eaeaea` | `olive-200` |
| Sign-in error paper | `#e2001a` | `red-600` |
| Join button background | `#3aa700` | `lime-600` |
| Join button bottom line | `#93d10e` | `lime-500` |
| Join button border | `#1f5700` | `lime-900` |
| Login variant header | `#6b6b6b` | `neutral-500` |
| Login variant body | `#b4b4af` | `olive-400` |
| Login card content links | `#333333` | `olive-800` |
| Sign In button border | `#000000` | `black` |
| Text on dark surfaces; Sign In button upper half | `#ffffff` | `white` |
| Card title on the default variant | — | `mauve-900` (closest shade in the family) |
| Body text | — | `neutral-900` |
| Footer links | — | `sky-700` |
| Footer copy and separators | — | `neutral-600`, `mist-400` |

New colors are never written as raw hex; they are mapped with `make tw-color`
and added to this table. Tailwind v4 exposes the palette as theme variables,
so colored hard shadows use an arbitrary utility over the variable, for
example `shadow-[0_3px_0_var(--color-mist-400)]`; this keeps the value derived
from the Tailwind theme. Tailwind v4 dynamic spacing makes the closest width
exact: `max-w-189` = 47.25rem = 756px.

## File layout

```text
packages/cms/src/
├── layouts/
│   ├── document.astro          # existing: <html>/<head>/<body> shell
│   ├── signed-out.astro        # centered paper + public header row + footer
│   ├── signed-in.astro         # SLICE 2: top navigation + CSRF meta + content
│   └── client.astro            # SLICE 2: bare shell for the client popup page
├── components/
│   ├── paper.astro             # bare container (background + slot)
│   ├── card.astro              # default/login variants
│   ├── username-availability.svelte   # SLICE 2: interactive, client:only
│   └── motto-editor.svelte     # SLICE 2: interactive, client:only
├── pages/
│   ├── index.astro             # public homepage + sign-in form
│   ├── register.astro          # SLICE 2
│   ├── me.astro                # SLICE 2
│   ├── client.astro            # SLICE 2
│   ├── forgot.astro            # SLICE 3
│   └── reset.astro             # SLICE 3
└── styles/global.css           # `@import "tailwindcss"` only
```

`astro.config.mjs` keeps `build.format: "file"`, so each page maps to
`<name>.html` and the resolver keys stay stable.

## 0. Document layout — `document.astro`

The only file with `<html>`, `<head>`, or `<body>`; imports `global.css` once.

- `<head>`: charset, `favicon.svg` + `favicon.ico`, viewport, generator meta,
  and `<title>{title}</title>` from the optional `title` prop.
- `<body class="min-h-screen bg-sky-200 text-neutral-900">` renders the
  default slot.
- No page renders `document.astro` directly; each page renders a body layout.

## 1. Signed-out layout — `signed-out.astro`

The frame for the public pages (index now; register, forgot, reset later).

- Centers the paper horizontally and vertically: wrapper
  `flex min-h-screen items-center justify-center p-2`.
- Renders `paper.astro` with the frame classes
  `w-full max-w-189 rounded-md border border-mist-400 p-4 shadow-[0_3px_0_var(--color-mist-400)]`
  (756px wide plus corners, border, padding, and 3px hard shadow).
- **First row** (inside the paper, above the content):
  `flex items-center justify-between gap-2 p-2`
  - left: the shipped `logo.svg` wordmark, 180×40;
  - center: **0** in bold followed by "users online now" in `text-orange-500`
    (static markup: the index slice always shows the hotel offline);
  - right: red "Hotel offline" with a red dot
    (`text-red-600`, `h-2.5 w-2.5 rounded-full bg-red-500`); the green
    "Hotel online" variant returns when a game-status source exists.
- **Content**: the page's default slot.
- **Footer** (inside the paper, below the content), two centered rows in
  `text-xs` with a `border-t border-mist-400` separator:
  - row 1: "Homepage" → `/`, "Terms of Service" → `/disclaimer`, "Privacy
    Policy" → `/privacy`; links `text-sky-700 underline`, separators
    `text-mist-400`;
  - row 2 in `text-neutral-600`: "Powered by ProjectReborn © 2008 Meth0d &
    Parts by Yifan, sisija." and the Sulake trademark line.
- The header and footer belong to the layout, so every signed-out page carries
  them.

### `paper.astro`

| Property | Contract |
|---|---|
| Props | `class?` merged onto the root; `background?` default `bg-white` |
| Layout | pure container: `rounded-md` root with the default slot, no padding, border, or shadow of its own; call sites supply the frame treatment |

## 2. Index view — `index.astro`

Renders through `signed-out.astro` with title "Habbo Hotel".

**Two columns**: left `flex-3`, right `flex-2` in a `flex gap-2 py-2` row
(left column is 1.5× the right).

### Left column — register banner

| Part | Contract |
|---|---|
| Card | `card.astro` default variant |
| Header | `banner-join.svg` as a full-width image header, `h-40 w-full rounded-sm object-cover` |
| Join link | styled as a button, links to `/register`: `bg-lime-600`, `border-2 border-lime-900`, `border-b-[3px] border-b-lime-500`, `shadow-[0_3px_0_var(--color-lime-900)]`, `rounded`, `px-4 py-1.5`, bold `text-white`; text "Join now, it's free »" |
| Content | `p-2 text-sm` line: "Holo is a virtual world where you can meet and make friends." |

### Right column — login card, then image

| Part | Contract |
|---|---|
| Error paper | directly above the login card, rendered only `[[ if or .Errors.General .Errors.Username .Errors.Password ]]`: `paper.astro` with `background="bg-red-600"` and `p-1 text-center text-sm`; inside, `<p class="font-bold text-white">[[ or .Errors.General .Errors.Username .Errors.Password ]]</p>` — one message, no per-field rows |
| Login card | `card.astro` login variant, header title "Sign In" |
| Form | `method="post"` and grid `grid grid-cols-[1fr_1fr_1fr] items-center gap-2 text-sm`; rows below |
| Row 1 | hidden `<input type="hidden" name="csrf_token" value="[[ .CSRFToken ]]" />` (first field, invisible) |
| Row 2 | bold "Username" label; `username` text input `value="[[ .Values.Username ]]"`, `w-36 rounded border border-neutral-600 bg-white px-2 py-1 text-neutral-900`; action column empty |
| Row 3 | bold "Password" label; `password` input (type password, never re-filled), same classes; **"Sign In"** submit button in the action column: `border-2 border-black`, `bg-linear-to-b from-white from-50% to-mauve-300 to-50%`, `hover:to-olive-200`, `rounded`, `px-4 py-1 text-sm font-bold text-black`, no wrap |
| Row 4 | label column empty; "Remember me" checkbox spanning control/action |
| Row 5 | label column empty; "Register for free" → `/register`, `col-span-2 underline text-xs font-bold text-olive-800 hover:text-white` |
| Row 6 | label column empty; "I forgot my password/username" → `/forgot`, `col-span-2 text-xs underline text-olive-800 hover:text-white` |
| Image | below the login card: `login-promo.svg` in an `overflow-hidden rounded-md shadow-md` frame |

The fixed link targets are `/register`, `/forgot`, `/disclaimer`, `/privacy`,
and `/me` (spec FR-013); the pages behind them are outside the index slice.

## 3. Card component — `card.astro`

Props: `variant?: "default" | "login"` (default `"default"`), optional `class`
passthrough.

- Root: `flex w-full flex-col rounded-md border p-1` plus the variant palette.
- Header: full width, `rounded-sm p-1 text-center font-bold` with the `title`
  slot.
- Content: `p-2` with the default slot.
- Variants:
  - `default` — `border-mauve-300 bg-taupe-200 shadow-[0_3px_0_var(--color-mauve-300)]`,
    header `bg-mauve-300 text-mauve-900`;
  - `login` — `border-mauve-300 bg-olive-400 text-white shadow-[0_3px_0_var(--color-mauve-300)]`,
    header `bg-neutral-500 text-white`.

## Slice 2 layouts and pages

- `signed-in.astro` renders `document.astro` plus the simplified top
  navigation (brand, personal page, help, enter client `target="_blank"`,
  sign-out form, housekeeping only when `.IsAdmin`), the current section as
  plain text, and `<meta name="csrf-token" content="[[ .CSRF ]]">`. Content
  sits in a `max-w-189` column.
- `client.astro` layout renders a bare container for the Director runtime
  entry; no CMS chrome.
- `register.astro` carries the username availability widget, the detail
  fields, day/month/year selects, email fields, newsletter checkbox, terms
  box, female/male avatar choice, and per-field errors with retained values.
- `me.astro` shows avatar, username, the motto editor, last sign-in time, the
  signed-in navigation, and the admin-only housekeeping entry.

## Slice 3 pages

- `forgot.astro` shows the recovery card (username, email, request action) and
  the neutral confirmation card switched by `[[ if .Submitted ]]`; the
  confirmation copy is identical for matching and non-matching requests.
- `reset.astro` shows the new-password form with a hidden token, or the
  invalid-token state with links back to `/` and `/forgot`.

## Interactive components (Slice 2)

| Component | Contract |
|---|---|
| `username-availability.svelte` | Svelte 5, `client:only="svelte"`; prop `endpoint` (default `/register/username`); debounces input, calls `GET endpoint?username=…`, renders available/taken/invalid without a page reload |
| `motto-editor.svelte` | Svelte 5, `client:only="svelte"`; props `endpoint` (default `/me/motto`), `motto`, `maxLength` (128); reads the CSRF token from `meta[name="csrf-token"]`, posts JSON with `X-CSRF-Token`, updates in place |

No other component is extracted until it has a second call site.

## Assets

| Asset slot | Purpose |
|---|---|
| `public/logo.svg` | Signed-out header wordmark |
| `public/banner-join.svg` | Register banner header image |
| `public/login-promo.svg` | Right-column image on the index |
| `public/avatar-female.*`, `public/avatar-male.*` | Slice 2 registration choice and personal-page avatar |
| existing `public/favicon.*` | Unchanged |

Missing images never render a broken image: the markup uses a sized
placeholder surface until the asset is supplied.

## Templating rules

- Every runtime value in markup uses `[[ ]]`; the values are listed in
  [contracts/http.md](./http.md) and [data-model.md](../data-model.md).
- Passwords are never rendered back into forms.
- Astro build-time expressions use `{}`; the `[[ ]]` tokens survive the Astro
  build untouched (verification: `grep -c '\[\[ .' dist/index.html`).
- Svelte receives no `[[ ]]` values inside `<script>`; it reads server data
  from the DOM (CSRF meta) or simple scalar props.
- The layout is desktop-first; mobile support is out of scope (spec
  assumption).

## Verification

```sh
pnpm --filter @project-reborn/cms build
test -f packages/cms/dist/index.html
grep -c '\[\[ .*\]\]' packages/cms/dist/index.html   # placeholders survive the build
```

Then run the app and request `/` to confirm substitution.