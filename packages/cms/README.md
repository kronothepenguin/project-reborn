# cms — web app package

Astro (Svelte + Tailwind) frontend embedded in a Go module. The Go app struct
(`cms` struct) registers a router over `packages/astro` resolvers and
serves the built frontend from the embedded `dist/`.

## Ports

- App (Go HTTP server): `cms.host` and `cms.port` in `config.json`, `localhost`
  and 17387 by default
- Astro dev server: **22827** — baked in `astro.config.mjs`

## Runtime

- `cms.New(db, WithResolver(…), WithStatic(…))` takes the db the runner opened
  with `store.FromConfig()` and loads the settings (`virtual/settings`),
  panicking when it cannot. Only the resolver and the static handler are
  options, because they differ between the production and development runners.
- `Mount` wraps every CMS route with `auth.RealIP`, cross-origin protection and
  `auth.Sessions`, so the CMS stays protected on a mux it shares with other apps.
- While `site.maintenance` is on, every page route serves
  `maintenance.html` with 503, except `POST /` (sign in), `POST /logout` and the
  static files; users holding `site.maintenanceBypass` see the site. A failed
  sign-in stays on the maintenance page.
- Signing in lands on `/me`, and `/` sends signed-in visitors there.
- `/?ageLimit=true` shows `You are too young to register.`, where the registration's
  age check ends.
- `POST /logout` shows Holo's confirmation, or `You are not logged in` without a
  session, as `GET /logout` does for guests. Signing out is a `POST`, unlike
  Holo's, so that another site cannot do it.
- `router.Banned` runs on every page before the maintenance check, as Holo's
  `core.php` did: a banned visitor loses the session and sees the ban.
- `POST /register` creates the account in one transaction through
  `auth.CreateAccount`, up to `registration.maxPerIp` per
  `registration.ipWindowHours` from one address, and signs the visitor in. Under
  the age limit of 6 it goes to `/?ageLimit=true`, which Holo only checked in the
  browser.
- `/register?refer=<habbo name>` writes a referral in that transaction and pays
  `referral.reward` to the habbo while `referral.enabled` is on. A name that does
  not exist is ignored.
- `POST /forgot` takes the username and the email, as Holo's form does, and mails
  the reset link only when both belong to one account. It answers the same way in
  every case and works in the background, so neither the page nor the response
  time reveals an account. An empty `mail.host` means that no mail goes out, and
  the failure is logged. While an account holds `auth.resetMaxActive` unexpired
  links no mail goes out, and the page answers the same way. Signed-in visitors
  see `Please log out to use this feature.`
- `landing/promo-widget` is the HTML5 port of Holo's Flash promo, built from
  `vendor/HabboWidgets/habbos_v2_landing` into `public/habbo-widgets/landing/`. It
  reads `GET /xml/promo-habbos.xml`, and its button sends `gender` and `figure` to
  `/register`. With `features.landingPromo` off the landing shows the join button
  and the feed answers 404.
- `register/registration-form` is the port of Holo's `registration.js`. The form is
  plain HTML that works without JavaScript, and the island reads it by id: it
  keeps step 3 closed until the name passes the check, shows Holo's tooltips and
  field states, validates on `Done`, and handles the age limit of 6 and the
  parent's email up to 12, which is never sent. Passwords and addresses are checked
  in the browser, so a password stays on the page until the form is sent.
- Islands get no `[[ ]]` values, so the page keeps the name and the look in
  inputs that Go fills in. `habbo/avatar-editor` reads the hidden `figure`,
  `gender` and `editorState` inputs on start and writes every change back, which
  is how the look reaches the backend. `/register` also takes `?gender=…&figure=…`.
- A form that fails answers 422 with the page it came from.
- Page structs on the `signed-out` layout embed `hotelStatus`, because the layout
  reads its names and counts and rendering fails without them.
- Nothing reloads the settings for now.

## Development

Recommended: run through the app runner in `apps/cms`:

```sh
cd apps/cms
make dev    # astro (background) + air hot reload → http://localhost:17387
make web    # astro dev server only → http://localhost:22827
make stop   # stop the background astro server
```

Or run the astro dev server directly from this directory:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`. Astro page edits are hot-reloaded; the Go router fetches
the rendered page fresh on every request in dev mode.

## Production build

1. `pnpm build` — renders `dist/`
2. From the repository root:
   `go build -o apps/cms/tmp/cms ./apps/cms/cmd/cms && ./apps/cms/tmp/cms`

`make install` writes a placeholder `dist/index.html`, because `go:embed` needs a
file there before the first `pnpm build`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/guides/routing/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)