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
- [s2-02 Create SSO tickets at the CMS sign-in](/tasks/s2-02-sso-tickets-at-sign-in.md) — Signing in to the CMS creates an SSO ticket for the active habbo, kept as text with the session that created it, which the client page reads and the game server spends. **done**
- [s2-03 Save the last time online, the machine id and the sound setting](/tasks/s2-03-saved-login-data.md) — Habbos keep their last time online, the machine id of their last login and their sound setting in the store. **done**
- [s2-04 Add the fuse catalogue](/tasks/s2-04-fuse-catalogue.md) — A habbo's fuses are the default set, the club fuses for club members, and the staff fuses their access groups grant, from a fuse catalogue beside the site's attributes. **done**
- [s2-05 Log a habbo in and out in game](/tasks/s2-05-login-in-game.md) — game logs a habbo in with an SSO ticket and out, holds the online habbo in virtual, and tells sessions through the interface each one implements, starting with a second login. **done**
- [s2-06 Speak the handshake and the login](/tasks/s2-06-handshake-and-login.md) — r26 takes a client from HELLO to LOGIN_OK with an SSO ticket: the handshake without encryption, the version check, the machine id, the session parameters, SSO and TRY_LOGIN, and the old session's 287 on a second login. **done**
- [s2-07 Answer what the client asks after its login](/tasks/s2-07-after-login.md) — After LOGIN_OK the client gets the habbo's user object, fuses, credits, badges, achievements, sound setting and club status, and the server date. **done**
- [s2-08 Keep the session alive and end it](/tasks/s2-08-keeping-the-session-alive.md) — The server pings and the client answers, the latency test is answered and its reports logged, and a closed connection logs the habbo out. **done**
- [s2-09 Check S2's exit criteria](/tasks/s2-09-exit-check.md) — From the merged work, check every exit criterion of S2 and close the phase. **done**

## S3 Navigator

- [s3-01 Add the navigator's tables and Holo's data](/tasks/s3-01-navigator-tables.md) — The store gets the categories, the room models, the public rooms, the habbos' rooms and the favourite rooms, and an update seeds Holo's categories, public rooms and models; S3's settings join the Game form. **done**
- [s3-02 Load the navigator's shared data in virtual](/tasks/s3-02-navigator-state.md) — virtual/category, virtual/model and virtual/room load the categories, the room models and the public rooms when the server starts, and count the habbos in each room in memory. **done**
- [s3-03 Browse the navigator's categories](/tasks/s3-03-browsing.md) — NAVIGATE gets the category's sub-categories and its public rooms or habbo rooms, with the habbos in each, GETUSERFLATCATS the categories a habbo may use, GETPARENTCHAIN a category's parents, and GETSPACENODEUSERS who is in a public room. **done**
- [s3-04 List own rooms, search results and recommended rooms](/tasks/s3-04-room-lists.md) — SUSERF gets the habbo's own rooms, SRCHF the rooms whose name or owner matches, at most 30, and GET_RECOMMENDED_ROOMS three random habbo rooms. **done**
- [s3-05 Keep a habbo's favourite rooms](/tasks/s3-05-favourites.md) — GETFVRF gets the habbo's favourite public rooms and habbo rooms, ADD_FAVORITE_ROOM saves one, up to 30, and DEL_FAVORITE_ROOM removes one. **done**
- [s3-06 Create a room with the room-o-matic](/tasks/s3-06-creating-a-room.md) — CREATEFLAT creates a habbo's room, up to 50, with a club model only for club fuses; SETFLATCAT puts it in a category the habbo's level allows, and SETFLATINFO saves its description, hashed password, furniture rights and visitors. **done**
- [s3-07 Read, change and delete a room](/tasks/s3-07-changing-a-room.md) — GETFLATINFO and GETFLATCAT read a room's settings and category; UPDATEFLAT, SETFLATINFO and SETFLATCAT let its owner change them, and DELETEFLAT deletes it. **done**
- [s3-08 Check S3's exit criteria](/tasks/s3-08-exit-check.md) — From the merged work, check every exit criterion of S3 and close the phase. **done**

## S4 Rooms

- [s4-01 Add the rooms' saved data](/tasks/s4-01-room-tables.md) — The store gets room rights, room bans, room votes, the chat history and the ignore lists; the attribute that reads the chat history and S4's settings join the catalogues. **done**
- [s4-02 Load and unload rooms in virtual](/tasks/s4-02-loaded-rooms.md) — virtual/room keeps each loaded room with its floor and its habbos, their positions and statuses, the doorbell, the queue and the spectators; a room loads with its first habbo and unloads with its last. **done**
- [s4-03 Enter and leave a room](/tasks/s4-03-entering-a-room.md) — A habbo enters a public room or a habbo room past its door, its password, its ban or its doorbell, gets the room's map, habbos, objects and statuses, and leaves; the loading ad and the room ad come from settings. **done**
- [s4-04 Walk](/tasks/s4-04-walking.md) — MOVE walks a habbo to a tile a step every 500 ms by Holo's rules, LOOKTO turns it, and every room's habbos see the steps in 34. **done**
- [s4-05 Chat, whisper, shout, dance, wave and type](/tasks/s4-05-chat-and-gestures.md) — CHAT, WHISPER and SHOUT reach the room as 24, 25 and 26 and are saved; typing, dances and waves show; a habbo's ignore list hides others' chat from it. **done**
- [s4-06 Give rights, kick and ban](/tasks/s4-06-rights-kicks-and-bans.md) — An owner gives and takes rights, all at once too, and kicks and bans habbos for 15 minutes; holders of fuse_any_room_controller act as owners. **done**
- [s4-07 Rate rooms, hold events, and show groups and tags](/tasks/s4-07-room-extras.md) — RATEFLAT rates a room, room events list and run, a habbo's favourite group shows, and tags list. **done**
- [s4-08 Read the chat history in housekeeping](/tasks/s4-08-chat-log-page.md) — Housekeeping gets a chat log page behind housekeeping.chatLogs, by room or habbo, and lines older than game.chatHistoryDays are deleted. **done**
- [s4-09 Check S4's exit criteria](/tasks/s4-09-exit-check.md) — From the merged work, check every exit criterion of S4 and close the phase. **done**
- [s4-10 Send through an outbox per session](/tasks/s4-10-outbox.md) — Each r26 session queues its messages and a goroutine of its own writes them; a client whose game.outboxSize queue is full is closed. **done**
- [s4-11 Wear five badges](/tasks/s4-11-five-badge-slots.md) — The store keeps a slot 1 to 5 per worn badge; SETBADGE sets them, 228 and the user lines show them, and the site's badge page keeps working. **done**
- [s4-12 Queue for full rooms and watch as a spectator](/tasks/s4-12-queue-and-spectators.md) — A full room queues its arriving habbos and takes spectators, as the R26 client shows them, in memory. **done**

## S5 Furni, catalogue and trading

- [s5-01 Add the furni definitions and the catalogue to the store](/tasks/s5-01-catalogue-tables.md) — The store gets the furni definitions, the catalogue's pages and its items, and an update that seeds Holo's catalogue, 67 pages, 1,256 furni and 1,275 items. **done**
- [s5-02 Load the furni definitions and the catalogue in virtual](/tasks/s5-02-catalogue-state.md) — virtual/furni holds the furni definitions and virtual/catalogue the pages and what they sell, both loaded when the server starts. **done**
- [s5-03 Show the catalogue](/tasks/s5-03-showing-the-catalogue.md) — GCIX lists the catalogue's pages a habbo may see as 126, and GCAP sends a page with its texts, images and items as 127. **done**
- [s5-04 Keep furni in the hand](/tasks/s5-04-the-hand.md) — The store gets the furni items, each belonging to a user and held by a habbo, shared or placed in a room; GETSTRIP sends the hand a page at a time as 140, read from the database. **done**
- [s5-05 Buy furni](/tasks/s5-05-buying-furni.md) — GPRC buys a catalogue item with the user's credits in one transaction, and the furni lands in the buyer's hand, with deals, trophies and decorations. **done**
- [s5-06 Send and open presents](/tasks/s5-06-presents.md) — A purchase with the gift flag puts the furni in a box in the hand of the habbo named, with a note, and PRESENTOPEN gives the box's furni to its opener. **done**
- [s5-07 Show a room's furni and walk around it](/tasks/s5-07-furni-in-rooms.md) — A room loads its floor furni and wall items and shows them as 32 and 45; furni shapes the floor, and habbos sit on seats and lie on beds. **done**
- [s5-08 Place, move, turn and pick up furni](/tasks/s5-08-placing-furni.md) — PLACESTUFF, MOVESTUFF and ADDSTRIPITEM place furni from the hand, move and turn it, and pick it up, saved at once; a deleted room's furni goes to its owner's hand. **done**
- [s5-09 Use furni](/tasks/s5-09-using-furni.md) — SETSTUFFDATA and SETITEMSTATE change a furni's state, saved; gates open, dice and bottles roll, wheels and randomizers draw, and fridges hand out drinks. **done**
- [s5-10 Move furni and habbos on rollers](/tasks/s5-10-rollers.md) — The room's clock moves what stands on a roller one tile on, furni and habbos together, as 230. **done**
- [s5-11 Decorate a room](/tasks/s5-11-decorating-a-room.md) — FLATPROPBYITEM uses a wallpaper, a floor or a landscape from the hand on the room, saved with it and told to the room as 46. **done**
- [s5-12 Write post-its](/tasks/s5-12-post-its.md) — A pad's post-its go on a wall one at a time; G_IDATA reads a note as 48, SETITEMDATA writes its colour and text, saved, and REMOVEITEM deletes it.
- [s5-13 Travel through teleports](/tasks/s5-13-teleports.md) — A teleport is bought as a pair; INTODOOR, GETDOORFLAT, DOORGOIN and GOVIADOOR take a habbo from one to the other, in the same room or another.
- [s5-14 Trade furni](/tasks/s5-14-trading.md) — Two habbos in a room offer furni from their hands and accept; when both have, every piece changes hands in one transaction, and a trade cut short loses nothing.
- [s5-15 Turn credit furni into credits](/tasks/s5-15-credit-furni.md) — CONVERT_FURNI_TO_CREDITS destroys a coin, a sack or a gold bar that stands in the habbo's room and adds its worth to the user's wallet.
- [s5-16 Recycle furni](/tasks/s5-16-recycler.md) — The recycler takes furni from the hand, keeps it saved while the recycling runs, and gives a reward for it or the furni back; its rewards and times start as Holo's.
- [s5-17 Port housekeeping's Recycler Options](/tasks/s5-17-recycler-options-page.md) — Housekeeping gets HoloCMS's Recycler Options page, which saves the recycler's four settings and writes the staff log.
- [s5-18 Redeem item vouchers on the site](/tasks/s5-18-item-vouchers.md) — A voucher gives credits or a furni; housekeeping's Voucher Management makes item vouchers by sprite name, and the credits page puts the furni in the redeeming habbo's hand, as HoloCMS did.
- [s5-19 Show the shared inventory on the site](/tasks/s5-19-shared-inventory-page.md) — The CMS lists the furni of a user that no habbo holds, with a Take button that moves it to the active habbo's hand, and archiving a habbo sends its hand there.
- [s5-20 Count rooms and furni on housekeeping's dashboard](/tasks/s5-20-dashboard-counts.md) — Housekeeping's dashboard shows how many rooms and furni the hotel has, as HoloCMS's did.
- [s5-21 Check S5's exit criteria](/tasks/s5-21-exit-check.md) — From the merged work, check every exit criterion of S5 and close the phase.
- [s5-22 Copy one prepared database for each CMS and housekeeping test](/tasks/s5-22-test-databases.md) — The CMS's and housekeeping's tests copy a database made once with every update applied, in place of applying every update for each test, which the catalogue's seed made too slow for the gates. **done**

## S6 to S9

Their tasks are written when each phase starts, once its open questions are answered.
