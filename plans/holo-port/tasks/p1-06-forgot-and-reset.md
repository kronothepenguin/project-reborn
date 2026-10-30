---
type: Task
title: Reset a forgotten password by email
description: Add the mail settings and the internal mail package, and the forgot and reset pages built on auth.CreateReset and auth.ResetPassword.
status: done
phase: p1
depends_on: [p1-01, p1-02]
packages: [packages/virtual, packages/cms]
holo: [source/holo/forgot.php, source/holo/locale/en/login.php]
timestamp: 2026-10-30T22:30:28+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:30:28+00:00"}
---

# Goal

Implement [0018](/decisions/0018-password-reset-by-email.md).

# Steps

- [x] Declare `mail.host`, `mail.port` (default 587), `mail.username`, `mail.password` and `mail.from`. An empty
      `mail.host` means that no mail goes out.
- [x] `packages/cms/internal/mail`: sends through `net/smtp` with the settings, with a timeout.
- [x] `GET /forgot` and `POST /forgot` (`forgot.astro`, `internal/router/forgot.go`), with Holo's texts from
      `locale/en/login.php`. The form asks only for the email, as `auth.CreateReset` does.
- [x] `POST /forgot` always shows the same answer. The mail goes out in the background with the link
      `site.url` + `/reset/<token>`, so that the response time does not reveal whether the address exists either. A
      failed send is logged.
- [x] `GET /reset/{token}` and `POST /reset/{token}` (`reset/token.astro`, `internal/router/reset.go`):
  - the password and its confirmation go to `auth.ResetPassword`;
  - `ErrPasswordLength` shows the form again;
  - `ErrInvalidReset` says that the link is invalid or expired;
  - a success says that the password changed and links to sign in.
- [x] Signed-in visitors are redirected to `/me` from both pages, and maintenance applies to them.
- [x] Tests in `packages/cms`, with a fake SMTP server:
  - the mail and its link, for a known address;
  - no mail and the same answer, for an unknown one;
  - `mail.host` empty;
  - each reset outcome.
- [x] Docs: the Runtime section of `packages/cms/AGENTS.md`.

# Verification

```sh
pnpm --filter @project-reborn/cms build
grep -c '\[\[' packages/cms/dist/forgot.html packages/cms/dist/reset/token.html
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
```

Results (2026-10-30T22:30:28+00:00):

- The CMS builds, and `dist/forgot.html` and `dist/reset/token.html` keep their `[[ ]]` placeholders.
- `gofmt`, `go vet` and `go test -race` pass in `packages/cms` and `packages/virtual`.
- `packages/cms/internal/mail` has tests for the message, an encoded subject, authentication, a missing host or sender,
  a header smuggled into the recipient, and a server that never answers.
- The CMS tests use a small SMTP server (`internal/mail/mailtest`) and follow a mailed link through to signing in with
  the new password.
- Mutation checks: each of these, applied on purpose, failed a test:
  - mailing the typed address instead of the account's;
  - no habbo names in the mail;
  - ignoring the password confirmation;
  - `POST /forgot` open to signed-in visitors;
  - the reset page outside maintenance.
- One mutation was not caught, and it changes nothing visible: without the early return for an unknown address,
  `GetUserByEmail` fails on the next line, so no mail goes out and only a log line differs.
- End-to-end run of the production binary against a throwaway SMTP server:
  - `/forgot` answered the same way for a known and an unknown address, and only one mail went out;
  - the mail held the subject, the habbo name and the link;
  - a short password and a differing confirmation answered 422 with their texts;
  - the link changed the password once, and a second use said that it is invalid or has expired;
  - the old password was refused, the new one signed in, and the server log stayed free of errors.

# Notes

- Open question before starting: `POST /forgot` has no limit, so anyone can make the hotel send repeated mail to one
  address. Holo had the same problem.
- `net/smtp`'s `PlainAuth` refuses to send credentials without TLS, except to localhost.
- Sign-in uses a habbo name and the login box says "password/username", so the mail lists the account's habbos. Holo's
  mail carried the username too.
- `mail.Send` drives `net/smtp`'s client itself, because `smtp.SendMail` has no timeout.
- The signed-in redirect moved into the `router.Guest` middleware, since eight handlers needed it.
- The answer says "If this address has an account, an e-mail is on its way", because Holo's "E-Mail send!" would be false
  for an unknown address.
- `mail.password` sits in the `settings` table as written, because SMTP needs it in clear. Housekeeping must mask it.
- The open question above stands: nothing limits `POST /forgot`. No limit is in the plan, so none was added.
