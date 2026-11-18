---
type: Reference
title: Rules
description: What a service is, the order constructors, services, Inject, run, and what a call carries.
---

# Rules

- A service exists for what the game must show live, such as a habbo's look, for what only the game knows, such as who
  is in the hotel, and for what only the game does, such as opening its doors. A program reads the rest from the store
  when it needs it.
- The order is constructors, services, `Inject`, run. A service may hold the app it calls, so it is built once the apps
  are. Each app then receives its services through `Inject`, once, after `New` and before `Mount`.
- A call carries ids only, such as `SendLook(ctx, avatarID)` or `AreOnline(ctx, ids)`. The change is saved before the call, and the game reads
  the store again.
- Services only communicate and store nothing. A service that needs to store something is decided when it comes.
- A service no runner injected is nil in the app's `Services`, and the app skips its calls. The change stays saved, as
  when a call fails, and the habbo sees it at its next login.
