---
type: Task
title: Create the port state bundle and the tracking skill
description: Seed plans/holo-port from the approved plan and add the tracking-holo-port skill so the port can be resumed in any session.
status: done
phase: p0
depends_on: []
packages: [plans/holo-port, .agents/skills/tracking-holo-port]
holo: []
timestamp: 2026-10-27T20:59:40+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:59:40+00:00"}
---

# Goal

`plans/holo-port/` holds the decisions, phases, P0 tasks, reference documents, rules and log of the port, and
`.agents/skills/tracking-holo-port/SKILL.md` tells agents how to use it.

# Steps

- [x] Root `index.md` (with `okf_version: "0.2"`), `rules.md` and `log.md`.
- [x] Decisions 0001–0022 and `decisions/index.md`.
- [x] The ten phase files and `phases/index.md`.
- [x] Tasks p0-01 to p0-11 and `tasks/index.md`.
- [x] Reference documents (pages, housekeeping, database, colours, protocols) and `reference/index.md`.
- [x] `.agents/skills/tracking-holo-port/SKILL.md`.
- [x] Bundle checks from [the rules](/rules.md#checks) pass.

# Verification

```sh
cd plans/holo-port
# every non-index file has a non-empty type
for f in $(find . -name '*.md' ! -name index.md ! -name log.md); do grep -q '^type: .\+' "$f" || echo "missing type: $f"; done
# every concept is listed in its directory index
for f in $(find . -mindepth 2 -name '*.md' ! -name index.md); do grep -q "$(basename "$f")" "$(dirname "$f")/index.md" || echo "unlisted: $f"; done
# every bundle-absolute link resolves (placeholders such as /tasks/<file> are skipped)
grep -rhoE '\]\(/[^)#]+' . | sed 's/^](\///' | grep -v '<' | sort -u | while read -r p; do [ -e "$p" ] || echo "broken: $p"; done
```

Results (2026-10-27T20:59:40+00:00):

- No missing `type`, no unlisted concept, no broken link.
- Every frontmatter block parses as YAML (checked with PyYAML) and the root `index.md` declares
  `okf_version: "0.2"`.
- The linked heading anchors exist (`#new-schema`, `#holo-settings`, `#promo-habbos-xml`, `#group-badges`,
  `#housekeeping`, `#bbcode`, `#checks`).
- 55 files: 22 decisions, 10 phases, 11 tasks, 5 reference documents, the rules, the log and 6 indexes.

# Notes

- The plan approved on 2026-10-27 is the source of this bundle.
- The first link check flagged the placeholder examples in `rules.md`; the command now skips placeholders.
