---
type: Reference
title: Password reset
description: How a reset link is made, limited, spent and deleted.
---

# Password reset

- `CreateReset(ctx, db, name, email)` returns the `Reset` to mail, with its token valid for `auth.resetTokenMinutes`,
  when the habbo belongs to the account of that address. For any other pair, and while the account holds
  `auth.resetMaxActive` unexpired links, it returns nil and no error, so a caller can answer the same way in every case
  (decisions holo-port/0018 and holo-port/0035).
- A new link leaves the earlier ones valid until one of them is used.
- `DeleteExpiredResets(ctx, db)` removes the links past `auth.resetTokenMinutes`. A program that offers password resets
  runs it on the scheduler (decision holo-port/0044).
- The caller builds the link (`site.url` + `/reset/<token>`) and sends the mail.
- `ResetPassword(ctx, db, token, password)` validates the password, then sets it once: every reset of the user is
  deleted and every session of the user ends. An unknown, used or expired token gives `ErrInvalidReset`.
