---
type: Decision
title: Installer administrator, start credits and habbo names
description: "The installer sets registration.startCredits and creates the administrator from a habbo name, email, password and birth date with Holo's figure and 5000 credits; habbo names take letters, digits and - = ? ! @ : . , up to 24 characters."
status: accepted
timestamp: 2026-10-28T01:18:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:18:54+00:00"}
tags: [installer, settings, habbos]
---

# Decision

- `registration.startCredits` is declared in P0, so the installer's site step can set it. Its default is 500,
  Holo's `cms_system` seed, and it allows 0 to 1,000,000. P1 uses it for the welcome credits.
- The administrator step asks for a habbo name, an email, a password with its confirmation and a birth date.
- The administrator's habbo is created with:
  - Holo's installer figure `hr-802-61.hd-190-1.ch-260-62.lg-280-110.sh-295-91.fa-1207-103`;
  - gender `M`;
  - a wallet of 5000 credits.

  All of it can be changed later from the account pages.
- Habbo names are 1 to 24 characters of ASCII letters, digits and `- = ? ! @ : . ,`, unique ignoring case. Holo
  accepted only letters and digits; this is retail Habbo's wider set.

# Context

The planned site step listed start credits, whose setting belonged to P1. Holo's installer asked only for a name, an
email and a password, and stored a fixed birth date, figure and 5000 credits. The user chose to:

- declare the setting now;
- ask for the birth date;
- allow Habbo's wider name characters.

# Consequences

- P1 registration follows the same name rule.
- The administrator's 5000 credits get a `registration` ledger row, as every habbo's first credits do.
