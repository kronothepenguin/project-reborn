---
type: Task
title: The site's layouts as Holo's, at the new sizes
description: The site takes Holo's font and the 16px base on a 1240px page, and its main tabs, sub-navigation, header with the inline habbo search, and footer match Holo's.
scope: [packages/cms, tests/e2e]
depends_on: [01-the-shared-parts]
skills: [building-astro-components, templating-astro-pages, testing-behaviours]
---

# Goal

Both layouts of the site look like Holo's at the new sizes.

# Context

- [Spec](/features/look-and-feel/spec.md), `### Sizes` and `### The community layout` under `## Next`.
- [Plan](/features/look-and-feel/plan.md), "The sizes" and "The tabs".
- [The comparison](/features/look-and-feel/research-holo-look.md), sections 1 to 4, 8 and 9: Holo's numbers.
- `packages/cms/src/layouts/community.astro`, `signed-out.astro` and `src/components/header/`.

# Steps

- [ ] Holo's font as the theme's `--font-sans`, and the 16px base, in the site's stylesheet.
- [ ] Both layouts on a 1240px page, centred, with their widths, paddings and sizes by the plan's rules.
- [ ] The main tabs drawn in CSS with Holo's two tones, outline, hover, green tabs and white selected tab that opens
  into the sub-navigation.
- [ ] The sub-navigation, the header and the footer as the comparison describes Holo's.
- [ ] The habbo search: its field and its button on one line, the same height, as one group at the right edge.
- [ ] The browser suites pass; screenshots of `/`, `/me`, `/community` and `/register` at 1366px and 1920px go in the
  report.

# Checks

```sh
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=packages/cms` prints.
