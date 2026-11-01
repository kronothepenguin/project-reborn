---
type: Decision
title: Referral farming stays open for now
description: Nothing stops a person from earning credits with their own referral link, beyond the per-IP registration limit, until the user asks for it.
status: accepted
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [referrals]
---

# Decision

- Registration keeps paying `referral.reward` for every referral. No guard is added.

# Context

A person can register through their own link up to `registration.maxPerIp` times per `registration.ipWindowHours`. The
user answered that this "is not that important now".

# Consequences

- The question is closed. It comes back only if the user raises it.
