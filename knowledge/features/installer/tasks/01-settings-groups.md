---
type: Task
title: The settings' labels live in packages/settings
description: packages/settings lists every setting an administrator edits in groups with labels and help, housekeeping's settings page reads them, and the mail group becomes "Password reset mail".
scope: [packages/settings, packages/housekeeping, packages/cms, tests/e2e]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

One place holds the label and the help of each setting, so that housekeeping and the installer show the same.

# Context

- [Spec](/features/installer/spec.md), `### Housekeeping` under `## Next`.
- [Plan](/features/installer/plan.md), "The two optional steps": the shape is the user's, build it exactly as written
  there.
- `packages/housekeeping/internal/router/settings.go`: `forms` holds the labels today.

# Steps

- [ ] `packages/settings`: `Group`, `Field`, `Choice` and `Groups()`, with every field of housekeeping's `forms`, in
  its order.
- [ ] Housekeeping's settings page builds its forms from `settings.Groups()`. It keeps, by group and by key, what is
  its own: page titles, menu names, button texts, the words of a switch, multi-line texts and the BBCode editor.
- [ ] The mail group: title and menu name "Password reset mail", with the help "The mail server that sends 'Forgot
  your password?' links. The minimail needs none."
- [ ] Tests: every declared setting an administrator edits is in exactly one group; every field of a group names a
  declared setting; housekeeping's page shows each label and help it showed before.
- [ ] `packages/cms/knowledge/mail.md` says what the mail server sends and that the minimail needs none. Update
  housekeeping's knowledge of the settings page, and the browser suites that name the "Mail" form.

# Checks

```sh
make -C packages/settings check
make -C packages/housekeeping check
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/settings`.
