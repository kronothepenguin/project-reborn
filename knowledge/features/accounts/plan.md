---
type: Plan
title: "Accounts: how"
description: packages/auth holds passwords, sessions, accounts and resets, and the CMS serves the pages that use them.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/auth` | Passwords, sign-in, sessions, bans at sign-in, account and habbo creation, resets, switching and archiving habbos (`packages/auth/knowledge/index.md`) |
| `packages/cms` | The landing, register, sign-out, forgot, reset, ban, legal and account pages; reset mail through `internal/mail` |
| `packages/store` | The `users`, `avatars`, `credentials`, `sessions`, `password_resets`, `referrals` and `login_attempts` tables and their queries |
| `packages/scheduler` | Runs the deletion of expired sessions and reset links every minute |
| `packages/components` | The primitives of the forms: `Checkbox`, `Select`, `Notice`, `Avatar`, `Icon`, `Bubble` |
| `tests/e2e` | The suites `signed-out`, `register`, `details` and `habbos` |

# Decisions

- [One user owns many habbos](/decisions/holo-port/0001-user-owns-many-habbos.md) — A user is the person;
  credentials and sessions belong to the user, and a session records the active habbo.
- [Login with habbo name and password](/decisions/holo-port/0002-login-with-habbo-name.md) — The login box takes a
  habbo name and the owner's password, and the named habbo becomes the active one.
- [Passwords hashed with argon2id](/decisions/holo-port/0005-argon2id-passwords.md) — argon2id from
  golang.org/x/crypto, stored as PHC strings that carry their parameters.
- [Password reset by email](/decisions/holo-port/0018-password-reset-by-email.md) — Forgot password mails a
  single-use, expiring link, with the same answer for every input.
- [Dropped and kept Holo features](/decisions/holo-port/0021-dropped-and-kept-features.md) — A per-address limit
  replaces the captcha, and refer-a-friend pays for real.
- [packages/auth creates accounts and habbos](/decisions/holo-port/0030-accounts-created-in-auth.md) — The helpers
  and the name, email and birth-date rules live in packages/auth and take the caller's transaction.
- [P1 signs in to a minimal /me page](/decisions/holo-port/0031-p1-minimal-me-page.md) — Sign-in and registration
  land on `/me`, and `/` sends signed-in visitors there.
- [Behaviour matches Holo exactly; the code is new and
  safest](/decisions/holo-port/0034-behaviour-matches-holo.md) — Every page behaves as its Holo page, and the
  differences are listed in [the differences](/sources/holocms/differences.md).
- [Reset mail is limited per account](/decisions/holo-port/0035-reset-mail-limit.md) — An account holds at most
  `auth.resetMaxActive` unexpired links.
- [Referral farming stays open for now](/decisions/holo-port/0036-referral-farming-accepted.md) — Registration pays
  `referral.reward` for every referral, with the per-address limit as the only guard.
- [Expired reset links are deleted when they expire](/decisions/holo-port/0044-expired-reset-links-deleted.md) — A
  link works for `auth.resetTokenMinutes` and a scheduled task deletes it at that age.
- [Expired sessions are deleted on a schedule](/decisions/holo-port/0050-expired-sessions-deleted.md) — Every program
  that serves sessions runs the task that deletes them.
- [Account forms keep the birth date and the session](/decisions/holo-port/0059-account-forms.md) — The email and
  password forms ask for the birth date, and a password change keeps the session under a new token.
- [Habbos are archived, and the forum shows them as
  archived](/decisions/holo-port/0089-archived-habbos-show-as-archived.md) — An archived habbo is hidden, keeps its
  rows and name, and staff can restore it.
- [An archived habbo's rooms move to the active
  habbo](/decisions/server/0124-an-archived-habbos-rooms-move-to-the-active-habbo.md) — Its rooms go to the active
  habbo, and its hand and recycler to the shared inventory.

# Notes

- Registration shows every problem of a form at once. The per-address limit comes first and stops there.
- An address-banned visitor can register, and the sign-in right after shows the ban.
- The referral is written in the registration's transaction, so a failed registration pays nothing.
- A habbo added on `/account/habbos` starts without credits, so one account cannot collect the welcome credits once per
  habbo.
- `mail.password` sits in the `settings` table in clear, because SMTP needs it.
- One `INSERT … SELECT … WHERE` counts the open links and adds the new one, so requests at the same moment cannot pass
  `auth.resetMaxActive` together. The setting allows 1 to 100.
- A link stops working at the exact moment it expires, because the query compares `expires_at`; the task deletes it
  within the minute.
- Holo's year list runs to 1900 while its rule refuses years before 1920, and the port keeps both.
- `GetAvatarByName` still reads archived habbos, because the check of a free name needs them.
- Staff lists read names from live habbos, and the staff log keeps the old names.
- The terms page keeps Holo's "The Terms of Service are not yet available." until the user writes real terms.
