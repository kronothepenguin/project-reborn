---
type: Reference
title: Where the port differs from Holo
description: Every behaviour of the port that differs from HoloCMS on purpose, with the reason, so that the user can veto it.
timestamp: 2026-11-09T18:23:28+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [holo]
---

# How to read this

[0034](/decisions/0034-behaviour-matches-holo.md) makes every page behave exactly as Holo does. Anything else is listed
here, by reason. This list covers [P1](/phases/p1-signed-out.md), [P2](/phases/p2-me-account.md),
[P3](/phases/p3-homes.md) and [P4](/phases/p4-community.md) and, in its own section, the housekeeping pages of
[HK-A](/phases/hk-a-housekeeping-core.md), [HK-B](/phases/hk-b-users-moderation.md), P3, P4 and P6.

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
| Group badge | `save_group_badge.php` stores any text posted with its fixed `__app_key`, after dropping `NaN` | Only a code the badge editor would write, from an admin's active habbo | Anything stored became the badge's file name and its drawing |
| Group members | `groups_accept.php` checks no admin at all; accept, decline, give, revoke and remove change any row of their habbos, the owner's included | Every action needs an admin's active habbo; accept and decline touch only requests, and the others only members, never the owner | Anyone could accept requests, and an admin could demote or remove the owner by posting the request |
| Group home editor | `widget_add.php`, `delete_sticker.php` and the other edit scripts change the group named in the user's `cms_homes_group_linker` row, which the edit mode wrote, and never check the role again | Every change checks that the active habbo is an admin of the home's group | An admin who lost the role could keep changing the group's home |
| Group page | `groups_select_favorite.php` makes a group the favourite of a habbo that only asked to join it, and `leavegroup.php` lets the owner go, leaving the group without its owner's row | Only members choose a favourite, and the owner cannot leave | The buttons never offered either, but anyone could post them |
| Group page | Viewing it deletes the viewer's waiting request of a group that is not Exclusive, and writes a missing Group information widget, and its search prints the typed name unescaped | Viewing writes nothing, and the name is escaped | Any link could change the database, and the search could run scripts |
| Group purchase | Takes the credits, writes the group, the owner's row and the ledger in separate queries, and checks a typed name, unescaped in its query, against the names it stored HTML-escaped | One transaction; the name is stored as typed and checked exactly, ignoring case | A failure halfway lost credits or left a group without its owner, a name with `<` could be bought twice, and the check took SQL from the form |
| Group badges | `badge.php` drew any text it was given, and saved the drawing in `badge-fill/` under a file name taken from the request | A code the badge editor would not write answers 404, and no drawing is written to disk; browsers keep each code's drawing for a year | Any visitor could write files named by the request, and an unknown tint drew a black layer |
| Home editor | Places items with no limit, and shows only the first 200 | Refuses past `homes.maxItems`, with `This home cannot hold more than 200 items.` | Items past 200 vanished from the page without a word |
| Notes | Staff write raw HTML, and for everyone else `'` stays open, so a link can break out of its address | Every note is text with BBCode, escaped for everyone | A note could run scripts on anyone who opened the home |
| BBCode | A link takes any address | Only `http` and `https` addresses become links | A `javascript:` link ran code on a click |
| BBCode | Crossed tags close the page's own elements | Crossed tags nest inside the text, as a browser nested Holo's | One note could break the rest of the page |
| News | The article's id goes into the SQL as it is, and the title, category and author print as HTML | Bound, and escaped when shown | Any address could read the database, and a title could run scripts |
| Tags | `tags.php?tag=…&add=true` adds the tag on a plain link, and the search box prints the tag as HTML | Tagging yourself is a form that posts, and the search box escapes the tag | Any page could tag a visitor with a link, and a search address could run scripts |
| Community | Banners open in a window named `blank`, which the opened page can steer back, and titles, summaries, banner texts and addresses print as HTML | Each banner opens in a new window that cannot reach the hotel's, and everything is escaped | A banner's page could replace the hotel, and an article could run scripts |
| Staff page | Names and mottos print as HTML | Escaped | A motto could run scripts on the staff page |
| Discussion board | The Moderation Tools save any title, a blank one too, since only the page checked it | The server refuses a blank title with `Topic title may not be empty`, and one over 30 characters | A request sent without the page could leave a thread with no title |
| Report window | `go.php` puts the post's id into its SQL and its `Proceed` link, and the thread's page into that link, as they came | The id is a number bound to the query, and the page a whole number from 1, or 1 | Any address could read or change the database, or run scripts in the window |
| Report window | A guest is sent to the Help Tool's start, but the script runs on and writes the report with no name | Guests go to `/`, and nothing is written | Anyone could file reports without an account |
| Help | `go.php` puts the subject and the question into its SQL through `addslashes` and `htmlspecialchars` | They are bound to the query as typed, and escaped where housekeeping shows them | `addslashes` does not stop every injection, and text escaped on its way in shows its entities |
| Credits page | `redeemvoucher.php` reads the voucher, then adds its credits, deletes it and writes the ledger in separate queries | One transaction, whose first statement claims the unused code | A failure halfway lost the voucher or its credits, and two redemptions of one code at once were both paid |
| Wardrobe | `wardrobestore.php` keeps an outfit for any signed-in user, in the club or not, and turns a slot it does not know into slot 1 and a gender into `M` | Only club members keep outfits, in a slot from 1 to `homes.wardrobeSlots` and with the looks form's checks; anything else answers the error that shows `Error! This outfit cannot be saved.`, the alert Holo's script had for it and its server never sent | A request could fill a wardrobe the page shows only to the club, and a wrong slot overwrote the first outfit |

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
| Account settings | No page for furniture | `Furni`, after `Habbos`: the furniture of the user that no habbo holds, with `Take` for a kind and `Take all`, which move it to the active habbo's hand | [0057](/decisions/0057-furni-and-rooms.md), `plans/server/decisions/0122-the-shared-inventory-is-an-account-page.md` |
| Several habbos | One habbo per account, which is never archived | Archiving a habbo sends the furniture of its hand and of its recycler to the shared inventory and gives its rooms to the active habbo | [0057](/decisions/0057-furni-and-rooms.md), `plans/server/decisions/0124-an-archived-habbos-rooms-move-to-the-active-habbo.md` |
| Header | Housekeeping is `housekeeping.php` | `site.housekeepingUrl`, because housekeeping can run on its own port | [0003](/decisions/0003-housekeeping-under-prefix.md) |
| Several habbos | One habbo per account | One wallet, one club membership and one home inventory per user | [0056](/decisions/0056-wallet-club-and-inventory-per-user.md) |
| Club page | A purchase gives `HC1` to the account's one habbo, which wears it if it lacked it | Each purchase gives `HC1` to every habbo of the user that lacks it, archived ones too; the buyer wears it when given it, as Holo's habbo did, and the others keep the badge they wear | [0056](/decisions/0056-wallet-club-and-inventory-per-user.md), [0103](/decisions/0103-club-badge-for-every-habbo.md) |
| Club page | When the club ends, `IsHCMember` hides the badge the habbo wears, whichever it is, and means to delete `HC1`, but its query names a column `users_badges` lacks, so `HC1` stays | `HC1` leaves every habbo of the user, and a habbo that wears another badge keeps it on | [0103](/decisions/0103-club-badge-for-every-habbo.md) |
| Group settings | The text's counter starts at 255, and a rename takes a name another group has | The counter starts at `groups.descriptionMaxLength`, 200, and a taken name answers `A group with this name already exists.` | [0084](/decisions/0084-group-names-and-descriptions.md) |
| Deleting a group | Every sticker and note of its home is destroyed | They go back to the users whose habbos placed them, notes blank | [0083](/decisions/0083-group-home-items-return-to-members.md) |
| Group home editor | A removed sticker goes to the admin who removed it, and a removed note is deleted | Both go back to the user whose habbo placed them, a note blank, and the note's menu no longer says it is deleted for good | [0083](/decisions/0083-group-home-items-return-to-members.md), [0098](/decisions/0098-group-home-notes-go-back-to-their-placers.md) |
| Group home editor | `Modify page` opens for any of the user's admin roles | Only while the admin habbo is active | [0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md) |
| Group page | `Search for group` takes a `LIKE` pattern, so `%` and `_` match anything and the first match opens | The group with exactly that name, ignoring case, at `GET /groups?name=` | [0095](/decisions/0095-group-search-and-report-addresses.md) |
| Group page | Lists every member, archived habbos included | Archived habbos are left out of the members and their count | [0089](/decisions/0089-archived-habbos-show-as-archived.md) |
| Discussion board | Pages count every thread, stickies included, and the stickies take places among the first page's ten | Every sticky heads each page, then ten other threads, and the pages count the others | [0088](/decisions/0088-stickies-head-every-page.md) |
| Discussion board | Names every habbo | An archived habbo shows `archived`, with no link, and its post boxes keep only that and the offline picture | [0089](/decisions/0089-archived-habbos-show-as-archived.md) |
| Discussion board | `Messages:` counts every post the user ever wrote, deleted ones included | The posts the habbo has on the board now | The plan: counts are queried from the posts, never stored |
| Discussion board | Takes any number of posts in a row, and keeps `Spam detected!` unused | A new thread or reply within `forum.spamSeconds` of the habbo's last post answers `Spam detected!`, and a blank one `Post may not be blank` | [0091](/decisions/0091-forum-spam-check.md) |
| Discussion board | After a reply, the thread's last page is redrawn in place | The last page loads, which counts a view | [0094](/decisions/0094-thread-views-count-every-load.md) |
| Discussion board | Staff from rank 6 and the post's user modify and delete a post | Holders of `forum.edit`, and the post's habbo while it is active | [0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md), and the plan's attributes |
| Discussion board | Staff from rank 6 use the Moderation Tools | Holders of `forum.edit` | [0015](/decisions/0015-attribute-names-and-fuses.md) |
| Discussion board | The report flag hides on the user's own posts | On the active habbo's own posts only | [0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md) |
| Report window | `Proceed` is the link `go.php?do=report&post=…&sure=yes`, which sends the report | The window opens at `GET /forum/posts/{id}/report`, and `Proceed`, a button in the link's place and look, posts to `POST /forum/posts/{id}/report` | [0090](/decisions/0090-post-reports.md), [0095](/decisions/0095-group-search-and-report-addresses.md) |
| Report window | One help request or report waits per address | One per habbo, so people who share a connection do not block each other | [0090](/decisions/0090-post-reports.md) |
| Help | `iot/` and `go.php` send a visitor on to `go.php?lang=en&country=uk` | `/help` | The plan's route |
| Help | Takes a request from anyone, a visitor's with no name | A visitor is sent to `/` to sign in first | [0108](/decisions/0108-help-asks-visitors-to-sign-in.md) |
| Help | The subject holds 50 characters in the browser only, and the question any length | The server checks the subject's 50 characters too, with `Your subject may not be longer than 50 characters.`, and refuses a question past `help.messageMaxLength`, 65535 by default, with `Your question may not be longer than <n> characters.` | [0109](/decisions/0109-help-request-lengths.md) |
| Help | One waiting request per address | One per habbo, post reports included | [0090](/decisions/0090-post-reports.md) |
| Group badge | The Flash `BadgeEditor.swf`, with its colours from habbo.co.uk | The HTML5 port in `vendor/HabboWidgets`, with the Tailwind palette | [0021](/decisions/0021-dropped-and-kept-features.md), [0102](/decisions/0102-badges-keep-the-tailwind-palette.md) |
| Group badges | Holo's 18 tints | The closest Tailwind colours; tint 15, olive-500, looks grey-olive beside Holo's brown | [0102](/decisions/0102-badges-keep-the-tailwind-palette.md) |
| Several habbos | A habbo is never removed | A user archives a habbo, which hides it and keeps its name | [0058](/decisions/0058-habbos-are-archived.md) |
| Wardrobe | One wardrobe per account | One per habbo: the active habbo keeps its own outfits and dresses in them | [0001](/decisions/0001-user-owns-many-habbos.md), and the plan's `wardrobe_outfits` |
| Wardrobe | A green arrow writes the Flash editor again at once, which closes Save changes and opens it five seconds later | The HTML5 editor starts again with the outfit, after its loading screen, and Save changes, closed at the arrow, opens five seconds after the editor has drawn the outfit; pressed while an editor is still loading, the arrow waits until that one has drawn itself, since a loading editor cannot be stopped | [0021](/decisions/0021-dropped-and-kept-features.md), [0107](/decisions/0107-save-opens-after-the-first-look.md) |
| Looks | The Flash editor answers a change at once while the look holds club items outside the club | The HTML5 editor holds its answers until five seconds after it was built, up to two seconds after its first look, so a look the club allows, chosen in those two seconds, opens Save changes when they end | [0021](/decisions/0021-dropped-and-kept-features.md), [0107](/decisions/0107-save-opens-after-the-first-look.md) |
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
| Home page | The MY GROUPS rows take their background, and their plus and minus, from Habbo's servers | The rows keep their dashed border, as Holo's show now, and the minus is the CMS's own | Those servers are gone, and Holo never shipped the images |
| Header | `My Groups` lists the signed-in user's groups | The active habbo's | [0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md) |
| Home editor | The edit menu and the store dialogs sit in frames drawn by images from Habbo's servers | Plain frames, with Holo's texts, buttons and order | Those servers are gone, and Holo never shipped the images |
| Home editor | Items fade out and back in when the background changes, and placed items fade in | The background and the items change at once | Holo's fades came from an effects library the site does not load; the result is the same |
| Note editor | `Control.TextArea`'s BBCode toolbar | Buttons for bold, italics, underline, strike, quote, code and a link, and the colours of Holo's list | The same tags and colours, without that library |
| Upgrading | `upgrade.php` runs its changes once, with no record of what ran, and asks for the file to be deleted | Housekeeping's update page applies the waiting update files in order, after a copy of the database, and records each in `migrations` | [0067](/decisions/0067-updates-are-our-own-migrations.md), [0070](/decisions/0070-housekeeping-applies-updates.md) |
| Upgrading | The site runs while `upgrade.php` waits | While updates wait, the CMS shows its maintenance page to everyone, staff with the bypass included, and housekeeping only its update page | [0069](/decisions/0069-waiting-updates-close-the-hotel.md) |
| Upgrading | No change happens by itself | Updates that sign-in needs apply when a program starts, after a copy, and a failure shows an error page | [0071](/decisions/0071-sign-in-updates-apply-at-start.md) |
| Upgrading | `config.php` is edited by hand | Housekeeping offers the keys a release adds to `config.json`, with their defaults, and removes the ones nothing reads | [0070](/decisions/0070-housekeeping-applies-updates.md) |
| Install | The last page links to the new site and to housekeeping's sign-in | It links to the hotel, where the administrator signs in; housekeeping has no sign-in of its own | [0070](/decisions/0070-housekeeping-applies-updates.md) |
| Install | `install.php` writes the store and the ranks | Updates write them, so a hotel installed before them receives them too | [0068](/decisions/0068-seeds-are-updates.md) |
| Staff page | Its two boxes hold raw HTML, edited in the content tool | Their bodies are BBCode, and the help of their fields says `BBCode is allowed here.` | [0077](/decisions/0077-staff-boxes-in-bbcode.md) |
| Credits page | Its two boxes hold raw HTML, edited in the content tool, the second with the palm chair and a list of four ways to earn credits | Their bodies are BBCode, and the help of their fields says `BBCode is allowed here.`; the pictures are part of the page, and the list is lines that start with `* ` | [0105](/decisions/0105-credits-boxes-in-bbcode.md) |
| Credits page | A redeemed voucher is deleted | It stays, with the habbo that redeemed it and when | [0063](/decisions/0063-what-housekeeping-can-delete.md) |
| Credits page | A voucher of the type `item` looks its furniture up by name when it is redeemed, and answers `Item not valid, please contact an admin for assistance.` when no furniture has the name, leaving the voucher to be tried again | The furniture is found when the voucher is made, so a redemption always gives it, and that answer is never shown | `plans/server/decisions/0120-an-item-voucher-gives-the-first-furni-of-its-sprite.md` |
| Credits page | An item voucher creates one bare piece: a teleport without its pair, a pad of post-its without notes | It gives what buying the furniture gives: a teleport as a linked pair, a pad of 20 post-its | `plans/server/decisions/0125-an-item-voucher-gives-what-buying-gives.md` |
| Credits page | An item voucher's line in the transactions is `Item voucher redeem`, with the furniture's name where the credits go | `Item voucher redeem (<name>)`, with 0 credits: the name the catalogue sells the furniture under | `plans/server/decisions/0121-an-item-voucher-leaves-a-line-of-no-credits.md` |
| Account transactions | Date, Activity and Description | A Habbo column after them names the habbo that acted, blank when none did, since all the user's habbos share the purse | [0104](/decisions/0104-transactions-show-the-habbo.md) |
| News | The body is HTML written by staff | BBCode, without smilies, as Holo's news had none | [0020](/decisions/0020-news-in-bbcode.md) |
| Tags | A tag counts for its owner whether the owner still exists or not | An archived habbo's tags leave the cloud, the search and the tag fight | [0058](/decisions/0058-habbos-are-archived.md) |
| Staff page | Every user above rank 2, with `Rank:` named after the rank | Each member of a staff-listed access group once, with `Rank:` the name of the highest of those groups and the habbo chosen for it | [0076](/decisions/0076-one-staff-list.md) |

