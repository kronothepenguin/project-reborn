---
type: Decision
title: A help request's subject takes 50 characters, and its question help.messageMaxLength
description: The server checks a help request's subject for the 50 characters of Holo's field, and its question against a new setting, help.messageMaxLength, 65535 by default, the forum's post limit, refusing a longer question with "Your question may not be longer than <n> characters."
status: accepted
timestamp: 2026-11-09T18:02:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:02:12+00:00"}
tags: [help, settings, holo]
---

# Decision

- The subject keeps the 50 characters of Holo's field, and the server checks them too.
- The question takes up to the new setting `help.messageMaxLength`, 65535 by default, the forum's post limit. A
  longer question is refused with "Your question may not be longer than <n> characters.", `<n>` being the setting.

# Context

Holo's form limited the subject to 50 characters in the browser only, and its server took anything; the question had no
limit at all. Offered checking both, checking the subject only, or keeping Holo's limits, the user chose "Subject 50,
question by setting (Recommended)": "The server also checks the subject's 50 characters, and the question gets a new
setting, help.messageMaxLength (65535 by default, the forum's post limit), refused with e.g. \"Your question may not be
longer than 65535 characters.\" Safest against huge requests."

# Consequences

- P7 declares `help.messageMaxLength` and labels it in housekeeping's settings.
- [Holo's differences](/sources/holocms/differences.md) lists both checks.
