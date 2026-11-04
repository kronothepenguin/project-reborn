---
type: Task
title: Verify ED
description: Every exit criterion of ED holds from a clean checkout, in a real browser.
status: done
phase: ed
depends_on: [ed-02, ed-03, ed-04]
packages: [packages/components, packages/cms, packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T21:33:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T21:33:12+00:00"}
---

# Goal

ED meets its exit criteria ([ED](/phases/ed-bbcode-editor.md)).

# Steps

- [x] From a clean clone: `make install`, `make gates` and `make e2e` pass and leave the tree unchanged.
- [x] Each exit criterion is seen in a real browser, with screenshots read.

# Verification

```sh
make install && make gates && make e2e && git status --short
```

Results (2026-11-04T21:33:12+00:00), from a clone of `c30fcf6b`:

- `make install`, `make gates` and `make e2e` pass, and none of them changes the tree.
  - The gates: `gofmt`, `go vet` and `go test -race` in every module, the 159 component tests, `svelte-check`,
    `sqlc generate` with no diff, and `make check-docs`.
  - The browser suites: all 24 pass, 821 checks.
- Each exit criterion was seen in Chromium, with the screenshots read:
  - `news-every-format` and `news-every-format-site`: a story written with every button of the toolbar is saved as
    `[b]bold[/b] [i]italic[/i] [u]under[/u] [s]strike[/s] [url=https://hotel.example/]link[/url]
    [color=red]red[/color] [size=small]small[/size] [size=large]large[/size] [quote]quote[/quote] [code]code[/code]`,
    and the site shows each format as the editor did;
  - `settings-staff`: the two staff boxes are editors, and the staff page shows a box as written;
  - `home-note-editor`: the note editor has the smilies, and the placed note keeps its bold and its smiley;
  - the BBCode view and pasting are checked by the components' tests in Chromium;
  - the news, settings and images suites check the plain field without JavaScript.
- Before the clean run, the every-format check found that a space right after a quote or code box can go into the
  link or bold of the next word, as the browser's commands take it with that word. The space starts the line, where
  it is collapsed, so the site looks the same either way; the check writes the boxes last, and a component test
  accepts both forms.
