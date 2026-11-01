---
type: Reference
title: Where the port differs from Holo
description: Every behaviour of the port that differs from HoloCMS on purpose, with the reason, so that the user can veto it.
timestamp: 2026-11-01T19:05:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [holo]
---

# How to read this

[0034](/decisions/0034-behaviour-matches-holo.md) makes every page behave exactly as Holo does. Anything else is listed
here, by reason. This list covers [P1](/phases/p1-signed-out.md) and [P2](/phases/p2-me-account.md).

# Safer than Holo

| Page | Holo | The port | Why |
| --- | --- | --- | --- |
| Sign-out | `GET logout.php` signs out | Only `POST /logout` does; `GET /logout` sends a signed-in visitor to `/me` | Any site could sign a visitor out with a link |
| Forgot | `Invalid username or e-mail address` for a wrong pair | One answer for every pair | A stranger could test which names and addresses belong together |
| Forgot | `E-Mail send! Check your inbox and spam folders.` | `If this username and e-mail address match, an e-mail is on its way. Check your inbox and spam folders.` | The answer must also be true for a wrong pair |
| Forgot | Mails the stored password hash | Mails a single-use link on the `Password:` line | [0018](/decisions/0018-password-reset-by-email.md) |
| Forgot | Unlimited mail to one address | At most `auth.resetMaxActive` unexpired links | [0035](/decisions/0035-reset-mail-limit.md) |
| Sign-in | Unlimited attempts | `Too many failed attempts. Please try again later.` after `auth.loginMaxFailures` | Password guessing |
| Landing | `index.php?do=version` prints the version, the path and the visitor's address | Not ported | It tells an attacker what runs |
| Register | The age limit runs only in the browser | The server checks it too | A script could skip it |
| Register | Sends the password and the address to `ajax_password.php` and `ajax_emailcheck.php` as they change | The same rules run in the browser | A password stays on the page until the form is sent |
| Register | Posts the parent's address, and ignores it | Asks for it and checks it, and it never leaves the browser | A third person's address has no use here |
| Register | Refuses requests by their `Referer` | Cross-origin protection on every `POST` | The header is optional and can be forged |
| Ban | The page answers 200 | The same page answers 403 | The status says what happened; a browser shows no difference |
| Me | `me.php?do=RemoveFeedItem` removes an alert on a `GET` | Only `POST /me/alerts/{id}/dismiss` does, for the habbo's own alerts | Any site could trigger a `GET`, and Holo took the id from the address |
| Motto | Stored with `htmlspecialchars` | Stored as typed and escaped when shown | Escaping belongs to the output |

# Changed by a decision

| Page | Holo | The port | Decision |
| --- | --- | --- | --- |
| Sign-in | The name of a user | The name of a habbo, with the owner's password | [0002](/decisions/0002-login-with-habbo-name.md) |
| Register | One address can hold many accounts | `This e-mail address already has an account. Please sign in and add a habbo there.` | [0001](/decisions/0001-user-owns-many-habbos.md) |
| Register | Letters and digits, while its tooltip promises more | Also `- = ? ! @ : . ,`, as the tooltip says | [0026](/decisions/0026-installer-administrator-and-names.md) |
| Register | Captcha | `registration.maxPerIp`, with `Too many habbos were registered from your connection. Please try again later.` | [0021](/decisions/0021-dropped-and-kept-features.md) |
| Register | Refer field only in the locale | `?refer=` pays the referrer | [0021](/decisions/0021-dropped-and-kept-features.md) |
| Register, landing | Flash, with a list of 6 avatars and `Show more Habbos` when it is missing | The HTML5 ports, and no list | [0021](/decisions/0021-dropped-and-kept-features.md) |
| Landing | `Install Flash Player 8 or higher` | Gone with Flash; `Enable JavaScript` stays | [0021](/decisions/0021-dropped-and-kept-features.md) |
| Landing | Promo feed with name, motto, profile link, badge, online state and group badge | `image`, `figure` and `gender`, the attributes the HTML5 widget reads | [0021](/decisions/0021-dropped-and-kept-features.md) |
| Every page | Real online count | `0` and the offline picture | [0013](/decisions/0013-defer-game-server-features.md) |
| Every page | `Powered by HoloCMS © 2008 Meth0d.` | `Powered by Project Reborn ©` | [0048](/decisions/0048-footer-names-reborn.md) |
| After registering | `welcome.php` picks a first room | Goes to `/me` | [0013](/decisions/0013-defer-game-server-features.md) |
| After signing in | `me.php` | A minimal `/me`, until P2 | [0031](/decisions/0031-p1-minimal-me-page.md) |
| Header | `Enter <site>` for guests | `<site> is offline` | [0013](/decisions/0013-defer-game-server-features.md) |
| Me | `Enter <site>` | `Hotel Closed` | [0013](/decisions/0013-defer-game-server-features.md) |
| Header | One habbo per account | `Switch habbo` with several, and `/account/habbos` | [0001](/decisions/0001-user-owns-many-habbos.md) |
| Header | Housekeeping is `housekeeping.php` | `site.housekeepingUrl`, because housekeeping can run on its own port | [0003](/decisions/0003-housekeeping-under-prefix.md) |
| Account | An email can be shared | `This e-mail address already has an account.` | [0001](/decisions/0001-user-owns-many-habbos.md) |
| Maintenance | An `Administrator Login` link to housekeeping | A sign-in form on the page | The plan: staff sign in with the shared session |
| Maintenance | Redirects every page to `maintenance.php` | Serves the page on every address with 503 | The plan |
| A password change | The other session goes to `index.php?error=1`, reading `Invalid username or password.` | The other session just ends | [0018](/decisions/0018-password-reset-by-email.md) ends every session, and the port cannot tell that from an expired one |

