---
type: Task
title: Add the legal pages
description: Serve the terms of service and the privacy policy with Holo's texts, so the footer links and the registration terms link work.
status: done
phase: p1
depends_on: []
packages: [packages/cms]
holo: [source/holo/disclaimer.php, source/holo/privacy.php, source/holo/locale/en/policies.php]
timestamp: 2026-10-30T22:31:40+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:31:40+00:00"}
---

# Goal

`/disclaimer` and `/privacy`, which the `signed-out` footer already links to, serve their pages.

# Steps

- [x] `legal/terms`: the shared box with a title and the text.
- [x] `disclaimer.astro` and `privacy.astro` on the `signed-out` layout, with `[[ .Name ]]` and `[[ .ShortName ]]`
      from the settings where Holo used `$sitename` and `$shortname`.
- [x] `GET /disclaimer` (`internal/router/disclaimer.go`) and `GET /privacy` (`internal/router/privacy.go`), behind
      the maintenance gate like every page.
- [x] A test that each route renders its page with the site name.

# Verification

```sh
pnpm --filter @project-reborn/cms build
grep -c '\[\[' packages/cms/dist/disclaimer.html packages/cms/dist/privacy.html
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-10-30T22:31:40+00:00):

- The CMS builds, and `dist/disclaimer.html` and `dist/privacy.html` keep their `[[ ]]` placeholders.
- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`. The tests cover both routes with and without a session,
  the configured site names, and the maintenance gate.
- On the production binary both pages answered 200, with the site's short name in the title, the configured names in the
  privacy text and no `[[ ]]` left in the page.

# Notes

- Holo's terms read "The Terms of Service are not yet available." That text stays until the user writes real terms.
- The privacy text is ported with its spelling fixed, and "a secure MySQL database" becomes "a secure database".
