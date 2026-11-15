---
type: Go Package
title: mail
description: Sends the hotel's mail through the SMTP server in the mail.* settings.
resource: packages/cms/internal/mail
---

# Use

- `mail.Send(ctx, to, subject, body)` delivers a plain text message to one address.
- With `mail.host` empty, `Send` answers `ErrDisabled` and sends nothing; the caller logs it.
- It upgrades to TLS when the server offers it, and it authenticates when `mail.username` is set.
- A whole conversation with the server takes at most 30 seconds.
- `internal/mail/mailtest` is a small SMTP server for tests.
