---
type: Task
title: Tabs that are links
description: The shared Tab takes an href and becomes a link, and the installer's steps use it, drawn on the server.
scope: [packages/components, packages/installer, tests/e2e]
depends_on: []
skills: [building-svelte-primitives, building-astro-components, testing-behaviours]
---

# Goal

The installer's steps are plain links that look like tabs, with scripts on or off.

# Context

- [Spec](/features/look-and-feel/spec.md), `### Tabs that are links` under `## Next`.
- [Plan](/features/look-and-feel/plan.md), "The tabs": the `href` shape is the user's, build it exactly as written
  there.
- `packages/components/src/components/tab.svelte`, `button.svelte` for how a part takes `href`, and
  `packages/installer/src/components/step-tabs.svelte`.

# Steps

- [ ] `Tab` takes `href`: with it the tab is an `<a>` with the tab's look and state; a disabled tab has no link.
- [ ] A story and a behaviour test for the linked tab.
- [ ] The installer's steps are linked tabs drawn on the server, with no island: the current one selected, the passed
  ones linked, the ones to come disabled.
- [ ] The browser suites of the installer pass, and one check opens a passed step from its tab with scripts off.
- [ ] Update the components' knowledge and `packages/installer/knowledge/steps.md`, move the spec's lines up, and
  note the linked tab in the plan.

# Checks

```sh
make -C packages/components check
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=packages/components` prints.
