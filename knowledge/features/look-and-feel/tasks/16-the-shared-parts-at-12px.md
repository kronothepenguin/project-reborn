---
type: Task
title: Three shared parts fitted to 12px text
description: The stepper's points, the notice and a field's help line take sizes and colours that suit the site's 12px text.
scope: [packages/components, tests/e2e]
depends_on: []
skills: [building-svelte-primitives, testing-behaviours]
---

# Goal

Nothing in the shared parts stands out against 12px text.

# Context

- [Spec](/features/look-and-feel/spec.md), `### Shared parts at 12px` under `## Next`.
- `packages/components/src/components/step.svelte`, `notice.svelte`, `form-field.svelte`.
- The installer's steps and housekeeping's forms, which use them.

# Steps

- [ ] `Step`: the numbered point is in proportion to a 12px name, about 20px.
- [ ] `Notice`: its text is `text-xs`.
- [ ] `FormField`: the help line is grey, apart from the label, as housekeeping's help is.
- [ ] A story and a behaviour test for each change.
- [ ] Screenshots of the installer's administrator step and settings step at 1366px and 375px, looked at.

# Checks

```sh
make -C packages/components check
make e2e
```

Then `make check` in every project that `make dependants project=packages/components` prints.