# Holo bugs not ported

| Page | Holo | The port |
| --- | --- | --- |
| Help | `empty` takes a subject or question of `0` for blank, and lets one of spaces through | `0` is text, and spaces alone are blank, as in the forum's posts |
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
| News | An unknown article shows the archive with status 200 | The archive, with status 404 |
| Tags | The search takes the tag as a `LIKE` pattern, so `%` finds every tagged habbo | It finds the tag exactly |
| Texts | `The winnner is:` on the tag fight | Spelled correctly |
| Community | The news promo prints empty stories and items when there are fewer than four articles | It shows only the articles there are |
| Me page | The tags habblet's text keeps saying what it said when the page loaded after a tag is added or removed, and the next question comes from an older list | The text follows the tags, and every question comes from the Me page's list |
| Texts | `You need you remove one of your tags` | Spelled correctly |
| Group members | The paging links of the Pending members tab load the Members tab | They page the waiting requests |
| Group settings | A type that leaves Exclusive keeps its waiting requests until each habbo next views the group, and an admin can accept one meanwhile, even into a closed group | The waiting requests go at once |
| Group page | Shows `Join` again to a habbo whose request waits, because its check reads a row loaded only for members | Shows no way in while the request waits |
| Texts | `An request`, `Noone`, `You are already member`, `dont` on the group page's dialogs | Spelled correctly |
| Texts | `You are about to delete a compelete topic.` in the Moderation Tools | Spelled correctly |
| Group page | The Group Members widget takes its favourite icon, and its tiles their background, from Habbo's CDN, which is gone | The favourite mark of Holo's own `info_icons.png`; the tiles keep their dashed border alone, as Holo's show now |
| Header | `My Groups` opens on layer 99, under any home item placed higher | The menu stays above the page |
| Discussion board | The jump to a thread's last post counts two views, its own and the page it sends to | The last post's date links straight to the thread's last page, which counts one |
| Discussion board | A title over 30 characters or a post over 65,535 is cut short by its column | Refused with `Topic title may not be longer than 30 characters` or `Post may not be longer than 65535 characters` |
| Discussion board | A reply to a thread closed meanwhile vanishes | The thread shows closed, and nothing is added |
| Discussion board | Every deleted post sends the visitor to the board | Back to the thread, unless the thread went with its last post |
| Discussion board | A new thread the server refuses replaces the form with the refusal's text | The text shows in the form's red box |
| Discussion board | The preview shows the habbo online, with a blank motto and a nameless avatar, from a variable the page never sets | The habbo's motto and name, offline ([0087](/decisions/0087-online-picture-stays-offline.md)) |
| Discussion board | Quote copies the post with its HTML escaped a second time | The post as written |
| Discussion board | Enter in the Moderation Tools' title sends their form to `#`, which reloads the page | Enter does nothing |
| Discussion board | A Moderation Tools save the server cannot make puts whatever it answered where the post list was | The Moderation Tools open again with the reason in their red box |
| Home page | `widget_add.php` lists and counts every membership in a new MY GROUPS, waiting requests included, until the page reloads | The joined groups, as the page lists them |
| Home page | The info box of a group that no longer exists is empty, and its script then fails on the missing minus, which leaves the widget blank | `Invalid group or no group supplied.`, with its minus |
| Group home editor | Never shows `This item belongs to another user. If you remove it, it will return to their inventory.`, because the page calls `openEditMenu` without its fifth argument | It shows on the stickers and notes another user placed |
| Group home editor | The inventory's `Group Members` carries the tooltip `My Groups` | `Group Members` |
| Group home editor | `widget_add.php` places a second Group Members widget when asked, though the inventory greys it out once placed | One per home |
| Group home editor | Removes the Group information widget when its removal is posted, though its menu offers no Remove, and the group page writes it again in its corner at the next view | It goes straight back to its corner, in the default skin |
| Group purchase | Compares `strlen($name > 25)`, so a name or description of any length passes | A name over `groups.nameMaxLength` or a description over `groups.descriptionMaxLength` gets Holo's `The group name you have selected is too long.` or `The group description you have entered is too long.` ([0084](/decisions/0084-group-names-and-descriptions.md)) |
| Texts | `Purchashing`, `Managment`, `An group`, `occured` on the purchase dialog | Spelled correctly |
| Texts | `maxiamum` in the club's month limit | Spelled correctly |
| Report window | Every answer is 200, `Invalid post specified` too | `Invalid post specified` answers 404, and a report refused for a waiting request 422 |
| Texts | `has reported an post` in a report's ticket | Spelled correctly |
| Wardrobe | Shows a green arrow on every slot, which does nothing on an empty one: its style shows the arrows its script meant to show once a slot is filled | The green arrow shows once the slot holds an outfit |
| Wardrobe | An outfit stored since the page loaded starts the editor again without the club's choices | Every outfit starts it again with them |
| Wardrobe | Takes the outfit for the slot before the server answers, so a refused one could still be dressed in | The slot takes it once the server keeps it |

