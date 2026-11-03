---
type: Task
title: Edit profile tags
description: POST /me/tags and POST /me/tags/{tag}/delete add and remove the active habbo's tags with Holo's rules, from the tag panel of the profile widget.
status: todo
phase: p3
depends_on: [p3-04]
packages: [packages/cms, packages/store]
holo: [source/holo/tags_ajax.php, source/holo/user_profile.php]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

A habbo tags itself, and borrows the tags of others, as on Holo's profile widget.

# Steps

- [ ] Holo's rules: 2 to 20 letters and digits, lower case, no repeats, at most `homes.maxTags`.
- [ ] Holo's answers: `invalidtag`, the tag limit text.
- [ ] The panel adds, removes and borrows tags without reloading the page.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
