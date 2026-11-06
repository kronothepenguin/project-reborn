---
type: Task
title: Buy groups from the Me page
description: The Me page's Groups habblet lists the habbo's groups and Hot Groups, and its Create/buy a Group button opens Holo's purchase dialog, which buys a group from the shared purse with its ledger row in one transaction.
status: done
phase: p5
depends_on: [p5-01, p5-02, p5-03]
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holocms/me.php, source/holocms/randomgroups.php, source/holocms/grouppurchase.php]
timestamp: 2026-11-05T19:56:42+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:56:42+00:00"}
---

# Goal

Habbos see their groups and buy new ones, as on Holo's `me.php`
([0082](/decisions/0082-group-limits-per-user-and-habbo.md), [0084](/decisions/0084-group-names-and-descriptions.md)).

# Steps

- [x] The Groups habblet on `/me`: `My Groups`, selected, lists the active habbo's groups with their badges, and
  `Hot Groups` loads 12 random groups from `GET /groups/random`, with Holo's texts and the `Create/buy a Group`
  button.
- [x] ⚡`groups/group-purchase`: Holo's dialog with the default badge, the price, the name and the description.
- [x] `POST /groups` refuses with Holo's answers:
  - while `features.groupPurchase` is off;
  - without `groups.price` credits;
  - once the user's habbos own `groups.maxOwned` groups;
  - for a blank name or description, a name over 25 or a description over 200 characters, or a taken name.
- [x] Otherwise, in one transaction, it debits the price with a `Group purchase` ledger row and creates the Regular
  group with Holo's default badge, the owner's admin row and the home with its Group information widget.
- [x] The success answer links to the group.
- [x] Go tests, and a browser suite `groups`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && node run.mjs groups me
```

Results (2026-11-05T19:56:42+00:00):

- `gofmt` and `go vet` pass in `packages/cms` and `packages/store`, and so do the new tests; `pnpm build` passes, and
  `svelte-check` finds nothing in the new components. The whole of `packages/cms` was not run here: the next run, in
  [p5-05](/tasks/p5-05-group-page.md), found two Me page tests that read the page's data up to its last field, which
  the groups habblet's fields had moved. They are fixed in the commit after this task's, and the whole package passes.
- `node run.mjs groups me` passes all 50 checks. `groups` (14) signs Frank in with 30 credits and finds:
  - Holo's blue Groups box on My Groups, with its text, his group and its badge, which the CMS draws at 39 pixels;
  - Hot Groups loading the three groups at random with the purchase button;
  - the dialog's form with the price, the limits as `maxlength` and the new group's badge;
  - `Please fill in all fields!`, a taken name refused ignoring case, and Back bringing an empty form;
  - the purchase congratulating him with a link to the group, 20 credits taken with a `group` / `Group purchase` row,
    and the text kept as typed;
  - with 10 credits, the dialog opening on Holo's refusal with its link to the credits; with buying switched off, on
    Holo's switched-off text; and My Groups listing the new group after a reload.
  The screenshots `me-groups`, `me-hot-groups`, `group-purchase` and `group-purchased` were read by eye.
- The CMS tests buy a group and find the group, the owner's admin row, the home with its Group information widget at
  25, 25 and 5, the debit and its ledger row; refuse each of Holo's cases with nothing written; take the price and
  the lengths from the settings, counting characters; refuse a guest; list the active habbo's groups on the Me page,
  and another habbo's after a switch; and give twelve hot groups of thirteen.
- Breaking these on purpose fails a test: no debit, `>` for the owned limit, the owned groups of one habbo, the name
  in bytes, no trimming, a blank description let through, the store's ledger reason, the owner as a member, the
  switch or the credits not checked, the Me page listing habbo 1's groups, Hot Groups never loading, and Back keeping
  the name.

# Notes

- The dialog opens on what `grouppurchase.php` checked before its form, from the Me page's data, and the purchase
  checks it all again in its transaction, as Holo's confirmation did.
- The refusals come back as codes, which the dialog words as Holo did, with its link and its italics.
- The Group information widget goes where Holo wrote it on a group's first view: 25, 25, layer 5, the default skin.
- `GetGroupHome` now takes a plain id, as `CreateGroupHome` does.
- Texts spelled correctly: `Purchasing groups has been disabled by the Hotel Management.`, `A group with this name
  already exists.` ([0084](/decisions/0084-group-names-and-descriptions.md)) and `An unknown error occurred.`
- The Me page's Tags box is orange where Holo's is green; [p5-20](/tasks/p5-20-tags-box-green.md) follows it up.

