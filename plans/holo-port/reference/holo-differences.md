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
here, by reason. This list covers the signed-out pages of [P1](/phases/p1-signed-out.md) and, in its own section, the
housekeeping pages of [HK-A](/phases/hk-a-housekeeping-core.md).

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

# Kept as in Holo, on purpose

- Addresses follow Holo's rule, so `a+b@example.com` and top-level domains over 7 letters are refused.
- The year list runs to 1900, while the rule refuses years before 1920.
- The parent's bubble says `under 12` and appears up to the age of 12.
- `Your password must have at least 6 characters and it must contain both letters and numbers.` promises a rule on
  letters and numbers that Holo never checked, and the port does not either.

# Housekeeping

The behaviour follows Holo's PHP ([0034](/decisions/0034-behaviour-matches-holo.md)), and the look is a new design system
([0041](/decisions/0041-housekeeping-design-system.md)).

## Safer than Holo

| Page | Holo | The port | Why |
| --- | --- | --- | --- |
| Every page | No protection against requests from other sites | Cross-origin protection on every `POST` | Any site could change a hotel through a logged-in administrator |
| Every page | Only the PHP pages check access | The built pages and the static files sit behind the same check | `/housekeeping/` is a route too, and it serves the templates |
| Every page | Logs what it remembers to | Every mutation writes one `staff_logs` row, notes and content too | Holo logged neither, and an audit trail with gaps is not one |
| A settings form | Builds its query from the posted keys, in the content tool | Reads only the fields of its section | A form must not reach other settings, as `edituser.php` could |
| A settings log row | Says which form was saved | Lists the keys that changed, never their values | Values can be secrets |
| Dashboard | Shows every administrator's address to all staff | Takes `housekeeping.users`, which grants seeing emails ([0015](/decisions/0015-attribute-names-and-fuses.md)) | Staff should not get more than their attributes give |
| Access Denied | Answers 200 | The same page answers 403 | The status says what happened; a browser shows no difference |
| Staff log | `GET ?do=prune` empties the log for the `$sysadmin` | The page is read-only | A log its readers can empty proves nothing, and a link could trigger it |

## Changed by a decision

