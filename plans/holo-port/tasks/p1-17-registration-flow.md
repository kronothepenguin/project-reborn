---
type: Task
title: Port Holo's registration flow to the browser
description: Rebuild the page in Holo's order and port registration.js with its gated details, tooltips, live checks, submit validation and age bubbles.
status: todo
phase: p1
depends_on: [p1-15, p1-16]
packages: [packages/cms]
holo: [source/holo/register.php, source/holo/templates/login/register_subheader.php, source/holo/web-gallery/static/js/registration.js]
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `registration.js`.

# Steps

- [ ] The page follows Holo: `1. Create Your Avatar`, `2. CHOOSE YOUR NAME`, `3. Your Details`, `Done` and
      `Exit registration`, and still works without JavaScript.
- [ ] Step 3 stays disabled under an overlay until the name passes the check, and changing the name closes it again.
- [ ] Tooltips for every field, with Holo's texts and states, and the red and green field states.
- [ ] Live password and email checks in the browser, so that the password is not sent before the form is.
- [ ] `Done` validates in Holo's order and shows `Sorry, registration failed…`.
- [ ] Under 6: the age bubble, whose `Cancel` goes to `/?ageLimit=true`.
- [ ] Up to 12: the parent or guardian's email bubble, never sent and never stored.
- [ ] The Terms link opens Holo's popup.
- [ ] Checked in a real Chromium.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
pnpm --filter @project-reborn/components test
```

Then drive the page through every state in a real Chromium, on the production binary.

# Notes

- None yet.
