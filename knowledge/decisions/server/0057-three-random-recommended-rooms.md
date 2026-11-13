---
type: Decision
title: The recommended rooms are three random habbo rooms
description: GET_RECOMMENDED_ROOMS gets three habbo rooms drawn at random each time the client asks, as Holo did.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, navigator]
---

# Decision

- `GET_RECOMMENDED_ROOMS` (264) gets 351 with three habbo rooms drawn at random each time the client asks, or as many
  as there are when there are fewer.

# Context

Offered three random rooms, the busiest rooms, or staff picks, the user chose "Three random rooms (Recommended)": "As
Holo: three habbo rooms drawn at random each time the client asks."

# Consequences

- s3-04 answers it.