| Page | Holo | The port | Decision |
| --- | --- | --- | --- |
| Sign-in | A login page of its own and a second session that holds the password hash | The shared session; a guest goes to `site.url` | [0003](/decisions/0003-housekeeping-under-prefix.md) |
| Sign-in | Non-staff read `Invalid username, password, or access level.` | Non-staff get 403 | [HK-A](/phases/hk-a-housekeeping-core.md) |
| Header | `Welcome Administrator Name [ Site Home · Log Out ]` | `Logged in as: Name (Previous login at … from …)` and `Site Home`, with no rank and no `Log Out` | [0014](/decisions/0014-attribute-based-access.md), [0003](/decisions/0003-housekeeping-under-prefix.md), [0041](/decisions/0041-housekeeping-design-system.md) |
| Every page | `HoloCMS Housekeeping` and `HoloCMS v… Build …` | `Project Reborn Housekeeping` and `Powered by Project Reborn ©` | [0048](/decisions/0048-footer-names-reborn.md) |
| Tabs | Six | Dashboard, Site & Content, Users & Moderation; Server waits for the game server, and HoloCMS and Help are dropped | [0013](/decisions/0013-defer-game-server-features.md), [0021](/decisions/0021-dropped-and-kept-features.md) |
| Dashboard | Rooms, furniture, the online count and `Server Setup` | They wait for the game server | [0013](/decisions/0013-defer-game-server-features.md) |
| Dashboard | The version, `HoloCMS Updater`, `Support HoloCMS`, `Need assistance?` | Not ported: they are about Holo | [0021](/decisions/0021-dropped-and-kept-features.md) |
| Dashboard | `Members` counts users | Counts habbos | [HK-A](/phases/hk-a-housekeeping-core.md) |
| Dashboard | Administrators are `rank > 6` | They are the holders of `housekeeping.accessGroups`, under their display habbo | [0014](/decisions/0014-attribute-based-access.md) |
| Rank tool | Ranks 1 to 7 by name or id | Access groups with attributes; the search still takes a name or an id | [0014](/decisions/0014-attribute-based-access.md) |
| Rank tool | The `$sysadmin` of `config.php` cannot lose his rank, and only he gives rank 7 | No `$sysadmin`: holding `housekeeping.accessGroups` is enough, and its last holder cannot lose it: `Access denied. The last user who can manage access groups must keep housekeeping.access and housekeeping.accessGroups.`, logged as `accessGroups.refused`, as Holo logged its tool's refusals | [0014](/decisions/0014-attribute-based-access.md) |
| Configuration | `Enable SSO` and `Language` | Gone: SSO waits for the client page, and only English is left | [Holo's settings](/reference/holo-database.md) |
| Content tool | Four categories of `cms_content` | A form per group of settings. Those of the staff, credits and forum pages arrive with their phases, and get a form when they are declared | [HK-A](/phases/hk-a-housekeeping-core.md) |
| Maintenance | `Administrators can still login through Housekeeping.` | `Administrators can still login on that page.` | The plan: staff sign in with the shared session on the maintenance page |

## Holo bugs not ported

| Page | Holo | The port |
| --- | --- | --- |
| Texts | `An user`, `belive`, `wether` | Spelled correctly |
| Dashboard | `Active Bans` counts every row, expired ones too, until the banned user comes back | Counts the bans in force |
| A refused form | Forgets what was typed | Keeps it, except a password |
| A saved form | Answers the post, so a reload posts again | Redirects, and shows the same message |

## Not in Holo

None of these fits the three reasons of [0034](/decisions/0034-behaviour-matches-holo.md), so each is here for the user to
veto.

| Page | The port | Why |
| --- | --- | --- |
| Staff log | 100 rows a page, with `Older` and `Newer` | Holo listed every row, and pruned them. Here rows are never deleted, so the list only grows |
| Staff log | An `IP` column in place of `Note`, Holo's name of the PHP file | `staff_logs` has the address and no such note |
| Settings | Forms for `auth`, `registration`, `referral`, `mail` and `imaging`, which Holo kept in `config.php` or nowhere | The plan: forms over the declared settings |
| Settings | `mail.password` is never shown: blank keeps it, and `Clear it` removes it | The plan: `mail.password` masked |
| Access groups | The guard also keeps `housekeeping.access` on someone | `housekeeping.accessGroups` opens nothing without it, so the rule as written could still lock everyone out |
| Settings | `cms.refresh` has no form | It has no reader until the IPC design decides its fate ([0040](/decisions/0040-housekeeping-writes-settings.md)) |
| A banned user | Holo's `core.php` shows the ban's message and ends the session on any page; here the session ends with a plain 403, and the message waits for the next sign-in on the CMS | The ban's page belongs to the CMS, and housekeeping can run without it |

## Kept as in Holo, on purpose

- Any staff member can change the shared note.
- The dashboard shows 20 administrators, and the staff list 50 rows.
- Every link of the left menu shows to all staff, and a page they lack answers `Access Denied`.

# Waiting for a later phase

| Holo | Phase |
| --- | --- |
| The tag cloud on the landing page | [P4](/phases/p4-community.md) |
| `Housekeeping` in the footer for staff, and `Alert: The site is currently turned off!` | [P2](/phases/p2-me-account.md) |
| The rest of `Users & Moderation` in housekeeping: users, badges, credits, bans, alerts and help | [HK-B](/phases/hk-b-users-moderation.md) |
| News and banners in housekeeping, and the text boxes of the staff page | [P4](/phases/p4-community.md) |
| Vouchers in housekeeping, and the text boxes of the credits page | [P6](/phases/p6-economy.md) |
