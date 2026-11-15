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
- A visitor opens `/register`: the newsletter starts ticked, and the choice sent is saved with the account.
- A visitor opens `/register`: the date lists offer the days 1 to 31, the months by name and the years back to 1900.
- A visitor opens `/register` with a look from the landing promo: the editor starts on that look, and a bad look is
  ignored.
- A visitor opens the registration form: the name field has the focus with Holo's tip, and the details wait closed under
  an overlay.
- A visitor checks a taken, invalid or `MOD-` name: Holo's tip shows and the details stay closed.
- A visitor checks a name with Enter, Tab or the button: it is checked in place; a free name opens the details and moves
  the focus to the password, and changing the name closes them.
- A visitor types a short password, two passwords that differ, or an email Holo's rule refuses, such as one with a `+`:
  the field shows Holo's tip.
- A visitor types in a field or leaves it: it turns red or green at once with Holo's tip, and a new value or a click
  elsewhere clears the mark.
- A visitor presses Done with fields missing: the red box shows, and the tip names the last failing field in Holo's
  order.
- A visitor gives an email that already has an account: "This e-mail address already has an account. Please sign in
  and add a habbo there." (decision holo-port/0001)
- A visitor under 6 registers: `/?ageLimit=true` shows "You are too young to register.", checked by the server too.
- A visitor under 6 presses Done: Holo's bubble says it is too young.
- A visitor of 12 or under registers: the form asks for a parent's email, which stays in the browser.
- A child gives its own address or an invalid one as the parent's: the form is refused.
- A visitor registers past `registration.maxPerIp` in `registration.ipWindowHours` from one address: the form is
  refused (decision holo-port/0021).
- A visitor registers from a banned address: the ban shows as the form's error with 422, and no account is made.
- A visitor registers from `/register?refer=<habbo name>`: a referral row names that habbo, and its user gets
  `referral.reward` credits while `referral.enabled` is on (decision holo-port/0036).
- A visitor opens `/register?refer=<habbo name>`: the form carries the referrer through a refusal.
- A visitor registers with a referral that names an unknown or archived habbo, or the registration is refused: no
  referral is written.
- A visitor registers with JavaScript off: the plain form works, with the default look.
- A form fails on the server: it answers 422 and keeps what was typed, except the passwords.
- A visitor sends the form with a blank, long or invalid name, a long password, an impossible birth date or one before
  1920 or in the future, the terms unticked, or a look that is not a figure and a gender: the form is refused, and
  nothing is made.
- A visitor sends the form with several problems: every problem shows at once.
- The server refuses the form: it comes back with the name checked and the details open.
- A visitor opens the terms from the form: they open in a new window, and the form stays.
- A visitor registers: the look the editor drew is saved.
- The look editor starts: Done stays enabled.
- Requests arrive at the same moment: every limit holds, one habbo per name, one referral reward per account, and no
  habbo past the limit.

## Sign in and sign out

- A visitor signs in with a habbo name in any case and the owner's password: that habbo is active, on `/me` (decision
  holo-port/0002).
- A user whose password was saved under older hash settings signs in: the sign-in succeeds.
- A visitor signs in with a blank field, an unknown habbo or a wrong password: one Holo message shows on the landing
  page with 422, no session starts, and the name stays as typed, spaces included.
- A signed-in visitor opens `/`: the site sends it to `/me`.
- A signed-in visitor opens `/register` or a reset link: the site sends it to `/me`.
- A guest opens a page or sends a form that needs a session: it is sent to sign in at `/`, and a call from a page's
  script answers 401.
- A visitor fails `auth.loginMaxFailures` times in `auth.loginWindowMinutes`: "Too many failed attempts. Please try
  again later.", and the right password is refused too.
- A visitor ticks remember me: a bubble explains it, and the session lasts `auth.rememberDays`.
- `auth.secureCookies` is off: the session cookie is sent without Secure.
- A session stays idle past its lifetime, or a browser sends an unknown or malformed cookie: the visitor is a guest, and
  the cookie is cleared.
- A signed-in visitor opens a page: the session's lifetime starts again.
- A session expires: the next scheduled run deletes it.
- A signed-in visitor signs out with `POST /logout`: Holo's confirmation shows, and `OK` goes home.
- A signed-in visitor opens `GET /logout`: the session stays and the site sends it to `/me`; a guest reads "You are not
  logged in".

