---
type: Task
title: Port Holo's registration flow to the browser
description: Rebuild the page in Holo's order and port registration.js with its gated details, tooltips, live checks, submit validation and age bubbles.
status: done
phase: p1
depends_on: [p1-15, p1-16]
packages: [packages/cms]
holo: [source/holo/register.php, source/holo/templates/login/register_subheader.php, source/holo/web-gallery/static/js/registration.js]
timestamp: 2026-11-01T18:49:59+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:49:59+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `registration.js`.

# Steps

- [x] The page follows Holo: `1. Create Your Avatar`, `2. CHOOSE YOUR NAME`, `3. Your Details`, `Done` and
      `Exit registration`, and still works without JavaScript.
- [x] Step 3 stays disabled under an overlay until the name passes the check, and changing the name closes it again.
- [x] Tooltips for every field, with Holo's texts and states, and the red and green field states.
- [x] Live password and email checks in the browser, so that the password is not sent before the form is.
- [x] `Done` validates in Holo's order and shows `Sorry, registration failed…`.
- [x] Under 6: the age bubble, whose `Cancel` goes to `/?ageLimit=true`.
- [x] Up to 12: the parent or guardian's email bubble, never sent and never stored.
- [x] The Terms link opens Holo's popup.
- [x] Checked in a real Chromium.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
pnpm --filter @project-reborn/components test
```

Then drive the page through every state in a real Chromium, on the production binary.

Results (2026-11-01T18:49:59+00:00):

- The CMS builds with its islands, and `gofmt`, `go vet` and `go test -race` pass in `packages/cms`. 116 component tests
  pass.
- A script drove the production binary in a real Chromium through 66 checks with no failure, no script error and an empty
  server log:
  - step order, title, closed details, overlay and its tooltip, focus on the name;
  - `Done` with no name, a taken name, an invalid one, a reserved one, and `Enter` and `Tab` on a free one;
  - every password and email tooltip and field state, and emptying the first field clearing the second;
  - `Done` with no birthday or terms, in Holo's order, and each mark clearing;
  - age 3: the bubble, `Cancel` and `/?ageLimit=true`;
  - age 10: the parent's email bubble, refusing the visitor's own address and a bad one, and letting a good one through,
    with that address nowhere in the database file;
  - changing the name closing the details again, and the Terms popup;
  - the editor's look saved after waiting past its start-up block;
  - without JavaScript: open details, no check button, the server's errors, and a registration with the default look;
  - a failed post keeping the name and reopening the details.
- The regression test for the disabled `Done` button failed when the old behaviour was put back.

# Notes

- This task fixed a bug from [p1-04](/tasks/p1-04-registration.md). The vendored editor reports `setAllowedToProceed(false)`
  until it is first touched, and the page disabled its button on that, so a visitor who kept the suggested look could not
  finish. Holo's `registration.js` ignores that call, and only its `settings.js` listens. The island now registers what
  `registration.js` registers, and [P2](/phases/p2-me-account.md) records the rest for `/account/looks`.
- Holo trapped `Tab` in the name field even with nothing to check. Here `Tab` is only stopped when a check runs.
- Holo posted the password and the address to `ajax_password.php` and `ajax_emailcheck.php` as they changed. The same rules
  run in the browser, so a password stays on the page until the form is sent.
- The parent's address never had a place in Holo's database, and `register.php` ignored it. Here the field has no `name`, so
  it never leaves the browser.
- With JavaScript off the page shows the plain form, which Holo's Flash fallback could not submit.
- `name-check.svelte` is gone: `registration-form.svelte` holds the whole flow.
