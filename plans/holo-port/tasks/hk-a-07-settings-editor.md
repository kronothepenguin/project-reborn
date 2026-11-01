---
type: Task
title: Build the settings editor
description: GET /settings and POST /settings/{section} give a form over each group of declared settings, saved with settings.Set, all or nothing.
status: todo
phase: hk-a
depends_on: [hk-a-06]
packages: [packages/housekeeping, packages/virtual]
holo: [source/holo/housekeeping/cms_config.php, source/holo/housekeeping/maintenance.php, source/holo/housekeeping/content_tool.php, source/holo/housekeeping/sitemenu.php]
timestamp: 2026-11-01T21:07:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
---

# Goal

Staff with `housekeeping.settings` edit every declared setting, and a value set back to its default deletes its row.

# Steps

- [ ] `settings.Declared()` lists the declared settings for the forms and never hands out a secret, and
  `settings.Validate()` checks several values together without writing.
- [ ] Sections with Holo's titles, labels, buttons and messages where Holo has the form, and any other declared setting
  in a form with its key as its label, so that a setting declared later has a form at once.
- [ ] `POST /settings/{section}` reads only the keys of that section, refuses everything when one value is wrong, and
  writes the changed keys with `settings.Set` and one staff log row.
- [ ] `mail.password` is masked: it never reaches the page, a blank field keeps it, and a checkbox clears it.
- [ ] Tests, including a broken `settings.Set` call and a broken staff log write.

# Verification

```sh
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- `settings.Set` receives the `*sql.DB`, and the pool has one connection, so it cannot run inside a transaction. The staff
  log row goes first: a failed `Set` then leaves a row for a change that did not happen, and never a change without a row.
- `cms.refresh` has no reader ([0040](/decisions/0040-housekeeping-writes-settings.md)), so no form offers it, and
  `housekeeping.note` belongs to the dashboard.
