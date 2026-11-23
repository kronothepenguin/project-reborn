---
type: Go Package
title: mail
description: Sends the hotel's mail through the SMTP server in the mail.* settings.
resource: packages/cms/internal/mail
---

# What it sends

The mail server sends one mail: the "Forgot your password?" link of `/forgot`, as Holo's `forgot.php` sent it
(decision holo-port/0018). Housekeeping edits its settings in the "Password reset mail" form. The minimail, the
messages between habbos, stays in the database and needs no mail server.

# Use

- `mail.Send(ctx, to, subject, body)` delivers a plain text message to one address.
- With `mail.host` empty, `Send` answers `ErrDisabled` and sends nothing; the caller logs it.
- It upgrades to TLS when the server offers it, and it authenticates when `mail.username` is set.
- A whole conversation with the server takes at most 30 seconds.
- `internal/mail/mailtest` is a small SMTP server for tests.