## Ban

- A banned user signs in with the right password: the landing page shows "You have been banned!" with the reason and the
  end, or "This ban does not expire.", as the sign-in error with 422, and no session starts.
- A banned user signs in with a wrong password: the wrong-password message shows, and the ban stays hidden.
- A user holds a timed ban and a permanent ban: the ban shown is the permanent one.
- A user is banned while signed in: the next page ends the session and shows the ban page with the reason and the end,
  with 403.
- A banned user signs out: the ban shows, and the session ends.
- A banned user opens a page while the site is closed: the ban shows in place of the maintenance page, and the session
  ends.
- An address is banned: a holder of `housekeeping.access` still signs in from it.

## Forgot and reset

- A visitor gives a habbo name and the email of its account on `/forgot`: a mail greets the habbo with a reset link
  (decision holo-port/0018).
- A visitor gives any other pair: the same answer shows, and no mail goes out.
- Mail is off and a visitor sends `/forgot`: the same answer shows.
- A visitor sends `/forgot`: the form keeps what was typed.
- An account holds `auth.resetMaxActive` unexpired links: no mail goes out, and the answer is the same (decision
  holo-port/0035).
- A visitor sets a new password through the link: the old one is refused, every session ends, and the link works once.
- A visitor opens a malformed or unknown reset link: it is refused.
- A visitor types new passwords that differ or break the password rule through a link: the reset is refused, and the
  link keeps working.
- A visitor sets a new password through one of several links: the other links stop working.
- A link reaches `auth.resetTokenMinutes`: it stops working and is deleted (decision holo-port/0044).
- A signed-in visitor opens `/forgot`: "Please log out to use this feature."

## Account tabs

- A user opens `/account`: the looks tab opens.
- A user opens the email tab: it shows the address and the newsletter choice.
- A user changes the email or the password with a wrong password or birth date: "The given information doesn't match
  what we have on record" (decision holo-port/0059).
- A user changes the email to one taken: "This e-mail address already has an account."
- A user changes the email to an invalid one: Holo's message shows, and the email stays.
- A user changes the password to one outside 6 to 25 characters or unlike its confirmation: Holo's message shows, and
  the password and the session stay.
- A user saves the email tab: the newsletter choice is saved with it.
- A user changes the password: the session stays under a new token, and every other session and reset link ends
  (decision holo-port/0059).
- A user opens the referral tab: it shows the referral link and the reward per referral.

## Habbos

- A user adds a habbo with a free name and a look on `/account/habbos`: "<name> is ready to use.", and it shares the
  user's credits.
- A user adds a habbo with a taken, blank, invalid or `MOD-` name, or a bad look: Holo's message shows, and no habbo is
  made.
- A user adds a habbo with no look sent: the habbo gets the default look.
- A user with `registration.maxHabbosPerUser` habbos adds one: "You can have <n> habbos at most."
- A user with several habbos switches from the header: the session's active habbo changes.
- A user switches to or archives a habbo of another user, or one already archived: it is refused with 403.
- A user archives a habbo with the password: it leaves the list, cannot sign in, frees a slot, and its name stays taken
  (decision holo-port/0089).
- A user archives a habbo with a wrong password: "That is not your password.", and the habbo stays.
- A habbo is archived: it leaves the header's count of registered habbos and the landing's promo.
- A user archives the active habbo or one that owns a group: it is refused (decision holo-port/0089).
- A user archives a habbo: its rooms go to the active habbo, and its hand and recycler go to the shared inventory
  (decision server/0124).
- A habbo is archived while another browser plays it: that session moves to the active habbo.

## Landing and legal pages

- Anyone opens the landing page, the registration form, the forgotten-password page, the legal pages and the Habbos tab
  of Account Settings: Holo's title, headings, labels and columns show, with the tab or menu place marked.
- A guest opens `/` with `features.landingPromo` on: the promo widget shows random habbos, and its button opens
  `/register` with that look.
- A guest opens the landing's promo feed: it holds at most 10 random habbos, each with Holo's imager options, and none
  in an empty hotel.
- A guest opens `/` with `features.landingPromo` off: the join button shows, and the promo feed answers 404.
- A guest opens `/` with JavaScript off: the sign-in box, the join link and "Enable JavaScript" show.
- A visitor opens `/disclaimer` or `/privacy`: Holo's terms or privacy text shows.