# Kept as in Holo, on purpose

- Addresses follow Holo's rule, so `a+b@example.com` and top-level domains over 7 letters are refused.
- The year list runs to 1900, while the rule refuses years before 1920.
- The parent's bubble says `under 12` and appears up to the age of 12.
- `Your password must have at least 6 characters and it must contain both letters and numbers.` promises a rule on
  letters and numbers that Holo never checked, and the port does not either.
- The motto allows 38 characters on `/me` and 32 on `/account/profile`.
- The email and password forms ask for the birth date, which the plan had dropped.
- `Refer Options` describes a field during registration that exists neither in Holo nor here.
- The tags page says `No results` before anything is searched.
- After `Again?`, the tag fight's button reads `Start`, not `Fight!`.
- The report window takes reports while the board is off, and of a habbo's own posts by their address, as `go.php`
  checked neither.
- The Help Tool window shows its background colour alone: Holo's style names `bg_patterns/skull.gif`, which Holo
  never shipped.
- After a club purchase, the club page keeps the buy buttons it drew, even once the purse holds less than a month's
  price, and the next purchase answers that the credits are short.

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
| News | The topstory image takes any text, which the CMS prints raw into its pages | One of Holo's five local images, an uploaded image at the path the CMS serves it at, or an http(s) address; anything else answers `The topstory image must be one of the local images, an uploaded image or an http(s) address.` and keeps what was typed | Any other address, such as `javascript:`, would go into every page that shows the article |
| News | `Delete` is a link that deletes at once, with no question | A `Delete` button that posts, still with no question | A link in a message could delete an article |
| Banners | Takes any address for the banner and its link, `javascript:` too, and puts them into the query and the pages raw | Each url is an http(s) address or a path of the site, or the form answers `The urls must be http(s) addresses or paths of the site, such as /community.` and keeps what was typed | A link could run a script on every page that shows the banner, or a path such as `//host` lead to another site |
| Banners | The lengths of the text, 50, and of the urls, 255, hold only in the browser and the columns | The server checks them too: `The text must be at most 50 characters, and each url at most 255.` | A script could skip the browser |
| Voucher Management | The random code comes from PHP's `rand`, which can be foretold | The code is drawn with `crypto/rand` | A voucher is worth credits to whoever types its code |
| Voucher Management | `Amount` takes any text, which the redemption adds to the wallet as a number, so a voucher of `-500` takes credits away | A whole number from 1 to 2147483647, or `The amount must be a number from 1 to 2147483647.` | A wallet holds whole credits, a voucher must give some, and past SQLite's integers a sum turns into a float |

