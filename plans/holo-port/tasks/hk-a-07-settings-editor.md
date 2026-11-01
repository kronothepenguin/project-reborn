---
type: Task
title: Build the settings editor
description: GET /settings and POST /settings/{section} give a form over each group of declared settings, saved with settings.Set, all or nothing.
status: done
phase: hk-a
depends_on: [hk-a-06]
packages: [packages/housekeeping, packages/virtual]
holo: [source/holo/housekeeping/cms_config.php, source/holo/housekeeping/maintenance.php, source/holo/housekeeping/content_tool.php, source/holo/housekeeping/sitemenu.php]
timestamp: 2026-11-01T21:49:30+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:49:30+00:00"}
---

# Goal

Staff with `housekeeping.settings` edit every declared setting, and a value set back to its default deletes its row.

# Steps

- [x] `settings.Declared()` lists the declared settings for the forms and never hands out a secret, and
  `settings.Validate()` checks several values together without writing.
- [x] Sections with Holo's titles, labels, buttons and messages where Holo has the form, and any other declared setting
  in a form with its key as its label, so that a setting declared later has a form at once.
- [x] `POST /settings/{section}` reads only the keys of that section, refuses everything when one value is wrong, and
  writes the changed keys with `settings.Set` and one staff log row.
- [x] `mail.password` is masked: it never reaches the page, a blank field keeps it, and a checkbox clears it.
- [x] Tests, including a broken `settings.Set` call and a broken staff log write.

# Verification

```sh
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01):

- `gofmt`, `go vet` and `go test -race` pass in `packages/virtual` (24 tests) and `packages/housekeeping` (48).
- Eighteen breaks, one at a time, were each caught by a named test, among them no `settings.Set`, no staff log row, a row
  with nothing changed, a row holding values, no joint check, no retry of a refused key, a blank password that clears, a
  refused password shown again, and a route without its attribute. `Declared` handing out a secret survives in
  `packages/housekeeping`, because the field masks by the `Secret` flag too, and `packages/virtual` catches it.
- On the production binaries, in a real Chromium, all 21 checks passed: all 8 forms open, saving and Holo's messages, a
  refusal with 422 that keeps what was typed, the mail password never on the page, and both password limits rising and
  falling together.

# Notes

- `settings.Set` receives the `*sql.DB`, and the pool has one connection, so it cannot run inside a transaction. The staff
  log row goes first: a failed `Set` then leaves a row for a change that did not happen, and never a change without a row.
- `cms.refresh` has no reader ([0040](/decisions/0040-housekeeping-writes-settings.md)), so no form offers it, and
  `housekeeping.note` belongs to the dashboard.
- A save writes one staff log row, as Holo's forms did, whose detail lists the keys that changed. Values stay out of it,
  because they can be secrets.
- `settings.Set` checks the rules on each key, so raising both password limits fails when the lower one goes first, and
  lowering both fails the other way round. `setAll` lets a refused key wait for the others. `settings.Validate` has already
  passed the values together, so a round that writes nothing is a real failure.
- The forms come from `settings.Declared()`, with Holo's texts on top, so that what P2 declares has a form on merging,
  with its key for a label until someone writes one.
- `mail.password` is marked `secret` in the catalogue, so `Declared()` cannot hand it out. A later secret only needs the same
  mark. A blank field keeps the password, and a checkbox clears it.
- A save redirects to `?section=…&saved=1`, so that a reload does not post again. Holo rendered its message from the post.
