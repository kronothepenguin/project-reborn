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
here, by reason. This list covers [P1](/phases/p1-signed-out.md), [P2](/phases/p2-me-account.md) and, in its own
section, the housekeeping pages of [HK-A](/phases/hk-a-housekeeping-core.md) and
[HK-B](/phases/hk-b-users-moderation.md).

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
| Ban | An IP ban stops everyone on the address | Holders of `housekeeping.access` are not stopped by it, though a ban on their account is | A moderator could lock an administrator out through their address ([0055](/decisions/0055-staff-levels.md)) |
| Webstore | Takes the credits, fills the inventory and writes the ledger in separate queries, and the credits with no floor | One transaction, and the credits never go below zero | A failure halfway lost credits or gave items away |
| Webstore | A habbo without the staff rank who asks for a staff item gets an empty answer | `Sorry, but you can not buy this item!` | The same answer as any item that is not sold |
| Home editor | Saves any number as a position | Items stay on the playground, 922 by 1360 pixels | A position off the page lost the item for good |
| Home editor | Places items with no limit, and shows only the first 200 | Refuses past `homes.maxItems`, with `This home cannot hold more than 200 items.` | Items past 200 vanished from the page without a word |
| Notes | Staff write raw HTML, and for everyone else `'` stays open, so a link can break out of its address | Every note is text with BBCode, escaped for everyone | A note could run scripts on anyone who opened the home |
| BBCode | A link takes any address | Only `http` and `https` addresses become links | A `javascript:` link ran code on a click |
| BBCode | Crossed tags close the page's own elements | Crossed tags nest inside the text, as a browser nested Holo's | One note could break the rest of the page |

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
| Header | `Enter <site>` for guests | `<site> is offline` | [0013](/decisions/0013-defer-game-server-features.md) |
| Me | `Enter <site>` | `Hotel Closed` | [0013](/decisions/0013-defer-game-server-features.md) |
| Header | One habbo per account | `Switch habbo` with several, and `/account/habbos` | [0001](/decisions/0001-user-owns-many-habbos.md) |
| Header | Housekeeping is `housekeeping.php` | `site.housekeepingUrl`, because housekeeping can run on its own port | [0003](/decisions/0003-housekeeping-under-prefix.md) |
| Several habbos | One habbo per account | One wallet, one club membership and one home inventory per user | [0056](/decisions/0056-wallet-club-and-inventory-per-user.md) |
| Several habbos | A habbo is never removed | A user archives a habbo, which hides it and keeps its name | [0058](/decisions/0058-habbos-are-archived.md) |
| Settings | Read from the database on every request | A running CMS re-reads them every `cms.refresh` seconds | [0051](/decisions/0051-one-machine-and-a-refresh.md) |
| Account | An email can be shared | `This e-mail address already has an account.` | [0001](/decisions/0001-user-owns-many-habbos.md) |
| Maintenance | An `Administrator Login` link to housekeeping | A sign-in form on the page | The plan: staff sign in with the shared session |
| Maintenance | Redirects every page to `maintenance.php` | Serves the page on every address with 503 | The plan |
| A password change | The session ends, with `You will need to login again.` | The session stays under a new token, and open reset links end | [0059](/decisions/0059-account-forms.md) |
| A password change | The other session goes to `index.php?error=1`, reading `Invalid username or password.` | The other session just ends | [0018](/decisions/0018-password-reset-by-email.md) ends every session, and the port cannot tell that from an expired one |
| Home store | `Holograph Emulator`, `HoloCMS` and `Pedobear Seal of Approval`, three stickers on HoloCMS's own host | Left out, since the host is gone | [0061](/decisions/0061-art-in-the-repository.md) |
| BBCode | Any colour name or hex value | The eight colours of Holo's toolbar, as the plan maps them; any other shows uncoloured | The plan's colours |
| Home page | `Edit` shows on the home of the signed-in habbo | It shows on the homes of all the user's habbos | [0065](/decisions/0065-owners-edit-all-their-homes.md) |
| Home page | The tag buttons and the edit icon come from Habbo's servers | The plus, the minus and the wrench of the CMS's own icon sprite | Those servers are gone, and Holo never shipped the images |
| Home editor | The edit menu and the store dialogs sit in frames drawn by images from Habbo's servers | Plain frames, with Holo's texts, buttons and order | Those servers are gone, and Holo never shipped the images |
| Home editor | Items fade out and back in when the background changes, and placed items fade in | The background and the items change at once | Holo's fades came from an effects library the site does not load; the result is the same |
| Note editor | `Control.TextArea`'s BBCode toolbar | Buttons for bold, italics, underline, strike, quote, code and a link, and the colours of Holo's list | The same tags and colours, without that library |
| Upgrading | `upgrade.php` runs its changes once, with no record of what ran, and asks for the file to be deleted | Housekeeping's update page applies the waiting update files in order, after a copy of the database, and records each in `migrations` | [0067](/decisions/0067-updates-are-our-own-migrations.md), [0070](/decisions/0070-housekeeping-applies-updates.md) |
| Upgrading | The site runs while `upgrade.php` waits | While updates wait, the CMS shows its maintenance page to everyone, staff with the bypass included, and housekeeping only its update page | [0069](/decisions/0069-waiting-updates-close-the-hotel.md) |
| Upgrading | No change happens by itself | Updates that sign-in needs apply when a program starts, after a copy, and a failure shows an error page | [0071](/decisions/0071-sign-in-updates-apply-at-start.md) |
| Upgrading | `config.php` is edited by hand | Housekeeping offers the keys a release adds to `config.json`, with their defaults, and removes the ones nothing reads | [0070](/decisions/0070-housekeeping-applies-updates.md) |
| Install | The last page links to the new site and to housekeeping's sign-in | It links to the hotel, where the administrator signs in; housekeeping has no sign-in of its own | [0070](/decisions/0070-housekeeping-applies-updates.md) |
| Install | `install.php` writes the store and the ranks | Updates write them, so a hotel installed before them receives them too | [0068](/decisions/0068-seeds-are-updates.md) |

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
| Home store | Sells `Plaster` under the name `plaster1`, which no rule draws | Left out of the store |
| Home store | Previews `Notes` with `hiscores_preview.gif`, a file Holo never shipped | Previews them with Holo's own `note_thumbnail_store.gif` |
| Home editor | Gives a club skin to anyone who sends its number, though the menu shows it to club members only | Club skins take club |
| Home page | Writes the profile widget the first time anyone opens a home | Each home starts with it, at the same place |
| Smilies | Never show, because the code reads `enable-smilies` and the install writes `smilies-enabled` | Show while `features.smilies` is on, as it is by default |
| Profile tags | The limit of 20 never refuses: it counts at most 20 tags and refuses only above 20 | `homes.maxTags` refuses with Holo's `You've reached the tag limit...` |

# Kept as in Holo, on purpose

- Addresses follow Holo's rule, so `a+b@example.com` and top-level domains over 7 letters are refused.
- The year list runs to 1900, while the rule refuses years before 1920.
- The parent's bubble says `under 12` and appears up to the age of 12.
- `Your password must have at least 6 characters and it must contain both letters and numbers.` promises a rule on
  letters and numbers that Holo never checked, and the port does not either.
- The motto allows 38 characters on `/me` and 32 on `/account/profile`.
- The email and password forms ask for the birth date, which the plan had dropped.
- `Refer Options` describes a field during registration that exists neither in Holo nor here.

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
| Edit User | Takes column names from the form | Reads a fixed list of fields | `name=x` could otherwise reach any column, as it did in Holo |
| Edit User | Any value goes into the query, with no escaping | The email, the birth date, the figure, the gender, the motto's 38 characters, and tickets and film from 0 to 2147483647 are checked | A value Holo accepted could break the site's pages |
| Edit User | The email and birth date of anyone can be changed | They take `housekeeping.usersPrivate`, and `housekeeping.usersEdit` alone does not show them or save them | Changing an address nobody may read would hand over the account, through the password reset |
| Help Queries | Picking up, deleting and `Quick Reply` happen on links | Each is a `POST` behind a button | A link in a message could close a ticket |
| Help Queries | Every administrator reads the asker's address | It takes `housekeeping.usersPrivate` | [0053](/decisions/0053-attributes-on-groups-and-users.md) |
| Alert | A blank alert to one user goes through | Refused, with the message of the mass alert | An empty alert would sit on the habbo's page |
| Ban tool | Stores any text as the address | An IPv4 or IPv6 address, in the form sign-ins compare | A mistyped address would look like a ban and stop nobody |
| Give Credits | `is_numeric` lets `1.5` and `1e3` through, and a debit can go below zero | Whole numbers up to 2147483647, and a debit stops at zero with Holo's message | A wallet holds whole credits, and a sum past SQLite's integers would turn into a float |
| Badge tool | Takes any 3 or 4 characters | Letters and digits, saved in upper case | A code names a file and a segment of a path, and MySQL matched codes ignoring case |
| User listing | Every administrator sees every email and address | Emails, birth dates and addresses take `housekeeping.usersPrivate`, in the search too | [0053](/decisions/0053-attributes-on-groups-and-users.md) |
| Stickers & Backgrounds | Fetches any address from the server for the image's size, and appends unescaped text to `assets.css` | The image is one of the art files in the repository, by its path; nothing is fetched or written | The plan and [0061](/decisions/0061-art-in-the-repository.md): the fetch reached any host, and the form wrote CSS |
| Stickers & Backgrounds | The price takes any text, a negative number too | A price from 0 to 2147483647 and a quantity from 1 to 2147483647, whole numbers | A wallet pays the price and an inventory adds the quantity, and past SQLite's integers a sum turns into a float |
| Stickers & Backgrounds | Stores any category it is sent | Refuses a category that does not exist | An item outside every category could never be sold |

## Changed by a decision

| Page | Holo | The port | Decision |
| --- | --- | --- | --- |
| Sign-in | A login page of its own and a second session that holds the password hash | The shared session; a guest goes to `site.url` | [0003](/decisions/0003-housekeeping-under-prefix.md) |
| Sign-in | Non-staff read `Invalid username, password, or access level.` | Non-staff get 403 | [HK-A](/phases/hk-a-housekeeping-core.md) |
| Header | `Welcome Administrator Name [ Site Home · Log Out ]` | `Logged in as: Name (Previous login at … from …)` `Log out` and `Site Home`, with no rank | [0014](/decisions/0014-attribute-based-access.md), [0003](/decisions/0003-housekeeping-under-prefix.md), [0041](/decisions/0041-housekeeping-design-system.md) |
| Every page | `HoloCMS Housekeeping` and `HoloCMS v… Build …` | `Project Reborn Housekeeping` and `Powered by Project Reborn ©` | [0048](/decisions/0048-footer-names-reborn.md) |
| Tabs | Six | Dashboard, Site & Content, Users & Moderation; Server waits for the game server, and HoloCMS and Help are dropped | [0013](/decisions/0013-defer-game-server-features.md), [0021](/decisions/0021-dropped-and-kept-features.md) |
| Dashboard | Rooms, furniture, the online count and `Server Setup` | They wait for the game server | [0013](/decisions/0013-defer-game-server-features.md) |
| Dashboard | The version, `HoloCMS Updater`, `Support HoloCMS`, `Need assistance?` | Not ported: they are about Holo | [0021](/decisions/0021-dropped-and-kept-features.md) |
| Dashboard | `Members` counts users | Counts habbos | [HK-A](/phases/hk-a-housekeeping-core.md) |
| Dashboard | Administrators are `rank > 6` | They are the holders of `housekeeping.accessGroups`, under their display habbo | [0014](/decisions/0014-attribute-based-access.md) |
| Ranks | Numbers on a user | The installer creates Holo's staff ranks as access groups with levels, and the admin can change or delete them | [0054](/decisions/0054-access-groups-are-holos-ranks.md) |
| Moderators | See emails and IP history | They take `housekeeping.usersPrivate`, which the Moderator group does not hold | [0053](/decisions/0053-attributes-on-groups-and-users.md) |
| Staff actions | Anyone can act on anyone but `$sysadmin` | Only on users of a lower level | [0055](/decisions/0055-staff-levels.md) |
| Rank tool | Ranks 1 to 7 by name or id | Access groups with attributes; the search still takes a name or an id | [0014](/decisions/0014-attribute-based-access.md) |
| Rank tool | The `$sysadmin` of `config.php` cannot lose that rank, and only that user gives rank 7 | No `$sysadmin`: nobody edits a group above their level ([0055](/decisions/0055-staff-levels.md)), and the last holder of `housekeeping.access` and `housekeeping.accessGroups` cannot lose them: `Access denied. The last user who can manage access groups must keep housekeeping.access and housekeeping.accessGroups.`, logged as `accessGroups.refused`, as Holo logged its tool's refusals | [0014](/decisions/0014-attribute-based-access.md) |
| Configuration | `Enable SSO` and `Language` | Gone: SSO waits for the client page, and only English is left | [Holo's settings](/reference/holo-database.md) |
| Content tool | Four categories of `cms_content` | A form per group of settings. Those of the staff, credits and forum pages arrive with their phases, and get a form when they are declared | [HK-A](/phases/hk-a-housekeeping-core.md) |
| Maintenance | `Administrators can still login through Housekeeping.` | `Administrators can still login on that page.` | The plan: staff sign in with the shared session on the maintenance page |
| Help Queries | `Delete`, which deletes the query | `Close`, with Holo's rule that it must be picked up first and its texts saying `closed`; the ticket stays as history and leaves the overview | [0063](/decisions/0063-what-housekeeping-can-delete.md) |
| Help Queries | A `Room ID` column | Not shown | Tickets from inside the hotel wait for the game server ([0013](/decisions/0013-defer-game-server-features.md)) |
| Alert | Goes to a user, with `Server Alert` for the game | Goes to a habbo, and archived ones count as unknown; the checkbox waits for the game server | Alerts were always per habbo here, and [0013](/decisions/0013-defer-game-server-features.md) |
| Mass alert | One row per user | One row per habbo that is not archived | Each habbo reads its own feed |
| Left menu | `Edit User`, `Retrive IP Address`, `Retrive User ID`, `Clone Checker`, `Give User Badge`, `Transaction logs`, `Give Credits / Refunds`, `Unbanning`, `Ban Listing`, `Mass Site/Remote Alert` and `Alert Listing` are links of their own | Their work is on `User Listing`, the habbo's page, `Remote Banning` and `Site/Remote Alert` | The plan's routes |
| Ban tool | `You may not ban the System Administrator!` | `Access denied. You may only act on users below your level.` | [0055](/decisions/0055-staff-levels.md) |
| Ban tool | `...successfully. An ingame notification has been sent (that is, if the user is online).` | Ends at `successfully.` | The game server is deferred ([0013](/decisions/0013-defer-game-server-features.md)) |
| Unban tool | `(Mass) Unban` deletes every ban matching a query | `Lift` beside each ban, which stays in the table as history | The plan, and [0063](/decisions/0063-what-housekeeping-can-delete.md) |
| Ban Listing | Lists expired bans until their user signs in, with a notice saying so | Lists active bans, and the notice is gone | Bans are never deleted here, so expired ones would stay forever. Lifted and expired bans stay readable in the staff log |
| Edit User | `credits` is a field of the form | Credits move only through `Give Credits`, which writes the ledger | Every change of credits has a ledger row |
| Edit User | Every column but six can be edited, `hbirth`, `lastvisit`, `postcount` and `noob` too | The fields that still exist as data of their own: motto, figure, gender, email, birth date, newsletter, tickets and film | The others are worked out from history, or are gone |
| Edit User | `...will also update (poof) ingame, if connected.` | `User updated successfully.` | The game server is deferred ([0013](/decisions/0013-defer-game-server-features.md)) |
| Stickers & Backgrounds | Its own list of categories, with its own spellings and no Notes | The store's categories, in the store's order | The categories live in the database, and a fixed list would drift from it |
| Stickers & Backgrounds | Open to every administrator | Takes `housekeeping.homeStore`, which the installer's Administrator and Moderator hold | [0053](/decisions/0053-attributes-on-groups-and-users.md), [0054](/decisions/0054-access-groups-are-holos-ranks.md) |

## Holo bugs not ported

| Page | Holo | The port |
| --- | --- | --- |
| Texts | `An user`, `belive`, `wether` | Spelled correctly |
| Dashboard | `Active Bans` counts every row, expired ones too, until the banned user comes back | Counts the bans in force |
| A refused form | Forgets what was typed | Keeps it, except a password |
| A saved form | Answers the post, so a reload posts again | Redirects, and shows the same message |
| Badge tool | A new badge is current, and the old one stays current too | One worn badge at a time | The old badge was never cleared |
| Ban tool | Adds hours, days and months by hand, so a ban across the end of a day, a month or a year gets a wrong date | Real dates | The sums ignored month lengths and the year's end |
| Ban tool | `Invalid ban length!` is written over, and the ban goes through ending now | The ban is refused | The message never showed |
| Stickers & Backgrounds | `Please do not leave any fields blank.` shows whenever the page opens, and a post with a blank field does nothing | The message answers a blank post |
| Stickers & Backgrounds | A price of `0` counts as blank, so a free item cannot be made | 0 is a price |
| Stickers & Backgrounds | Every item is a sticker, even in Backgrounds | The image's folder gives the kind |
| Stickers & Backgrounds | Its log row leaves out the item's name | `homeStore.create` reads `<name> worth <price> credits` |
| Stickers & Backgrounds | Two items whose names start with the same word share one image | Each item keeps its own image |

## Not in Holo

None of these fits the three reasons of [0034](/decisions/0034-behaviour-matches-holo.md), so each is here for the user to
veto.

| Page | The port | Why |
| --- | --- | --- |
| Staff log | 100 rows a page, with `Older` and `Newer` | Holo listed every row, and pruned them. Here rows are never deleted, so the list only grows |
| Staff log | An `IP` column in place of `Note`, Holo's name of the PHP file | `staff_logs` has the address and no such note |
| Settings | Forms for `auth`, `registration`, `referral`, `mail` and `imaging`, which Holo kept in `config.php` or nowhere | The plan: forms over the declared settings |
| Settings | A `Homes` form for the items per home, the length of a note and the tags per habbo, which Holo wrote in its code | The plan: the `homes` section |
| Settings | `mail.password` is never shown: blank keeps it, and `Clear it` removes it | The plan: `mail.password` masked |
| Edit User | Two forms on the habbo's page, `Save Habbo` and `Save User` | A habbo and its owner are two rows |
| Edit User | `users.update` and `habbos.update` list the fields saved, never their values | Holo logged `Edited user`, and an address must not reach readers of the log |
| Help Queries | 100 rows a page, and a closed ticket stays readable at its address, shown to staff who open it | Tickets are never deleted here, so the list needs pages |
| Alerts | One page for alert, mass alert and the listing, with 100 rows a page, and the mass form shows only with `housekeeping.alertsBroadcast` | The plan: `GET /alerts`, `POST /alerts`. Holo listed every row |
| Ban tool | Takes a habbo's name or a user id, and the habbo's page links to it | Holo took a user id, and here staff see habbos; the rank tool already took both |
| Ban tool | The form and the list share one page, in the plain rows of Sulake's `Mass banning and kicking`, with the answer under the form | The plan, and [0060](/decisions/0060-housekeeping-components.md) |
| Give Credits | A form on the habbo's page, not a page asking for a name | The plan: `POST /habbos/{id}/credits` |
| Transaction logs | The page of a habbo, with a `Habbo` column and 100 rows a page, not a page asking for a user id | The plan, and the wallet is shared ([0056](/decisions/0056-wallet-club-and-inventory-per-user.md)) |
| Badge tool | The habbo's page lists its badges, each with `Remove`, and the form gives one to that habbo | The plan: `POST /habbos/{id}/badges/{code}/delete`. Holo's tool only gave badges, by username |
| User listing | Lists habbos, with `(Archived)` beside those archived | A user owns several habbos, and staff must find an archived one to restore it |
| User listing | 100 habbos a page, with `Older` and `Newer` | Holo listed every user on one page |
| User listing | One search does the work of `Retrive IP Address`, `Retrive User ID` and the `Clone Checker`, and matches part of a name | The plan: `GET /habbos?q=` |
| User listing | `Last Activity` reads the habbo's newest session, then its last sign-in | `online` is not kept; the column's wording is Holo's |
| Habbo page | `Restore Habbo` on an archived habbo, refused while the user has no free slot | [0058](/decisions/0058-habbos-are-archived.md), and a user owns up to `registration.maxHabbosPerUser` ([0056](/decisions/0056-wallet-club-and-inventory-per-user.md)) |
| Habbo page | Holders of `housekeeping.accessGroups` tick attributes for the user alone | [0053](/decisions/0053-attributes-on-groups-and-users.md) |
| Habbo page | The page of one habbo, with its owner, their other habbos and the addresses they signed in from | The plan. Holo kept only the last address |
| Access groups | The guard also keeps `housekeeping.access` on someone | `housekeeping.accessGroups` opens nothing without it, so the rule as written could still lock everyone out |
| Stickers & Backgrounds | A gold list of every item, sold or not, 100 a page, each with a form for its name, category, price, quantity and `For Sale`; an item is never deleted | The plan: `POST /home-store/{id}`, and [0063](/decisions/0063-what-housekeeping-can-delete.md) |

## Kept as in Holo, on purpose

- Any staff member can change the shared note.
- A blank field of `Edit User` keeps its value, so a motto cannot be emptied there.
- Holo's spelling in its texts, such as `The bage code` and `Permenantly`.
- The dashboard shows 20 administrators, and the staff list 50 rows.
- Every link of the left menu shows to all staff, and a page they lack answers `Access Denied`.

# Waiting for a later phase

| Holo | Phase |
| --- | --- |
| The tag cloud on the landing page | [P4](/phases/p4-community.md) |
| `My Groups` in the header, and the groups habblet on `/me` | [P5](/phases/p5-groups-forum.md) |
| `My Friends`, `My Rooms` and the recommended rooms | Deferred with the game server ([0013](/decisions/0013-defer-game-server-features.md)) |
| The tags habblet, the news promo and the banners on `/me` | [P4](/phases/p4-community.md) |
| The wardrobe on `/account/looks` | [P6](/phases/p6-economy.md) |
| The `MY GROUPS` widget and the group badge of the profile widget | [P5](/phases/p5-groups-forum.md) |
| The online state of the profile widget, which shows offline | Deferred with the game server ([0013](/decisions/0013-defer-game-server-features.md)) |
| `Voucher Management` in housekeeping | [P6](/phases/p6-economy.md) |
| `Chatlogs` and `Online Users` in housekeeping | Deferred with the game server ([0013](/decisions/0013-defer-game-server-features.md)) |
| The pages behind Help, Community and Credits | [P7](/phases/p7-help.md), [P4](/phases/p4-community.md), [P6](/phases/p6-economy.md) |
| News and banners in housekeeping, and the text boxes of the staff page | [P4](/phases/p4-community.md) |
| Vouchers in housekeeping, and the text boxes of the credits page | [P6](/phases/p6-economy.md) |
