---
type: Task
title: Open the client from the site
description: The site's "Enter <short name>" button, ported from Holo's header, opens the client page in a window of its own for a signed-in habbo.
scope: [packages/cms]
depends_on: []
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, adding-svelte-interactivity, testing-behaviours]
---

# Goal

A habbo reaches the client from the site ([Plan](/features/client/plan.md)). The behaviour of the spec:

- A signed-in habbo presses "Enter <short name>" on the site: the client opens in a window of its own, as Holo's did.

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `packages/cms/knowledge/client.md`: the client page at `/client`, which fits a window the site opened.
- Holo's header and its "Enter" button: `source/holocms/templates/community/header.php` and the scripts it loads
  (Latin-1 with CRLF: read them through `tr -d '\r' | iconv -f latin1 -t utf8`). Ported pages match Holo exactly
  ([holo-port 0034](/decisions/holo-port/0034-behaviour-matches-holo.md)).
- `packages/cms/knowledge/pages.md` and `islands.md`: the layouts and the header's islands.

# Steps

- [ ] The button of Holo's header, where Holo had it and with its words, on the pages that carry the header for a
  signed-in habbo. It opens `/client` in a window of its own, with the size and the window name Holo's script used.
- [ ] One test of the behaviour through the router (the header carries the button for a signed-in habbo), and the
  click itself checked in a browser suite, because the new window needs a real browser.
- [ ] Report what Holo's button did that the goal leaves out, as proposed spec lines.
- [ ] Update `packages/cms/knowledge`.

# Checks

```sh
make -C packages/cms check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`, and the browser
suite you changed.
