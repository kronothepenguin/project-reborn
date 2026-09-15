# UI Contract: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-12

The CMS frontend follows `building-astro-components`, `templating-astro-pages`, and `adding-svelte-interactivity`: Go owns routing, Astro builds static page shells, `html/template` substitutes runtime values through `[[ ]]`, and Svelte 5 is used only where the browser must react to the user. Styling follows research decision R17: Tailwind utility classes only, with every legacy palette value translated to a Tailwind CSS v4 token by the repository's `tools/tw-color` CLI (`make tw-color`).

The visual descriptions below are the implementation guide, not a pixel law: the exact utility composition may adapt as long as the mapped tokens, the specified structure, and the stated proportions and shadows are preserved.

---

## Color mapping (authoritative)

The table is produced by `make tw-color` against the palette shipped with the installed Tailwind CSS v4; docs always reference the token, never the hex.

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

New colors are never written as raw hex; they are mapped with `make tw-color` and added to this table. Tailwind v4 exposes the palette as theme variables, so colored hard shadows use an arbitrary utility over the variable, for example `shadow-[0_3px_0_var(--color-mist-400)]`; this keeps the value derived from the Tailwind theme. Tailwind v4 dynamic spacing makes the closest width exact: `max-w-189` = 47.25rem = 756px.

## File layout

```text
packages/cms/src/
├── layouts/
│   ├── document.astro          # existing: <html>/<head>/<body> shell
│   ├── signed-out.astro        # centered paper + public header row + footer
│   ├── signed-in.astro         # top navigation + CSRF meta + content
│   └── client.astro            # bare shell for the client popup page
├── components/
│   ├── paper.astro             # new: bare container (background + slot)
│   ├── card.astro              # existing: default/login variants
│   ├── username-availability.svelte   # new: interactive, client:only
│   └── motto-editor.svelte     # new: interactive, client:only
├── pages/
│   ├── index.astro             # public homepage + sign-in form (replaces scaffold)
│   ├── register.astro          # registration page
│   ├── forgot.astro            # recovery request + neutral confirmation
│   ├── reset.astro             # new-password form + invalid-token state
│   ├── me.astro                # personal page (basic)
│   └── client.astro            # client entry placeholder
└── styles/global.css           # `@import "tailwindcss"` only
```

Removed: the unused `counter.svelte` scaffold and the unused `card.astro` import in the scaffold index page.

## 0. Document layout — `document.astro`

The only file with `<html>`, `<head>`, or `<body>`; imports `global.css` once.

- Body background: `bg-sky-200` (document background).
- Props: `title?`; `<body>` carries a neutral base text color and the page fills the viewport (`min-h-screen`).
- No page renders `document.astro` directly; each page renders a body layout.

## 1. Signed-out layout — `signed-out.astro`

The frame for the public pages (index, register, forgot, reset).

