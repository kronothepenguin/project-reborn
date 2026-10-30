---
type: Task
title: Reset a forgotten password by email
description: Add the mail settings and the internal mail package, and the forgot and reset pages built on auth.CreateReset and auth.ResetPassword.
status: todo
phase: p1
depends_on: [p1-01, p1-02]
packages: [packages/virtual, packages/cms]
holo: [source/holo/forgot.php, source/holo/locale/en/login.php]
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
---

# Goal

Implement [0018](/decisions/0018-password-reset-by-email.md).

# Steps

- [ ] Declare `mail.host`, `mail.port` (default 587), `mail.username`, `mail.password` and `mail.from`. An empty
      `mail.host` means that no mail goes out.
- [ ] `packages/cms/internal/mail`: sends through `net/smtp` with the settings, with a timeout.
- [ ] `GET /forgot` and `POST /forgot` (`forgot.astro`, `internal/router/forgot.go`), with Holo's texts from
      `locale/en/login.php`. The form asks only for the email, as `auth.CreateReset` does.
- [ ] `POST /forgot` always shows the same answer. The mail goes out in the background with the link
      `site.url` + `/reset/<token>`, so that the response time does not reveal whether the address exists either. A
      failed send is logged.
- [ ] `GET /reset/{token}` and `POST /reset/{token}` (`reset/token.astro`, `internal/router/reset.go`):
  - the password and its confirmation go to `auth.ResetPassword`;
  - `ErrPasswordLength` shows the form again;
  - `ErrInvalidReset` says that the link is invalid or expired;
  - a success says that the password changed and links to sign in.
- [ ] Signed-in visitors are redirected to `/me` from both pages, and maintenance applies to them.
- [ ] Tests in `packages/cms`, with a fake SMTP server:
  - the mail and its link, for a known address;
  - no mail and the same answer, for an unknown one;
  - `mail.host` empty;
  - each reset outcome.
- [ ] Docs: the Runtime section of `packages/cms/AGENTS.md`.

# Verification

```sh
pnpm --filter @project-reborn/cms build
grep -c '\[\[' packages/cms/dist/forgot.html packages/cms/dist/reset/token.html
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
```

# Notes

- Open question before starting: `POST /forgot` has no limit, so anyone can make the hotel send repeated mail to one
  address. Holo had the same problem.
- `net/smtp`'s `PlainAuth` refuses to send credentials without TLS, except to localhost.
