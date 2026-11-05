---
type: Task
title: Buy groups from the Me page
description: The Me page's Groups habblet lists the habbo's groups and Hot Groups, and its Create/buy a Group button opens Holo's purchase dialog, which buys a group from the shared purse with its ledger row in one transaction.
status: todo
phase: p5
depends_on: [p5-01, p5-02, p5-03]
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holo/me.php, source/holo/randomgroups.php, source/holo/grouppurchase.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Habbos see their groups and buy new ones, as on Holo's `me.php`
([0082](/decisions/0082-group-limits-per-user-and-habbo.md), [0084](/decisions/0084-group-names-and-descriptions.md)).

# Steps

- [ ] The Groups habblet on `/me`: `My Groups`, selected, lists the active habbo's groups with their badges, and
  `Hot Groups` loads 12 random groups from `GET /groups/random`, with Holo's texts and the `Create/buy a Group`
  button.
- [ ] ⚡`groups/group-purchase`: Holo's dialog with the default badge, the price, the name and the description.
- [ ] `POST /groups` refuses with Holo's answers:
  - while `features.groupPurchase` is off;
  - without `groups.price` credits;
  - once the user's habbos own `groups.maxOwned` groups;
  - for a blank name or description, a name over 25 or a description over 200 characters, or a taken name.
- [ ] Otherwise, in one transaction, it debits the price with a `Group purchase` ledger row and creates the Regular
  group with Holo's default badge, the owner's admin row and the home with its Group information widget.
- [ ] The success answer links to the group.
- [ ] Go tests, and a browser suite `groups`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && node run.mjs groups me
```
