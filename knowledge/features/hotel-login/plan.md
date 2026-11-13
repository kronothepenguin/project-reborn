---
type: Plan
title: "Hotel login: how"
description: The site's sign-in makes the SSO ticket, and the game server speaks the handshake, the login and the pings.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/auth` | Makes the SSO ticket at sign-in, and drops it at a switch of habbo |
| `packages/store` | `sso_tickets`, and `avatar_game_data`: the last time online, the machine id, the sound setting |
| `packages/server` | The handshake, the version check, the login, the answers after it, the pings; `game.Login` |
| `packages/virtual` | `habbo` holds the habbos online with their sessions; `settings` declares the game's settings |
| `packages/housekeeping` | The Game form edits the client version, the session parameters and the ping times |

# Decisions

- [Text on the wire is UTF-8](/decisions/server/0014-text-is-utf8.md) — The server reads and writes every string as
  UTF-8, and the external variables turn `client.textdata.utf8` on.
- [The server sends ENDOFCRYPTOPARAMS right after
  CRYPTOPARAMETERS](/decisions/server/0027-endofcryptoparams-right-after-cryptoparameters.md) — The client's encryption
  is skipped, and the server ends the crypto parameters at once.
- [Habbos log in with SSO tickets only](/decisions/server/0028-sso-only.md) — The client's login box is refused;
  passwords never travel over the game connection.
- [A second login closes the first session](/decisions/server/0029-a-second-login-closes-the-first.md) — The old
  session gets 287 with reason 2 and is closed; the new one logs in.
- [SSO tickets come from the CMS sign-in and live as long as its
  session](/decisions/server/0030-sso-tickets-from-the-cms-sign-in.md) — The sign-in makes a public ticket for the
  active habbo, spent once used and dead with the session.
- [The hotel is always open](/decisions/server/0032-the-hotel-is-always-open.md) — The opening-hours messages are never
  sent.
- [The server accepts one client version, from the site](/decisions/server/0033-one-client-version-from-the-site.md) —
  A setting holds the version, and the client's URLs must start with `site.url`.
- [The session parameters are settings](/decisions/server/0034-session-parameters-are-settings.md) — The ten session
  parameters are settings that housekeeping edits.
- [The machine id is saved with the habbo at each
  login](/decisions/server/0035-the-machine-id-is-saved-per-habbo.md) — The id from `UNIQUEID` is saved once the login
  names the habbo, ready for machine bans.
- [Latency reports are only logged](/decisions/server/0036-latency-reports-are-logged.md) — `REPORT_LATENCY` goes to
  the log and is never saved.
- [The last time online is written at login and at
  logout](/decisions/server/0037-last-online-at-login-and-logout.md) — Both moments write it.
- [A habbo's sound setting is saved](/decisions/server/0038-the-sound-setting-is-saved.md) — The setting the room bar
  changes is saved with the habbo.
- [Rules tell sessions about events through an interface each session
  implements](/decisions/server/0039-rules-notify-sessions-through-an-interface.md) — `game` sends events as structs,
  and each protocol's session turns them into messages.
- [The accepted client version starts at 1](/decisions/server/0040-the-accepted-client-version-starts-at-1.md) — The
  setting starts at 1, and the external variables give `client.version.id=1`.
- [An empty VERSIONCHECK URL passes the check](/decisions/server/0041-an-empty-versioncheck-url-passes.md) — The client
  sends empty URLs while its game host is local.
- [The server pings every 30 seconds and closes a session after 90 seconds without
  PONG](/decisions/server/0042-ping-every-30-seconds.md) — Two settings, and a closed session logs its habbo out.
- [The sign-in's SSO ticket is best-effort, and update 0008 waits for an
  administrator](/decisions/server/0043-the-sign-in-ticket-is-best-effort.md) — A failure to make the ticket is only
  logged, and the client page makes one when none is valid.
- [What the game server saves of a habbo has a table of its
  own](/decisions/server/0044-game-login-data-has-its-own-table.md) — `avatar_game_data` holds the last time online,
  the machine id and the sound setting.
- [A habbo's fuses: everyone's two, Holo's club set, and every checked fuse from access
  groups](/decisions/server/0045-fuses-holos-club-set-and-every-checked-fuse.md) — Everyone gets two fuses, club
  members Holo's club set, and access groups grant the rest.
- [A client with the wrong version is closed after its error](/decisions/server/0049-a-wrong-version-is-closed.md) —
  A failed version check, or an SSO before a passed one, gets 33 and the close.
- [Error reports wait for S7](/decisions/server/0054-error-reports-wait-for-s7.md) — The server sends no error report
  yet.
- [LibreShockwave and the .dcr first, a vanilla JavaScript client
  later](/decisions/client/0002-libreshockwave-first-then-javascript.md) — The client page runs the R26 `.dcr` on
  LibreShockwave first.
- [The client's links come from site.url](/decisions/client/0004-client-links-from-site-url.md) — The external
  variables build the client's links from `site.url`, as the version check reads it.
- [The client page ports Holo's, with LibreShockwave in place of Adobe's
  plugin](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md) — The CMS's client page hands the
  ticket to the client.