# Holo bugs not ported

| Page | Holo | The port |
| --- | --- | --- |
| Register | Forgets every field after a failed post, because PHP renames `bean.avatarName` | Keeps what was typed, except the passwords |
| Register | Its `MOD-` check never runs | `This name is not allowed.` works |
| Register | Accepts 31 February | `Please supply a valid date of birth.` |
| Register | `Tab` stays in the name field even with nothing to check, which traps the keyboard | `Tab` is stopped only when a check runs |
| Register | The figure error appears in the password box | It appears in the avatar column |
| Register | Without a figure the form cannot be sent | `registration.defaultFigure`, as the plan says |
| Register | No limit on the password's length, as the check is commented out | `auth.passwordMaxLength`, with the locale's unused text |
| Sign-in | A blank password says `Invalid username or password.`, because the hash of nothing is not empty | `Please do not leave any fields blank.`, as the code intends |
| Texts | `occured`, `refered`, `wich`, `registration progress` | Spelled correctly |
| Texts | `stored in a secure MySQL database` | `stored in a secure database`, because it is not MySQL |
| Ban | No text for a ban without an end, which the schema now allows | `This ban does not expire.` |
| Me | `elseif($age == 3 \|\| $age = 33)` assigns, so most birthdays read `33rd` | The right ordinal |
| Me | The motto field opens empty, because the script is given `""` | It opens with the motto |
| Me | Clearing the motto leaves nothing to click | The prompt comes back |
| Account | The newsletter box on the email form starts unchecked and is ignored | It shows and saves the choice |
| Texts | `shiney`, `basicly`, `automaticly`, `referal`, `benifits` | Spelled correctly |

# Kept as in Holo, on purpose

- Addresses follow Holo's rule, so `a+b@example.com` and top-level domains over 7 letters are refused.
- The year list runs to 1900, while the rule refuses years before 1920.
- The parent's bubble says `under 12` and appears up to the age of 12.
- `Your password must have at least 6 characters and it must contain both letters and numbers.` promises a rule on
  letters and numbers that Holo never checked, and the port does not either.
- The motto allows 38 characters on `/me` and 32 on `/account/profile`.
- The email and password forms ask for the birth date, which the plan had dropped.
- `Refer Options` describes a field during registration that exists neither in Holo nor here.
- A password change ends the visitor's own session too. It also ends open reset links, which Holo did not have.

# Waiting for a later phase

| Holo | Phase |
| --- | --- |
| The tag cloud on the landing page | [P4](/phases/p4-community.md) |
| `My Groups` in the header, and the groups habblet on `/me` | [P5](/phases/p5-groups-forum.md) |
| `My Friends`, `My Rooms` and the recommended rooms | Deferred with the game server ([0013](/decisions/0013-defer-game-server-features.md)) |
| The tags habblet, the news promo and the banners on `/me` | [P4](/phases/p4-community.md) |
| The wardrobe on `/account/looks` | [P6](/phases/p6-economy.md) |
| The page behind the header's habbo search, `/home?name=` | The deferred [P3](/phases/p3-homes.md) |
| The pages behind Help, Community and Credits | [P7](/phases/p7-help.md), [P4](/phases/p4-community.md), [P6](/phases/p6-economy.md) |