## Changed by a decision

| Page | Holo | The port | Decision |
| --- | --- | --- | --- |
| Sign-in | A login page of its own and a second session that holds the password hash | The shared session; a guest goes to `site.url` | [0003](/decisions/0003-housekeeping-under-prefix.md) |
| Sign-in | Non-staff read `Invalid username, password, or access level.` | Non-staff get 403 | [HK-A](/phases/hk-a-housekeeping-core.md) |
| Header | `Welcome Administrator Name [ Site Home · Log Out ]` | `Logged in as: Name (Previous login at … from …)` `Log out` and `Site Home`, with no rank | [0014](/decisions/0014-attribute-based-access.md), [0003](/decisions/0003-housekeeping-under-prefix.md), [0041](/decisions/0041-housekeeping-design-system.md) |
| Every page | `HoloCMS Housekeeping` and `HoloCMS v… Build …` | `Project Reborn Housekeeping` and `Powered by Project Reborn ©` | [0048](/decisions/0048-footer-names-reborn.md) |
| Tabs | Six | Dashboard, Site & Content, Users & Moderation; Server waits for the game server, and HoloCMS and Help are dropped | [0013](/decisions/0013-defer-game-server-features.md), [0021](/decisions/0021-dropped-and-kept-features.md) |
| Dashboard | The online count beside `Members`, and `Server Setup` | They wait for the game server | [0013](/decisions/0013-defer-game-server-features.md) |
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
| Content tool | No switch for the tag fight | `Tag Fight Enabled` in Manage Site Content, on by default | [P4](/phases/p4-community.md) |
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
| News | Open to rank 7 | Takes `housekeeping.news`, which the installer's Administrator holds | [0053](/decisions/0053-attributes-on-groups-and-users.md), [0054](/decisions/0054-access-groups-are-holos-ranks.md) |
| News | The topstory image is an address, `http://images.habbohotel.co.uk/c_images/Top_Story_Images/top_story_web60.png` by default | One of Holo's five local images, picked from a list, `top_story_news.png` by default, or an http(s) address, with a 300x187 preview that follows the field, as the CMS's news promo shows the picture | [0074](/decisions/0074-news-images.md) |
| News | No uploads | An `Upload Image` row cuts a picture to fill 300x187 by dragging and zooming it, or fits it whole with transparent bands, previews it, and uploads it with `Use this picture`; a GIF of exactly 300x187 goes up as it is, with its animation. The server keeps only a PNG or a GIF of 300x187, re-encoded, and its path fills the field | [0074](/decisions/0074-news-images.md) |
| News | No uploads | The image editor's `Uploaded` mode shows a thumbnail of every uploaded picture, newest first, with the field's own pressed; clicking one fills the field and the preview, as an upload does, and answers `Chosen as the topstory image. Save the article to keep it.` | [0079](/decisions/0079-uploaded-images-managed.md) |
| Uploaded Images | No uploads | A page after `Manage Existing News Items`, for `housekeeping.news`, lists every uploaded picture, newest first, with its thumbnail, format, size, uploader, date and the articles showing it, ten a page turned in the browser with `Newer` and `Older`. `Delete` removes one no article shows, `Image deleted successfully.`; the database refuses one in use, and the answer names the articles to change or delete first: `Unable to delete image; it is the topstory image of Red Letter Day (ID: 3). Change or delete that article first.` Both answers stay on the page of the delete | [0079](/decisions/0079-uploaded-images-managed.md), [0080](/decisions/0080-uploaded-images-in-pages.md) |
| News | `HTML is allowed here.` under `Story` | `BBCode is allowed here.`, and the edit form links to the article with `View on site` | [0020](/decisions/0020-news-in-bbcode.md) |
| News | The author is the user's name, saved as text | The staff member's active habbo, whose name the list shows | [P4](/phases/p4-community.md) |
| Banners | Open to rank 6 | Takes `housekeeping.banners`, which the installer's Administrator and Moderator hold | [0053](/decisions/0053-attributes-on-groups-and-users.md), [0054](/decisions/0054-access-groups-are-holos-ranks.md) |
| Banners | Under the HoloCMS tab | Under Site & Content, whose Content Management box links to it, as Holo's did | [0021](/decisions/0021-dropped-and-kept-features.md) |
| Voucher Management | The `Amount` of an `Item` voucher takes any text, checked only when a habbo redeems it | A name that no furniture has answers `Unable to create voucher; this item does not exist!`, and of several furniture with one name the first is given | `plans/server/decisions/0120-an-item-voucher-gives-the-first-furni-of-its-sprite.md` |
| Voucher Management | An `Item` voucher is made for any furniture | `wallpaper`, `floor` and `landscape` answer `Unable to create voucher; wallpapers, floors and landscapes cannot be given by a voucher!`, since nobody chooses their pattern | `plans/server/decisions/0125-an-item-voucher-gives-what-buying-gives.md` |
| Voucher Management | An `Item` voucher is logged as `Created voucher <code> worth <name> credits` | `Created voucher <code> for the item <name>` | The staff log says what the voucher gives |
| Voucher Management | Open to rank 6 | Takes `housekeeping.vouchers`, which the installer's Administrator and Moderator hold | [0053](/decisions/0053-attributes-on-groups-and-users.md), [0054](/decisions/0054-access-groups-are-holos-ranks.md) |
| Voucher Management | A voucher cannot be deleted | `Delete` beside each unused voucher answers `The voucher has been deleted successfully.` and logs `Deleted voucher <code>`; a voucher redeemed in the meantime stays, and the answer is `Unable to delete voucher; this voucher does not exist or has been redeemed!` with 404 | [0063](/decisions/0063-what-housekeeping-can-delete.md) |
| Voucher Management | A redemption deletes the voucher, so its code can be given again | A redeemed voucher stays, so its code stays taken | [0063](/decisions/0063-what-housekeeping-can-delete.md) |
| Voucher Management | Any code goes through, `.` and `..` too | The codes `.` and `..` alone answer `The redemption code cannot be . or ..` and keep what was typed, since a browser reads them in the delete's address as folders; every other code goes through | [0106](/decisions/0106-dot-voucher-codes-refused.md) |

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
| News | The edit form selects `HoloCMS` for an article in `Events & Competitions` or `Other`, so saving moves it there, and selects `Events & Competitions` for `Security` | Each article's category is selected, and one no longer offered, such as the club of an older short name, stays as a choice of its own |
| Banners | The page's title is `Wordfilter Options` | `Manage Site Banners`, the name of its link |
| Banners | `Add banner` asks for an id the form does not send, so it never adds a banner | It adds the banner, asking for the two urls as Holo meant to |
| Banners | Each check overwrites the answer of the one before, so the add and edit forms always say `Something was going wrong!`, and the edit view says it before anything is sent | Each answer follows what happened, and shows only after a post: `Succesfully added!` or `You're something forgotten!` in the add form, `Succesfully edited!` or `You're something forgotten!` in the edit view, `Succesfully deleted!` in the list |
| Banners | A second `Add banner` button under the list posts an empty form | Not ported |
| Banners | A delete stays on its question, about a banner that is gone, and says `Succesfully deleted!` for any id; the edit view of a banner that does not exist shows blank fields | A delete goes back to the list; a banner that does not exist answers the page with `Something was going wrong!` in the list, and 404 |
| Voucher Management | `rand(0,71)` reaches one past the last of the 71 characters, so a code now and then has fewer than 8 | Always 8 of Holo's characters |
| Voucher Management | A code that a voucher has stops the page with MySQL's `Duplicate entry` error | `A voucher with this redemption code already exists.`, matching codes ignoring case as Holo's column did |
| Voucher Management | A code past 20 characters reaches MySQL, which cuts it to its column's 20 or stops the page with its error | `The redemption code must be at most 20 characters.` |
| Voucher Management | A code of `0` counts as blank, as PHP's `empty` reads it | `0` is a code |

