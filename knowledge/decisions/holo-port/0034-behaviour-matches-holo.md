---
type: Decision
title: Behaviour matches Holo exactly; the code is new and safest
description: Every page behaves exactly as its HoloCMS page does, with new code, and differs only where Holo is unsafe, where a decision says so, or where Holo's behaviour is a bug.
status: accepted
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [scope, holo]
---

# Decision

- Every page behaves exactly as its Holo page does: flows, states, texts, defaults, validation rules and messages. When
  in doubt, do what Holo does; the agent does not simplify or improve a behaviour on its own.
- The code is new and as safe as possible. No PHP is carried over.
- A behaviour differs from Holo in three cases only:
  - keeping it would be unsafe, such as signing out on a `GET` or telling a stranger whether an account exists;
  - an accepted decision changes it, such as [0002](/decisions/0002-login-with-habbo-name.md) or
    [0021](/decisions/0021-dropped-and-kept-features.md);
  - it is a plain bug, such as a form that forgets what was typed because PHP renames its fields.
- Every difference is listed in [the differences](/reference/holo-differences.md), so that the user can veto it.

# Context

Reviewing P1, the user was offered a sign-out that keeps redirecting to `/` and answered: "exactly as holo, please make
every behavior exactly as holo cms behavior, but the code should be new and safest".

# Consequences

- P1 is compared with Holo page by page, and what differs is fixed before P2 starts.
- Later phases port behaviour from the PHP and its JavaScript, not only from the routes in the plan.
