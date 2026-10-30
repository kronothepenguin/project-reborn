---
type: Task
title: Add the landing promo widget
description: Serve the promo habbos as XML and show the HabboWidgets landing widget on the landing page when features.landingPromo is on, with the join button otherwise.
status: todo
phase: p1
depends_on: [p1-02, p1-04]
packages: [packages/store, packages/virtual, packages/cms]
holo: [source/holo/xml/promo_habbos.php, source/holo/templates/login/column1.php]
timestamp: 2026-10-30T21:44:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
---

# Goal

The landing page shows random habbos in the promo widget, replacing Holo's Flash promo.

# Steps

- [ ] Declare `features.landingPromo`, on by default like Holo's `enable-flash-promo`.
- [ ] Query `ListRandomAvatars`, with its OKF document.
- [ ] `GET /xml/promo-habbos.xml` (`internal/router/xml-promo-habbos.go`): up to 10 random habbos in the format of
      [promo habbo XML](/reference/holo-protocols.md#promo-habbos-xml), with `image` built from `imaging.avatarUrl` and
      Holo's `size=b&direction=4&head_direction=3&gesture=sml`, plus `figure` and `gender`, because the widget sends
      both to the register page. `encoding/xml` escapes the attributes, which Holo did not do. It answers 404 while
      `features.landingPromo` is off.
- [ ] Build the widget as its README says (`npm install && npm run build` in `vendor/HabboWidgets/habbos_v2_landing`)
      and copy `dist/habbos-v2-landing.iife.js` and `dist/assets.zip` to
      `packages/cms/public/habbo-widgets/landing/`.
- [ ] ⚡`landing/promo-widget`: creates `window.HabboLandingWidget` with `assetsPath`, `assetsZipUrl`, `habbosUrl`,
      `buttonLink: "/register"` and Holo's texts. The widget appends `?gender=…&figure=…` to the link, which
      [p1-04](/tasks/p1-04-registration.md) reads. The slogan comes from the markup, since islands get no `[[ ]]`
      values.
- [ ] `landing/join-button`: the existing SVG, moved out of `index.astro`.
- [ ] `index.astro` shows the widget when `[[ .LandingPromo ]]` is on, and otherwise the join button with the
      promotional text, as Holo's `column1.php` does. `[[ .ShortName ]]` replaces the hard-coded "Holo".
- [ ] Tests in `packages/cms`: the XML, escaping included, an empty hotel, the 404 and both landing variants.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
pnpm --filter @project-reborn/cms build
grep -c '\[\[' packages/cms/dist/index.html
grep -c 'client="only"' packages/cms/dist/index.html
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then run the production binary and check that the widget shows habbos in a browser.

# Notes

- `vendor/HabboWidgets` is a git submodule, so the copied files are what the repository tracks, as with
  `public/habbo-editor.iife.js`.
- Holo's XML also carried names, mottos, badges and online status, for the Flash promo. The ported widget reads only
  `image`, `figure` and `gender`.
- The tag cloud of `column1.php` belongs to P4.
