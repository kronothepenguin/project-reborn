# Tasks

Units of work grouped by phase. Statuses: todo, in-progress, blocked, done, dropped. A phase gets its tasks when it
starts.

## S0 Foundations

- [s0-01 Create the plan bundle and the tracking-plans skill](/tasks/s0-01-plan-bundle.md) — Write plans/server from the user's request and answers, with the tracking-plans skill that works every plan and the .claude/skills link that lets Claude Code load the project skills. **done**
- [s0-02 Add the backend and client templates to tools/create](/tasks/s0-02-create-templates.md) — tools/create takes -template=fullstack|backend|client, generating today's output, a Go package and runner without a frontend, or a Vite package like client-r26. **done**
- [s0-03 Create packages/server and apps/server](/tasks/s0-03-scaffold-server.md) — Generate the server's package and runner with the backend template, and describe the package layout of decision 0005 in its README. **done**
- [s0-04 Declare the hosts and ports of info and mus in config.json](/tasks/s0-04-listener-config.md) — packages/config gains server.info and server.mus, a host and a port each, on which the server runs its WebSocket listeners. **done**
- [s0-05 Write the transport](/tasks/s0-05-transport.md) — packages/server/transport gives TCP and WebSocket connections one Conn interface, an io.Reader to receive and an io.Writer to send, with the WebSocket as an http.Handler on golang.org/x/net/websocket. **done**
- [s0-06 Write the encoding](/tasks/s0-06-encoding.md) — packages/server/encoding reads and writes the values of the R26 wire format, B64, VL64, strings, booleans, bytes and raw bodies, tested against the client's own code. **done**
- [s0-07 Serve R26 sessions](/tasks/s0-07-r26-sessions.md) — The server runs a WebSocket listener on the host and port of server.info and of server.mus, and on info r26 frames packets, sends HELLO, dispatches packets by id and logs the ones it does not handle yet. **done**
- [s0-08 Check S0's exit criteria](/tasks/s0-08-exit-check.md) — From a clean checkout of the merged work, check every exit criterion of S0, bring the reference up to date and close the phase. **done**
- [s0-09 Make the Go templates work for every name tools/create accepts](/tasks/s0-09-go-template-names.md) — A fullstack or backend name with a '-' gives a Go package that does not compile, and a name that sorts after store gives imports that gofmt reorders; every name validateName accepts makes Go that compiles and passes gofmt. **done**
- [s0-10 Handle the names whose Go package cannot compile](/tasks/s0-10-go-names-that-clash.md) — tools/create accepts names whose Go package name is a Go keyword or main, or a name the generated Go already uses, such as log, http, db or new, and the projects it makes from them do not compile. **done**
- [s0-11 Handle the names whose folder the go tool treats specially](/tasks/s0-11-names-the-go-tool-treats-specially.md) — tools/create accepts internal, vendor and testdata, whose Go package names compile but whose folders the go tool treats specially, so the backend and fullstack projects made from them do not compile or are skipped by go vet ./.... **done**

## S1 R26 protocol reference

- [s1-01 Describe fuse_client's connections, framing and values](/tasks/s1-01-fuse-client.md) — Write /reference/r26/fuse_client.md: how the client opens its #info and #mus connections, frames packets both ways, encodes every value, and registers listeners and commands. **done**
- [s1-02 Map hh_entry_init: login and opening hours](/tasks/s1-02-entry-init.md) — Write /reference/r26/hh_entry_init.md from the .ls scripts: every message hh_entry_init receives and every command it sends, with their fields, senders and flows. **done**
- [s1-03 Map hh_shared](/tasks/s1-03-shared.md) — Write /reference/r26/hh_shared.md from the .ls scripts: every message hh_shared receives and every command it sends, with their fields, senders and flows. **done**
- [s1-04 Map hh_navigator](/tasks/s1-04-navigator.md) — Write /reference/r26/hh_navigator.md from the .ls scripts: every message hh_navigator receives and every command it sends, with their fields, senders and flows. **done**
- [s1-05 Map hh_kiosk_room](/tasks/s1-05-kiosk-room.md) — Write /reference/r26/hh_kiosk_room.md from the .ls scripts: every message hh_kiosk_room receives and every command it sends, with their fields, senders and flows. **done**
- [s1-06 Map hh_room](/tasks/s1-06-room.md) — Write /reference/r26/hh_room.md from the .ls scripts: every message hh_room receives and every command it sends, with their fields, senders and flows. **done**
- [s1-07 Map hh_room_utils](/tasks/s1-07-room-utils.md) — Write /reference/r26/hh_room_utils.md from the .ls scripts: every message hh_room_utils receives and every command it sends, with their fields, senders and flows. **done**
- [s1-08 Map hh_buffer](/tasks/s1-08-buffer.md) — Write /reference/r26/hh_buffer.md from the .ls scripts: every message hh_buffer receives and every command it sends, with their fields, senders and flows. **done**
- [s1-09 Map hh_cat_code](/tasks/s1-09-catalogue.md) — Write /reference/r26/hh_cat_code.md from the .ls scripts: every message hh_cat_code receives and every command it sends, with their fields, senders and flows. **done**
- [s1-10 Map hh_club](/tasks/s1-10-club.md) — Write /reference/r26/hh_club.md from the .ls scripts: every message hh_club receives and every command it sends, with their fields, senders and flows. **done**
- [s1-11 Map hh_friend_list](/tasks/s1-11-friend-list.md) — Write /reference/r26/hh_friend_list.md from the .ls scripts: every message hh_friend_list receives and every command it sends, with their fields, senders and flows. **done**
- [s1-12 Map hh_instant_messenger](/tasks/s1-12-instant-messenger.md) — Write /reference/r26/hh_instant_messenger.md from the .ls scripts: every message hh_instant_messenger receives and every command it sends, with their fields, senders and flows. **done**
- [s1-13 Map hh_guide](/tasks/s1-13-guide.md) — Write /reference/r26/hh_guide.md from the .ls scripts: every message hh_guide receives and every command it sends, with their fields, senders and flows. **done**
- [s1-14 Map hh_tutorial](/tasks/s1-14-tutorial.md) — Write /reference/r26/hh_tutorial.md from the .ls scripts: every message hh_tutorial receives and every command it sends, with their fields, senders and flows. **done**
- [s1-15 Map hh_poll](/tasks/s1-15-poll.md) — Write /reference/r26/hh_poll.md from the .ls scripts: every message hh_poll receives and every command it sends, with their fields, senders and flows. **done**
- [s1-16 Map hh_photo](/tasks/s1-16-photo.md) — Write /reference/r26/hh_photo.md from the .ls scripts: every message hh_photo receives and every command it sends, with their fields, senders and flows. **done**
- [s1-17 Map hh_recycler](/tasks/s1-17-recycler.md) — Write /reference/r26/hh_recycler.md from the .ls scripts: every message hh_recycler receives and every command it sends, with their fields, senders and flows. **done**
- [s1-18 Map hh_soundmachine](/tasks/s1-18-soundmachine.md) — Write /reference/r26/hh_soundmachine.md from the .ls scripts: every message hh_soundmachine receives and every command it sends, with their fields, senders and flows. **done**
- [s1-19 Map hh_roomdimmer](/tasks/s1-19-roomdimmer.md) — Write /reference/r26/hh_roomdimmer.md from the .ls scripts: every message hh_roomdimmer receives and every command it sends, with their fields, senders and flows. **done**
- [s1-20 Map hh_dynamic_downloader](/tasks/s1-20-dynamic-downloader.md) — Write /reference/r26/hh_dynamic_downloader.md from the .ls scripts: every message hh_dynamic_downloader receives and every command it sends, with their fields, senders and flows. **done**
- [s1-21 Map hh_ig](/tasks/s1-21-instant-games.md) — Write /reference/r26/hh_ig.md from the .ls scripts: every message hh_ig receives and every command it sends, with their fields, senders and flows. **done**
- [s1-22 Map hh_human](/tasks/s1-22-human.md) — Write /reference/r26/hh_human.md from the .ls scripts: every message hh_human receives and every command it sends, with their fields, senders and flows. **done**
- [s1-24 Describe the MUS framing of the #mus connection](/tasks/s1-24-mus-framing.md) — Write /reference/r26/mus.md from LibreShockwave's Multiuser Xtra: the bytes of a MUS frame, the Logon frame, the serialized Lingo values, and the messages fuse_client and hh_photo exchange on #mus. **done**
- [s1-23 Check S1's exit criteria](/tasks/s1-23-exit-check.md) — Cross-check the R26 reference against every registration in the client's scripts, so that no message, command or sender is missing, and close the phase. **done**

## S2 Login and session

- [s2-01 Add S2's settings](/tasks/s2-01-settings.md) — Declare the ten session parameters and the client version the server accepts in the settings catalogue, and edit them in housekeeping. **done**
- [s2-02 Create SSO tickets at the CMS sign-in](/tasks/s2-02-sso-tickets-at-sign-in.md) — Signing in to the CMS creates an SSO ticket for the active habbo, kept as text with the session that created it, which the client page reads and the game server spends.
- [s2-03 Save the last time online, the machine id and the sound setting](/tasks/s2-03-saved-login-data.md) — Habbos keep their last time online, the machine id of their last login and their sound setting in the store. **done**
- [s2-04 Add the fuse catalogue](/tasks/s2-04-fuse-catalogue.md) — A habbo's fuses are the default set, the club fuses for club members, and the staff fuses their access groups grant, from a fuse catalogue beside the site's attributes.
- [s2-05 Log a habbo in and out in game](/tasks/s2-05-login-in-game.md) — game logs a habbo in with an SSO ticket and out, holds the online habbo in virtual, and tells sessions through the interface each one implements, starting with a second login.
- [s2-06 Speak the handshake and the login](/tasks/s2-06-handshake-and-login.md) — r26 takes a client from HELLO to LOGIN_OK with an SSO ticket: the handshake without encryption, the version check, the machine id, the session parameters, SSO and TRY_LOGIN, and the old session's 287 on a second login.
- [s2-07 Answer what the client asks after its login](/tasks/s2-07-after-login.md) — After LOGIN_OK the client gets the habbo's user object, fuses, credits, badges, achievements, sound setting and club status, and the server date.
- [s2-08 Keep the session alive and end it](/tasks/s2-08-keeping-the-session-alive.md) — The server pings and the client answers, the latency test is answered and its reports logged, error reports are logged, and a closed connection logs the habbo out.
- [s2-09 Check S2's exit criteria](/tasks/s2-09-exit-check.md) — From the merged work, check every exit criterion of S2 and close the phase.

## S3 to S9

Their tasks are written when each phase starts, once its open questions are answered.