- Centers the paper horizontally and vertically: wrapper `flex min-h-screen items-center justify-center p-2`.
- Renders `paper.astro` with the frame classes `w-full max-w-189 rounded-md border border-mist-400 p-4 shadow-[0_3px_0_var(--color-mist-400)]` (756px wide plus the layout's corners, border, padding, and 3px hard shadow).
- **First row** (inside the paper, above the content): `flex items-center justify-between gap-2 p-2`
  - left: the hotel logo (wordmark or shipped logo asset);
  - center: `[[ .Online ]]` in bold, followed by "users online now" in `text-orange-500` (FR-001);
  - right: server status — online in `text-green-600` with a green dot, offline in `text-red-600` with a red dot (SC-009); in the first delivery slice the provider returns sample values, and the offline treatment applies when the game server is unreachable.
- **Content**: the page's default slot.
- **Footer** (inside the paper, below the content), two centered rows in `text-xs`:
  - row 1: "Homepage" | "Terms of Service" | "Privacy Policy", links `text-sky-700 underline`, separators muted;
  - row 2: "Powered by ProjectReborn © 2008 Meth0d & Parts by Yifan, sisija" and "HABBO is a registered trademark of Sulake Corporation. All rights reserved to their respective owner(s)." (the inventory's HoloCMS line renamed to the project).
- The row and footer are part of the layout, so every signed-out page (including forgot and reset) carries them.

### `paper.astro`

| Property | Contract |
|---|---|
| Background | `bg-white` by default; the `background` prop overrides it (the sign-in error paper uses `bg-red-600`) |
| Layout | pure container component: a default-slot wrapper with no padding, shadow, border, or corners of its own; each call site supplies its frame treatment |

## 2. Index view — `index.astro`

Renders through `signed-out.astro`.

**Two columns**: left `flex-3`, right `flex-2` in a `flex gap-2` row (left column is 1.5× the right).

### Left column — register banner (a card with an image header)

| Part | Contract |
|---|---|
| Card | `card.astro` default palette: body `bg-taupe-200`, border `border-mauve-300`, hard shadow `shadow-[0_3px_0_var(--color-mauve-300)]` |
| Header | full-width image card header occupying the card header area; height is about 4× the content section's height (image asset or neutral placeholder of the same size) |
| Join link | between the header image and the content section; anchor styled as a button: `bg-lime-600`, `border-2 border-lime-900`, 3px bottom line `border-b-[3px] border-b-lime-500`, hard shadow `shadow-[0_3px_0_var(--color-lime-900)]`, bold `text-white`, rounded, horizontal padding; text `Join now, it's free »`; links to `/register` |
| Content | small `p-2 text-sm` section with the copy "Holo is a virtual world where you can meet and make friends." |

### Right column — login card, then image

**Usage note**: the layout below is how `index.astro` uses the login variant — it is not a change to the card variant itself.

| Part | Contract |
|---|---|
| Login card | `card.astro` with the `login` variant: header `bg-neutral-500`, body `bg-olive-400`, text `text-white`; header title **"Sign In"** |
| Form grid | three columns — label, control, action — `grid grid-cols-[1fr_1fr_1fr] items-center gap-2`, laid out per row below |
| Error paper | directly above the login card, rendered only when a sign-in error exists: `paper.astro` with the signed-out paper's frame classes (`rounded-md border border-mist-400 p-4 shadow-[0_3px_0_var(--color-mist-400)]`) and only the background changed (`background="bg-red-600"`), centered bold `text-white`, showing the first non-empty of `[[ or .Errors.General .Errors.Username .Errors.Password ]]`; no per-field error rows render under the inputs |
| Row 1 | "Username" label; username input; action column empty |
| Row 2 | "Password" label; password input; **"Sign In"** submit button in the action column: 2px black border, upper half `white`, lower half `mauve-300` (`olive-200` on hover), `px-4 py-1 text-sm`, no wrap |
| Row 3 | label column empty; **"Remember me"** checkbox spanning the control/action area |
| Row 4 | label column empty; **"Register for free"** link to `/register` in `text-olive-800 hover:text-white` |
| Row 5 | label column empty; **"I forgot my password/username"** link to `/forgot` in `text-olive-800` |
| Image | below the login card: an image with rounded corners (`rounded-md overflow-hidden`); image asset or neutral placeholder |

## 3. Card component — `card.astro`

Props: `variant?: "default" | "login"` (default `"default"`), optional `class` passthrough.

- Root: `p-2`, `rounded-md`, `border`, the common 3px hard bottom shadow; column layout.
- Header: full width, rounded, centered title slot (`<slot name="title" />`); header radius is smaller than the card radius, matching "rounded-md (higher than header)".
- Content: `p-2` and the default slot.
- Variant palettes:
  - `default` — body `bg-taupe-200`, border and hard shadow `mauve-300`, title header `bg-mauve-300` with dark text (the closest mapped shade in the family);
  - `login` — body `bg-olive-400` with `text-white`, title header `bg-neutral-500` with `text-white`; border and hard shadow stay on the card default.

## Signed-in layout — `signed-in.astro`

Renders `document.astro` and adds the simplified top navigation required by FR-022: brand, personal page link, help link, enter-client link (`target="_blank"`), sign-out form button, and the housekeeping link rendered only when `.IsAdmin`. The current section renders as plain text, not a link (FR-023). It renders `<meta name="csrf-token" content="[[ .CSRF ]]">` (research R10). No subnav or member popovers — those arrive with their features. Content sits in a `max-w-189` column for consistency with the public pages.

## Client layout — `client.astro`

Renders `document.astro` with a bare container: it identifies the signed-in member and reserves the element where the Director runtime will be embedded. No CMS chrome.

## Interactive components

| Component | Contract |
|---|---|
| `username-availability.svelte` | Svelte 5, `client:only="svelte"`; prop `endpoint` (default `/register/username`); debounces input, calls `GET endpoint?username=…`, renders available/taken/invalid without a page reload (FR-006) |
| `motto-editor.svelte` | Svelte 5, `client:only="svelte"`; props `endpoint` (default `/me/motto`), `motto` (simple scalar), `maxLength` (128); reads the CSRF token from `meta[name="csrf-token"]`, `POST`s JSON with `X-CSRF-Token`, updates the motto in place (FR-027) |

No other component is extracted until it has a second call site (YAGNI, skill rule 3).

## Pages against the specification

| Page | Requirements realised |
|---|---|
| `index.astro` | Status/online count, registration call to action, sign-in form with remembered username and per-field errors, two-column layout, footer from the layout (FR-001–FR-004, FR-013, FR-014) |
| `register.astro` | Username availability widget, details fields, day/month/year selects, email fields, newsletter checkbox, terms box, female/male avatar box, exit/continue controls, per-field errors with retained values (FR-005–FR-010) |
| `forgot.astro` | Recovery card (username, email, request action) and the neutral confirmation card with the back-to-index link, switched by `[[ if .Submitted ]]` (FR-017–FR-021); authoritative confirmation copy: "If the details match an account, recovery information has been sent. Check your email." (identical for matching and non-matching requests) |
| `reset.astro` | New-password form with hidden token, or the invalid-token state with links back to the index and the recovery request (research R3) |
| `me.astro` | Avatar image (static per chosen gender, research R8), username, motto editor, last sign-in time (UTC `YYYY-MM-DD HH:MM`, or `Never` when unset), signed-in navigation, admin-only housekeeping entry (FR-022–FR-028) |
| `client.astro` | Separate-window client entry identifying the member, protected by the session (FR-025, research R7) |

## Assets

| Asset slot | Purpose |
|---|---|
| `public/logo.*` | Signed-out first row logo; a text wordmark is acceptable until the asset exists |
| `public/banner-join.*` | Register banner header image; a neutral placeholder of the same size is acceptable until the asset exists |
| `public/login-promo.*` | Right-column rounded image on the index; a neutral placeholder is acceptable until the asset exists |
| `public/avatar-female.*`, `public/avatar-male.*` | Registration options and personal-page avatar until a figure composer/imaging service exists (research R8) |
| existing `public/favicon.*` | Unchanged |

Missing images must never render a broken image: the markup uses a sized placeholder surface until the asset is supplied.

## Templating rules

- Every runtime value in markup uses `[[ ]]`; all page data is listed in [contracts/http.md](./http.md).
- Passwords are never rendered back into forms.
- Astro build-time expressions use `{}`; the `[[ ]]` tokens survive the Astro build untouched (skill verification: `grep -c '\[\[ .' dist/<page>.html`).
- Svelte receives no `[[ ]]` values inside `<script>`; the only server data it needs is read from the DOM (CSRF meta) or passed as a simple scalar prop.
- The layout is desktop-first; mobile support is out of scope (spec assumption).