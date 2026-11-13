---
type: Spec
title: Accounts
description: A visitor registers, signs in by habbo name, signs out, resets a forgotten password, changes the email and password, and owns, switches and archives several habbos.
status: done
projects: [packages/auth, packages/cms, packages/store, packages/scheduler, packages/components, tests/e2e]
---

# What

A user is the person, and owns one or more habbos ([0001](/decisions/holo-port/0001-user-owns-many-habbos.md)). A
visitor registers with a referral link or without, signs in with a habbo name and the user's password, signs out, and
resets a forgotten password by email. A banned user sees the ban page. The account tabs change the email and the
password, show the referral link, and add, switch and archive habbos. The landing and legal pages are Holo's.

# Behaviours

## Register

- A visitor sends the form with a free name, a password, an email, a birth date and the terms accepted: the account
  and its first habbo are made with `registration.startCredits`, and the visitor is signed in on `/me` (decision
  holo-port/0031).
- A visitor checks a taken, invalid or `MOD-` name: Holo's tip shows and the details stay closed.
- A visitor types a short password, two passwords that differ, or an email Holo's rule refuses, such as one with a `+`:
  the field shows Holo's tip.
- A visitor gives an email that already has an account: "This e-mail address already has an account. Please sign in
  and add a habbo there." (decision holo-port/0001)
- A visitor under 6 registers: `/?ageLimit=true` shows "You are too young to register.", checked by the server too.
- A visitor of 12 or under registers: the form asks for a parent's email, which stays in the browser.
- A visitor registers past `registration.maxPerIp` in `registration.ipWindowHours` from one address: the form is
  refused (decision holo-port/0021).
- A visitor registers from `/register?refer=<habbo name>`: a referral row names that habbo, and its user gets
  `referral.reward` credits while `referral.enabled` is on (decision holo-port/0036).
- A visitor registers with JavaScript off: the plain form works, with the default look.
- A form fails on the server: it answers 422 and keeps what was typed, except the passwords.

## Sign in and sign out

- A visitor signs in with a habbo name in any case and the owner's password: that habbo is active, on `/me` (decision
  holo-port/0002).
- A signed-in visitor opens `/`: the site sends it to `/me`.
- A visitor fails `auth.loginMaxFailures` times in `auth.loginWindowMinutes`: "Too many failed attempts. Please try
  again later.", and the right password is refused too.
- A visitor ticks remember me: a bubble explains it, and the session lasts `auth.rememberDays`.
- A signed-in visitor signs out with `POST /logout`: Holo's confirmation shows, and `OK` goes home.
- A signed-in visitor opens `GET /logout`: the session stays and the site sends it to `/me`; a guest reads "You are not
  logged in".

## Ban

- A banned user signs in with the right password: the ban page shows the reason and the end, or "This ban does not
  expire.", with 403.
- A user is banned while signed in: the next page ends the session and shows the ban.
- An address is banned: a holder of `housekeeping.access` still signs in from it.

## Forgot and reset

- A visitor gives a habbo name and the email of its account on `/forgot`: a mail greets the habbo with a reset link
  (decision holo-port/0018).
- A visitor gives any other pair: the same answer shows, and no mail goes out.
- An account holds `auth.resetMaxActive` unexpired links: no mail goes out, and the answer is the same (decision
  holo-port/0035).
- A visitor sets a new password through the link: the old one is refused, every session ends, and the link works once.
- A link reaches `auth.resetTokenMinutes`: it stops working and is deleted (decision holo-port/0044).
- A signed-in visitor opens `/forgot`: "Please log out to use this feature."

## Account tabs

- A user changes the email or the password with a wrong password or birth date: "The given information doesn't match
  what we have on record" (decision holo-port/0059).
- A user changes the email to one taken: "This e-mail address already has an account."
- A user saves the email tab: the newsletter choice is saved with it.
- A user changes the password: the session stays under a new token, and every other session and reset link ends
  (decision holo-port/0059).
- A user opens the referral tab: it shows the referral link and the reward per referral.

## Habbos

- A user adds a habbo with a free name and a look on `/account/habbos`: "<name> is ready to use.", and it shares the
  user's credits.
- A user with `registration.maxHabbosPerUser` habbos adds one: "You can have <n> habbos at most."
- A user with several habbos switches from the header: the session's active habbo changes.
- A user archives a habbo with the password: it leaves the list, cannot sign in, frees a slot, and its name stays taken
  (decision holo-port/0089).
- A user archives the active habbo or one that owns a group: it is refused (decision holo-port/0089).
- A user archives a habbo: its rooms go to the active habbo, and its hand and recycler go to the shared inventory
  (decision server/0124).
- A habbo is archived while another browser plays it: that session moves to the active habbo.

## Landing and legal pages

- A guest opens `/` with `features.landingPromo` on: the promo widget shows random habbos, and its button opens
  `/register` with that look.
- A guest opens `/` with `features.landingPromo` off: the join button shows, and the promo feed answers 404.
- A visitor opens `/disclaimer` or `/privacy`: Holo's terms or privacy text shows.