## Not in Holo

None of these fits the three reasons of [0034](/decisions/0034-behaviour-matches-holo.md), so each is here for the user to
veto.

| Page | The port | Why |
| --- | --- | --- |
| Staff log | 100 rows a page, with `Older` and `Newer` | Holo listed every row, and pruned them. Here rows are never deleted, so the list only grows |
| Staff log | An `IP` column in place of `Note`, Holo's name of the PHP file | `staff_logs` has the address and no such note |
| Settings | Forms for `auth`, `registration`, `referral`, `mail` and `imaging`, which Holo kept in `config.php` or nowhere | The plan: forms over the declared settings |
| Settings | A `Homes` form for the items per home, the length of a note, the tags per habbo and the wardrobe's slots, which Holo wrote in its code | The plan: the `homes` section |
| Settings | A `Groups` form for a group's price, the groups per user, the memberships per habbo, the members of a Regular group and the lengths of a name and a description, which Holo wrote in its code | The plan: the `groups` section ([0082](/decisions/0082-group-limits-per-user-and-habbo.md), [0084](/decisions/0084-group-names-and-descriptions.md)) |
| Settings | A `Club` form for the prices of 1, 3 and 6 months and the days of a month, which Holo wrote in its code | The plan: the `club` settings |
| Settings | A `Help` form for the longest question of a help request, which Holo never limited | [0109](/decisions/0109-help-request-lengths.md) |
| Settings | The content tool's categories are links of their own: `Discussion Board Module` holds `Forum Enabled`, `Smilies Enabled` and a `Spam Check` of 30 seconds, where 0 turns the check off | Holo chose the category from a list; the spam check is [0091](/decisions/0091-forum-spam-check.md) |
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
| News | An article that does not exist answers Holo's `Unable to edit article; this article does not exist!` or `Unable to delete article; this article does not exist!` with 404, also for an id that is not a number | Holo answered 200, and showed the plain list for an id that is not a number |
| News | An upload takes at most 2 MB, and a GIF at most 500 frames, answering `The image must be at most 2 MB.` or `The GIF must have at most 500 frames.`; any other file answers `The image must be a PNG or a GIF of 300x187 pixels.` | [0074](/decisions/0074-news-images.md) sets the size and the formats but no bounds, and a small GIF can decode to far more memory than it takes |
| Voucher Management | The code loses the spaces around it, and a code of spaces is blank | Habbos type the code again, and the other forms trim the names they take |

## Kept as in Holo, on purpose

- Any staff member can change the shared note.
- A blank field of `Edit User` keeps its value, so a motto cannot be emptied there.
- Holo's spelling in its texts, such as `The bage code`, `Permenantly`, `Succesfully`, `Banner editer` and `recieve`.
- The dashboard shows 20 administrators, and the staff list 50 rows.
- Every link of the left menu shows to all staff, and a page they lack answers `Access Denied`.

# Waiting for a later phase

| Holo | Phase |
| --- | --- |
| `My Friends`, `My Rooms` and the recommended rooms | Deferred with the game server ([0013](/decisions/0013-defer-game-server-features.md)) |
| The online state of the profile widget, the community page's random habbos, the staff page and the forum's post boxes, which show offline | Deferred with the game server ([0013](/decisions/0013-defer-game-server-features.md)) |
| `Chatlogs` in housekeeping | The game server's `plans/server` task s4-08 ports it: 100 lines a page with Newer and Older, public rooms marked `Public`, the lines kept 30 days |
| `Online Users` in housekeeping | Deferred with the game server ([0013](/decisions/0013-defer-game-server-features.md)) |
