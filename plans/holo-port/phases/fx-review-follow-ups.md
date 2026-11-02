---
type: Phase
title: FX Review follow-ups
description: The changes the user decided in the review of P2 and HK-A, before HK-B builds on them.
status: active
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
tags: [fx, review]
---

# Goal

Everything decided in the review of P2 and HK-A works, and CI guards it, before [HK-B](/phases/hk-b-users-moderation.md)
starts.

# Scope

- CI, releases and the browser suites in the repository ([0062](/decisions/0062-ci-and-releases.md)).
- The wallet, the club and the home inventory on the user ([0056](/decisions/0056-wallet-club-and-inventory-per-user.md)).
- Direct attributes, levels and Holo's ranks as groups ([0053](/decisions/0053-attributes-on-groups-and-users.md),
  [0054](/decisions/0054-access-groups-are-holos-ranks.md), [0055](/decisions/0055-staff-levels.md)).
- The settings refresh and the Housekeeping Address ([0051](/decisions/0051-one-machine-and-a-refresh.md),
  [0052](/decisions/0052-installer-has-no-modes.md)).
- The account forms, the looks of housekeeping, archiving habbos and the art
  ([0059](/decisions/0059-account-forms.md), [0060](/decisions/0060-housekeeping-components.md),
  [0058](/decisions/0058-habbos-are-archived.md), [0061](/decisions/0061-art-in-the-repository.md)).
- Local databases must be recreated once `fx-04` lands.

# Exit criteria

- Every gate and browser suite passes from a clean checkout, by one command each.
- A settings change reaches a running CMS within `cms.refresh` seconds.
- All the habbos of a user share one purse and one club membership.
- Nobody can edit a group above their level, and the guard holds with direct attributes.
- A built CMS binary serves the art with no network.

# Tasks

- [fx-01 Move the browser suites into the repository](/tasks/fx-01-browser-suites.md) — todo
- [fx-02 Run every gate on GitHub Actions](/tasks/fx-02-ci-workflow.md) — todo
- [fx-03 Publish releases on tags](/tasks/fx-03-release-workflow.md) — todo
- [fx-04 Give the wallet, the club and the home inventory to the user](/tasks/fx-04-user-wallet-club-inventory.md) — todo
- [fx-05 Give attributes to users](/tasks/fx-05-user-attributes.md) — todo
- [fx-06 Add levels to access groups](/tasks/fx-06-staff-levels.md) — todo
- [fx-07 Seed Holo's ranks in the installer](/tasks/fx-07-seed-ranks.md) — todo
- [fx-08 Delete access groups](/tasks/fx-08-delete-access-groups.md) — todo
- [fx-09 Ask for the Housekeeping Address in the installer](/tasks/fx-09-housekeeping-address.md) — todo
- [fx-10 Refresh the CMS settings on schedule](/tasks/fx-10-settings-refresh.md) — todo
- [fx-11 Keep the session on a password change](/tasks/fx-11-password-keeps-session.md) — todo
- [fx-12 Send banned staff to the CMS](/tasks/fx-12-banned-staff.md) — todo
- [fx-13 Give housekeeping components their looks](/tasks/fx-13-housekeeping-components.md) — todo
- [fx-14 Archive habbos](/tasks/fx-14-archive-habbos.md) — todo
- [fx-15 Bring the art into the repository](/tasks/fx-15-art-in-the-repository.md) — todo
- [fx-16 Verify FX](/tasks/fx-16-exit-check.md) — todo
