# Log

## 2026-11-11

- **Done** [s5-06](/tasks/s5-06-presents.md): a habbo buys furni as a present for any habbo, which waits in a box in the
  receiver's hand with its note, and a room's owner opens a box that stands in its room.
- **Start** [s5-06](/tasks/s5-06-presents.md).
- **Decision** [0106](/decisions/0106-a-presents-note-is-cut-at-200-characters.md): a present's note is cut at 200
  characters.
- **Decision** [0105](/decisions/0105-only-a-rooms-owner-opens-a-present.md): only a room's owner opens a present.
- **Done** [s5-08](/tasks/s5-08-placing-furni.md): habbos with rights place, move and turn furni by Holo's stacking
  rules, the owner picks it up and keeps it, and a deleted room's furni goes to its owner's hand.
- **Start** [s5-08](/tasks/s5-08-placing-furni.md).
- **Decision** [0104](/decisions/0104-a-room-holds-up-to-500-furni.md): a room holds up to 500 furni.
- **Decision** [0103](/decisions/0103-whoever-picks-a-furni-up-keeps-it.md): whoever picks a furni up keeps it.
- **Done** [s5-07](/tasks/s5-07-furni-in-rooms.md): a habbo room loads and shows the furni that stands in it, and habbos
  walk around solids, sit on seats, lie on beds and cross rugs.
- **Start** [s5-07](/tasks/s5-07-furni-in-rooms.md).
- **Done** [s5-05](/tasks/s5-05-buying-furni.md): GPRC buys a catalogue item with the user's credits in one transaction,
  and its furni lands in the buyer's hand, with deals, trophies, decorations and the club's page.
- **Start** [s5-05](/tasks/s5-05-buying-furni.md).
- **Done** [s5-04](/tasks/s5-04-the-hand.md): the store keeps every piece of furni, in a hand, a room or the shared
  inventory, and GETSTRIP sends the hand nine furni at a time, read from the database.
- **Start** [s5-04](/tasks/s5-04-the-hand.md).
- **Done** [s5-22](/tasks/s5-22-test-databases.md): the CMS's and housekeeping's tests copy one prepared database, and
  their suites take 132 s and 146 s where they took 389 s and 354 s.
- **Start** [s5-22](/tasks/s5-22-test-databases.md).
- **Create** [s5-22](/tasks/s5-22-test-databases.md): the CMS's and housekeeping's tests copy one prepared database,
  since the catalogue's seed made applying every update for each test too slow for the gates.
- **Done** [s5-03](/tasks/s5-03-showing-the-catalogue.md): GCIX lists the pages a habbo's level and club open, and GCAP
  sends a page with its texts and a product line for each item.
- **Start** [s5-03](/tasks/s5-03-showing-the-catalogue.md).
- **Done** [s5-02](/tasks/s5-02-catalogue-state.md): virtual/furni and virtual/catalogue hold the furni definitions and
  the catalogue, and server.New loads them with the navigator.
- **Start** [s5-02](/tasks/s5-02-catalogue-state.md).
- **Done** [s5-01](/tasks/s5-01-catalogue-tables.md): the store holds the furni definitions and the catalogue, and a new
  hotel starts with Holo's: 67 pages, 1,256 furni and 1,275 items.
- **Start** [s5-01](/tasks/s5-01-catalogue-tables.md).
- **Decision** [0102](/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md): Club Furni and Club Shop sell
  only to club members.
- **Decision** [0101](/decisions/0101-the-pages-of-s7s-furni-wait-for-s7.md): the pages of S7's furni wait for S7.
- **Decision** [0100](/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md): sixteen catalogue pages need
  level 7, and two the club.
- **Decision** [0099](/decisions/0099-the-catalogues-page-names-are-english.md): the catalogue's page names are English.
- **Update** [S5](/phases/s5-furni-catalogue.md) is active, with its exit criteria and the tasks
  [s5-01](/tasks/s5-01-catalogue-tables.md) to [s5-21](/tasks/s5-21-exit-check.md), once the user answered its open
  questions. Each task lists what is still to settle before it starts.
- **Decision** [0098](/decisions/0098-virtual-furni-and-catalogue.md): S5's shared data lives in virtual/furni and
  virtual/catalogue.
- **Decision** [0097](/decisions/0097-furni-definitions-and-catalogue-items-apart.md): furni definitions and catalogue
  items have tables of their own.
- **Decision** [0096](/decisions/0096-the-hand-is-read-from-the-database.md): the hand is read from the database each
  time.
- **Decision** [0095](/decisions/0095-s5-builds-four-site-pieces.md): S5 builds item vouchers, the shared inventory
  page, Recycler Options and the dashboard counts.
- **Decision** [0094](/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md): any habbo sends a present to any
  habbo.
- **Decision** [0093](/decisions/0093-a-recycling-is-saved.md): a recycling is saved.
- **Decision** [0092](/decisions/0092-a-trade-lives-only-in-memory.md): a trade lives only in memory.
- **Decision** [0091](/decisions/0091-holos-catalogue-changed-by-updates.md): a hotel starts with Holo's catalogue,
  changed by database updates.

## 2026-11-10

- **Update** [S4](/phases/s4-rooms.md) is done; [S5](/phases/s5-furni-catalogue.md) is next, once its open questions are
  answered.
- **Done** [s4-09](/tasks/s4-09-exit-check.md): every exit criterion of S4 holds on the merged work, with three
  end-to-end tests added; S4 is done.
- **Start** [s4-09](/tasks/s4-09-exit-check.md).
- **Done** [s4-12](/tasks/s4-12-queue-and-spectators.md): full rooms queue their arrivals, club members first, let them
  in as places free, and take up to 50 spectators from the queue.
- **Decision** [0087](/decisions/0087-every-full-room-queues.md): every full room queues its arrivals.
- **Decision** [0088](/decisions/0088-club-members-first-in-a-queue.md): club members come first in a queue.
- **Decision** [0089](/decisions/0089-up-to-50-spectators-from-the-queue.md): up to 50 spectators watch a full room,
  from its queue.
- **Decision** [0090](/decisions/0090-queue-sets-room-and-spectators.md): the queue sets are room and spectators.
- **Start** [s4-12](/tasks/s4-12-queue-and-spectators.md).
- **Done** [s4-11](/tasks/s4-11-five-badge-slots.md): a habbo wears up to five badges in slots, set by SETBADGE and
  shown by 228, 229 and the user lines; the site wears its badge in slot 1.
- **Start** [s4-11](/tasks/s4-11-five-badge-slots.md).
- **Done** [s4-08](/tasks/s4-08-chat-log-page.md): housekeeping's Chat Log Viewer searches the chat by room or habbo,
  100 lines a page, and the game server prunes lines older than 30 days every hour.
- **Decision** [0084](/decisions/0084-the-game-server-prunes-the-chat-hourly.md): the game server prunes the chat
  history hourly.
- **Decision** [0085](/decisions/0085-the-chat-log-viewer-pages-by-100.md): the Chat Log Viewer lists 100 lines a page.
- **Decision** [0086](/decisions/0086-the-chat-log-marks-public-rooms.md): the Chat Log Viewer marks public rooms.
- **Start** [s4-08](/tasks/s4-08-chat-log-page.md).
- **Done** [s4-07](/tasks/s4-07-room-extras.md): habbos rate rooms, owners host events of 11 types that the navigator
  lists, and rooms show favourite groups and profile tags.
- **Start** [s4-07](/tasks/s4-07-room-extras.md).
- **Create** [s4-11](/tasks/s4-11-five-badge-slots.md) and [s4-12](/tasks/s4-12-queue-and-spectators.md), split from
  [s4-07](/tasks/s4-07-room-extras.md): five badge slots and the queue with the spectators.
- **Decision** [0083](/decisions/0083-a-habbo-wears-five-badges-in-slots.md): a habbo wears up to five badges, in slots.
- **Decision** [0082](/decisions/0082-a-rating-is-the-sum-and-the-share-of-up-votes.md): a room's rating is the sum of
  its votes and the share of +1.
- **Decision** [0081](/decisions/0081-eleven-room-event-types.md): rooms have 11 event types, as Holo.
- **Decision** [0080](/decisions/0080-full-rooms-queue-and-take-spectators-in-s4.md): full rooms queue habbos and take
  spectators in S4.
- **Done** [s4-06](/tasks/s4-06-rights-kicks-and-bans.md): owners give and take rights, all at once too; habbos with
  rights kick and owners ban, as the client's buttons show, and the kicked walk out.
- **Decision** [0079](/decisions/0079-a-kicked-habbo-walks-out.md): a kicked or banned habbo walks out.
- **Start** [s4-06](/tasks/s4-06-rights-kicks-and-bans.md).
- **Done** [s4-05](/tasks/s4-05-chat-and-gestures.md): habbos chat near and far, shout, whisper, type, dance and wave,
  the lines saved and cut at 100 characters, and ignore up to 100 habbos.
- **Decision** [0074](/decisions/0074-near-habbos-read-chat-far-ones-see-a-bubble.md): near habbos read chat, far ones
  see a bubble.
- **Decision** [0075](/decisions/0075-talking-smileys-and-waves-as-holo.md): talking, smileys and waves animate as Holo
  did.
- **Decision** [0076](/decisions/0076-ignore-up-to-100-the-oldest-dropped.md): a habbo ignores up to 100 habbos, the
  oldest dropped.
- **Decision** [0077](/decisions/0077-the-word-filter-waits.md): the word filter waits for a task of its own.
- **Decision** [0078](/decisions/0078-a-chat-line-is-cut-at-100-characters.md): a chat line is cut at 100 characters.
- **Start** [s4-05](/tasks/s4-05-chat-and-gestures.md).
- **Done** [s4-04](/tasks/s4-04-walking.md): each loaded room's clock walks its habbos a step every 500 ms by A*,
  without cutting corners or climbing more than 1, seats them, and turns them with LOOKTO.
- **Start** [s4-04](/tasks/s4-04-walking.md).
- **Done** [s4-03](/tasks/s4-03-entering-a-room.md): habbos enter and leave public rooms and habbo rooms past their
  doors, passwords, bans, limits and doorbells, see each other come and go, and get the ads from the settings.
- **Start** [s4-03](/tasks/s4-03-entering-a-room.md).
- **Done** [s4-10](/tasks/s4-10-outbox.md): each r26 session sends through an outbox of game.outboxSize messages,
  written by a goroutine of its own; a client that stops reading is closed.
- **Start** [s4-10](/tasks/s4-10-outbox.md).
- **Done** [s4-02](/tasks/s4-02-loaded-rooms.md): virtual/room keeps the loaded rooms, their floors, habbos, rights,
  bans and lines; a room loads with its first habbo and unloads with its last.
- **Decision** [0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md): each loaded room runs its own clock.
- **Decision** [0073](/decisions/0073-each-session-sends-through-an-outbox.md): each session sends through an outbox.
- **Create** [s4-10](/tasks/s4-10-outbox.md): each session sends through an outbox, before
  [s4-03](/tasks/s4-03-entering-a-room.md) sends to rooms. Found by s4-02: a session wrote straight to its connection.
- **Start** [s4-02](/tasks/s4-02-loaded-rooms.md).
- **Done** [s4-01](/tasks/s4-01-room-tables.md): the rooms' saved data: rights, bans, votes, the chat history and the
  ignore lists, update 0011, the attribute housekeeping.chatLogs and the six settings of the bans, the history and the
  ads.
- **Start** [s4-01](/tasks/s4-01-room-tables.md).
- **Update** [S4](/phases/s4-rooms.md) is active, with its exit criteria and the tasks
  [s4-01](/tasks/s4-01-room-tables.md) to [s4-09](/tasks/s4-09-exit-check.md), once the user answered its open
  questions.
- **Decision** [0071](/decisions/0071-an-empty-room-unloads-at-once.md): an empty room unloads at once.
- **Decision** [0070](/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md): rooms show a loading ad and a room
  ad from housekeeping's settings.
- **Decision** [0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md): the doorbell, the room queue and the
  spectators live only in memory.
- **Decision** [0068](/decisions/0068-a-habbo-shows-its-favourite-groups-badge.md): a habbo shows its favourite group's
  badge in rooms.
- **Decision** [0067](/decisions/0067-a-room-ban-lasts-15-minutes.md): a room ban lasts 15 minutes.
- **Decision** [0066](/decisions/0066-staff-read-the-chat-history-30-days.md): staff read the chat history in
  housekeeping, and it is kept 30 days.
- **Decision** [0065](/decisions/0065-walking-500-ms-by-holos-rules.md): habbos walk a step every 500 ms, by Holo's
  rules.
- **Done** [s3-08](/tasks/s3-08-exit-check.md): every exit criterion of S3 passes on the merged work, with two new
  tests: a client browses every list of the navigator, and a habbo builds, changes and deletes a room.
  [S3](/phases/s3-navigator.md) is done.
- **Start** [s3-08](/tasks/s3-08-exit-check.md).
- **Done** [s3-07](/tasks/s3-07-changing-a-room.md): `GETFLATINFO` and `GETFLATCAT` read a room, and its owner changes
  it with `UPDATEFLAT` and deletes it with `DELETEFLAT`.
- **Start** [s3-07](/tasks/s3-07-changing-a-room.md).
- **Done** [s3-06](/tasks/s3-06-creating-a-room.md): the room-o-matic creates a habbo's room, up to 50, with a club
  model only for the club fuse, and `SETFLATCAT` and `SETFLATINFO` set its category, description, hashed password,
  furniture rights and visitors.
- **Start** [s3-06](/tasks/s3-06-creating-a-room.md).
- **Done** [s3-05](/tasks/s3-05-favourites.md): a habbo keeps favourite public rooms and habbo rooms, up to 30, with
  `GETFVRF`, `ADD_FAVORITE_ROOM` and `DEL_FAVORITE_ROOM`.
- **Start** [s3-05](/tasks/s3-05-favourites.md).
- **Done** [s3-04](/tasks/s3-04-room-lists.md): `SUSERF`, `SRCHF` and `GET_RECOMMENDED_ROOMS` list a habbo's own rooms,
  a search, at most 30, and three random rooms, and a search never gives a hidden owner away.
- **Start** [s3-04](/tasks/s3-04-room-lists.md).
- **Done** [s3-03](/tasks/s3-03-browsing.md): `NAVIGATE` lists a category with its sub-categories and its public rooms
  or habbo rooms, and `GETUSERFLATCATS`, `GETPARENTCHAIN` and `GETSPACENODEUSERS` answer.
- **Start** [s3-03](/tasks/s3-03-browsing.md).
- **Done** [s3-02](/tasks/s3-02-navigator-state.md): `virtual/category`, `virtual/model` and `virtual/room` hold the
  navigator's shared data, which `server.New` loads at once or once the updates waiting are applied.
- **Decision** [0064](/decisions/0064-the-navigator-loads-once-the-updates-are-applied.md): the game server starts while
  updates wait, and loads the navigator once they are applied.
- **Start** [s3-02](/tasks/s3-02-navigator-state.md).
- **Done** [s3-01](/tasks/s3-01-navigator-tables.md): the store keeps the navigator's categories, models, public rooms,
  habbo rooms and favourites, and the update `0010-navigator.sql` seeds Holo's categories, public rooms and models.
- **Start** [s3-01](/tasks/s3-01-navigator-tables.md).
- **Update** [S3](/phases/s3-navigator.md) is active, with its exit criteria and the tasks
  [s3-01](/tasks/s3-01-navigator-tables.md) to [s3-08](/tasks/s3-08-exit-check.md), once the user answered its open
  questions.
- **Decision** [0063](/decisions/0063-public-rooms-and-habbo-rooms-apart.md): public rooms and habbo rooms have tables
  of their own.
- **Decision** [0062](/decisions/0062-room-passwords-are-hashed.md): room passwords are stored hashed.
- **Decision** [0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md): a navigator list shows at most 30 rooms.
- **Decision** [0060](/decisions/0060-virtual-category-model-and-room.md): the navigator's shared data lives in
  virtual/category, virtual/model and virtual/room.
- **Decision** [0059](/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md): a deleted room's furni goes to its
  owner's hand.
- **Decision** [0058](/decisions/0058-favourites-saved-up-to-30.md): favourite rooms are saved, up to 30.
- **Decision** [0057](/decisions/0057-three-random-recommended-rooms.md): the recommended rooms are three random habbo
  rooms.
- **Decision** [0056](/decisions/0056-own-rooms-follow-holos-rules.md): a habbo's own rooms follow Holo's rules.
- **Decision** [0055](/decisions/0055-holos-navigator-set.md): a hotel starts with Holo's categories, public rooms and
  room models.
- **Done** [s2-09](/tasks/s2-09-exit-check.md): every exit criterion of S2 passes on the merged work, with two new
  tests: a client logs in end to end, and a CMS sign-in's ticket is accepted once and dies with its session.
  [S2](/phases/s2-login.md) is done.
- **Start** [s2-09](/tasks/s2-09-exit-check.md).
- **Done** [s2-08](/tasks/s2-08-keeping-the-session-alive.md): the server pings every session, closes one that stops
  answering and logs its habbo out, and answers the latency test and logs its reports.
- **Decision** [0054](/decisions/0054-error-reports-wait-for-s7.md): error reports wait for S7.
- **Start** [s2-08](/tasks/s2-08-keeping-the-session-alive.md).
- **Done** [s2-07](/tasks/s2-07-after-login.md): after `LOGIN_OK` the client gets the habbo's fuses, user object,
  credits, badges, achievements, sound setting and club status, and the server's date.
- **Decision** [0051](/decisions/0051-no-achievements-yet.md): a habbo has no achievements yet.
- **Decision** [0052](/decisions/0052-club-status-by-days-per-month.md): the club status splits the club's days by
  club.daysPerMonth.
- **Decision** [0053](/decisions/0053-the-online-habbo-holds-its-own-data.md): the online habbo holds its badges, its
  sound setting and its fuses.
- **Start** [s2-07](/tasks/s2-07-after-login.md).
- **Done** [s2-06](/tasks/s2-06-handshake-and-login.md): `r26` takes a client from `HELLO` to `LOGIN_OK` with an SSO
  ticket, closes a client with the wrong version after its error, and ends a session replaced by a second login with
  287.
- **Decision** [0049](/decisions/0049-a-wrong-version-is-closed.md): a client with the wrong version is closed after its
  error.
- **Decision** [0050](/decisions/0050-the-server-loads-and-reloads-the-settings.md): the game server loads the settings
  and reloads them like the CMS.
- **Start** [s2-06](/tasks/s2-06-handshake-and-login.md).
- **Done** [s2-05](/tasks/s2-05-login-in-game.md): `game` logs a habbo in with an SSO ticket and out, holding it online
  in `virtual/habbo` with its session, and a second login sends the first session `ConcurrentLogin`.
- **Decision** [0047](/decisions/0047-online-habbos-in-virtual-habbo.md): the online habbos live in virtual/habbo.
- **Decision** [0048](/decisions/0048-sessions-through-an-interface-virtual-declares.md): an online habbo keeps its
  session through an interface virtual declares.
- **Start** [s2-05](/tasks/s2-05-login-in-game.md).
- **Done** [s2-04](/tasks/s2-04-fuse-catalogue.md): access groups grant the 31 fuses the client or Holo's server checks,
  club members get Holo's four club fuses, and update `0009-holo-fuses.sql` gives the groups Holo's fuses by level.
- **Decision** [0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md): a habbo's fuses: everyone's two,
  Holo's club set, and every checked fuse from access groups.
- **Decision** [0046](/decisions/0046-the-first-fuses-follow-holos-ranks.md): the first fuses follow Holo's ranks by
  level.
- **Start** [s2-04](/tasks/s2-04-fuse-catalogue.md).

## 2026-11-09

- **Done** [s2-02](/tasks/s2-02-sso-tickets-at-sign-in.md): signing in to the CMS makes an SSO ticket, kept as text with
  its session, which the client page gets with `auth.SSOTicket` and the game server spends once with `SpendSSOTicket`.
- **Decision** [0043](/decisions/0043-the-sign-in-ticket-is-best-effort.md): the sign-in's SSO ticket is best-effort,
  and update 0008 waits for an administrator.
- **Start** [s2-02](/tasks/s2-02-sso-tickets-at-sign-in.md).
- **Done** [s2-03](/tasks/s2-03-saved-login-data.md): `avatar_game_data` keeps each habbo's last time online, the
  machine id of its last game login and its sound setting, through the update `0007-game-login-data.sql`.
- **Decision** [0044](/decisions/0044-game-login-data-has-its-own-table.md): what the game server saves of a habbo has a
  table of its own.
- **Start** [s2-03](/tasks/s2-03-saved-login-data.md).
- **Done** [s2-01](/tasks/s2-01-settings.md): the Game settings form holds the client version, 1 by default, and the ten
  session parameters, as `game.` settings of the catalogue.
- **Decision** [0040](/decisions/0040-the-accepted-client-version-starts-at-1.md): the accepted client version starts at
  1.
- **Decision** [0041](/decisions/0041-an-empty-versioncheck-url-passes.md): an empty VERSIONCHECK URL passes the check.
- **Decision** [0042](/decisions/0042-ping-every-30-seconds.md): the server pings every 30 seconds and closes a session
  after 90 seconds without PONG.
- **Start** [s2-01](/tasks/s2-01-settings.md).
- **Update** [S2](/phases/s2-login.md) is active, with its exit criteria and the tasks
  [s2-01](/tasks/s2-01-settings.md) to [s2-09](/tasks/s2-09-exit-check.md), once the user answered its open questions.
- **Decision** [0039](/decisions/0039-rules-notify-sessions-through-an-interface.md): rules tell sessions about events
  through an interface each session implements.
- **Decision** [0038](/decisions/0038-the-sound-setting-is-saved.md): a habbo's sound setting is saved.
- **Decision** [0037](/decisions/0037-last-online-at-login-and-logout.md): the last time online is written at login and
  at logout.
- **Decision** [0036](/decisions/0036-latency-reports-are-logged.md): latency reports are only logged.
- **Decision** [0035](/decisions/0035-the-machine-id-is-saved-per-habbo.md): the machine id is saved with the habbo at
  each login.
- **Decision** [0034](/decisions/0034-session-parameters-are-settings.md): the session parameters are settings.
- **Decision** [0033](/decisions/0033-one-client-version-from-the-site.md): the server accepts one client version, from
  the site.
- **Decision** [0032](/decisions/0032-the-hotel-is-always-open.md): the hotel is always open.
- **Decision** [0031](/decisions/0031-fuses-defaults-club-and-access-groups.md): a habbo's fuses: a default set, club
  fuses, and staff fuses from access groups.
- **Decision** [0030](/decisions/0030-sso-tickets-from-the-cms-sign-in.md): SSO tickets come from the CMS sign-in and
  live as long as its session.
- **Decision** [0029](/decisions/0029-a-second-login-closes-the-first.md): a second login closes the first session.
- **Decision** [0028](/decisions/0028-sso-only.md): habbos log in with SSO tickets only.
- **Decision** [0027](/decisions/0027-endofcryptoparams-right-after-cryptoparameters.md): the server sends
  ENDOFCRYPTOPARAMS right after CRYPTOPARAMETERS.
- **Done** [s1-23](/tasks/s1-23-exit-check.md): every registration and every send in the client's scripts is in the R26
  reference: 31 registering scripts, 240 message ids, 218 commands and 329 sends. `hh_entry_init` gained its `-1` row,
  and `hh_room`'s count of commands became 73. [S1](/phases/s1-protocol-reference.md) is done.
- **Start** [s1-23](/tasks/s1-23-exit-check.md).
- **Done** [s1-24](/tasks/s1-24-mus-framing.md): [mus](/reference/r26/mus.md) describes `#mus` byte for byte under
  LibreShockwave: one SMUS frame per WebSocket message, the fixed Logon frame, the 12 value types and each message's
  frame, checked against a probe built from LibreShockwave's own bridge.
- **Start** [s1-24](/tasks/s1-24-mus-framing.md).
- **Done** [s1-21](/tasks/s1-21-instant-games.md): [hh_ig](/reference/r26/hh_ig.md) maps 28 messages and 23 commands,
  as registered: the lobby, creating, joining and observing games, loading the arena and the scores. The running game
  lives in downloaded casts the repository lacks, now an open question of S8; the invitations are never reached.
- **Start** [s1-21](/tasks/s1-21-instant-games.md).
- **Done** [s1-06](/tasks/s1-06-room.md): [hh_room](/reference/r26/hh_room.md) maps 72 messages and 73 commands, as
  registered: entering and building a room, users and their status lines, furniture, the hand, trading, teleports,
  rights, groups, ratings, events and ignoring. It explains why Registering scripts counts one fewer of each.
- **Start** [s1-06](/tasks/s1-06-room.md).
- **Done** [s1-18](/tasks/s1-18-soundmachine.md): [hh_soundmachine](/reference/r26/hh_soundmachine.md) maps 17
  messages and 19 commands, as registered: play lists and their play time, the song editor with its sound sets and the
  song's text form, and the jukebox's disks. A length counts 2-second slots, and the play time tenths of a second.
- **Start** [s1-18](/tasks/s1-18-soundmachine.md).
- **Done** [s1-09](/tasks/s1-09-catalogue.md): [hh_cat_code](/reference/r26/hh_cat_code.md) maps 8 messages and 4
  commands, as registered: the index and pages as text, the pet name check, the purchase as eight lines with each
  page's extra value and the gift, and the credit balance.
- **Start** [s1-09](/tasks/s1-09-catalogue.md).
- **Done** [s1-11](/tasks/s1-11-friend-list.md): [hh_friend_list](/reference/r26/hh_friend_list.md) maps 11 messages
  and 10 commands, as registered: the list after the login and its timed updates, friend requests, removal, the user
  search, following a friend and mail notices. `FRIENDLIST_GETOFFLINEFRIENDS` is never sent, and 315's failures are
  never shown.
- **Start** [s1-11](/tasks/s1-11-friend-list.md).
- **Done** [s1-14](/tasks/s1-14-tutorial.md): [hh_tutorial](/reference/r26/hh_tutorial.md) maps 12 messages and 10
  commands, as registered: the tutorial's preferences, configuration, topics and status, and the new-user help's items
  and invitations of guides. A topic's steps name client messages for the client to execute and to wait for.
- **Start** [s1-14](/tasks/s1-14-tutorial.md).
- **Done** [s1-16](/tasks/s1-16-photo.md): [hh_photo](/reference/r26/hh_photo.md) maps 1 message on `#info` and 2 on
  `#mus`, and the photo's `#mus` messages: a photo stored as `PHOTOTXT` and `BINDATA`, fetched with `GETBINDATA` and
  checked by its checksum, and the film count.
- **Start** [s1-16](/tasks/s1-16-photo.md).
- **Done** [s1-07](/tasks/s1-07-room-utils.md): [hh_room_utils](/reference/r26/hh_room_utils.md) maps 7 messages and 6
  commands, as registered: the waiting call for help, one-way doors, and chat, whispers and shouts, which `hh_room`
  sends by the chat mode's name.
- **Start** [s1-07](/tasks/s1-07-room-utils.md).
- **Done** [s1-13](/tasks/s1-13-guide.md): [hh_guide](/reference/r26/hh_guide.md) maps 5 messages and 5 commands, as
  registered: the guide tool's status, waiting for invitations, and accepting or refusing one. The room bar's copies
  of accept and refuse never send.
- **Start** [s1-13](/tasks/s1-13-guide.md).
- **Done** [s1-05](/tasks/s1-05-kiosk-room.md): [hh_kiosk_room](/reference/r26/hh_kiosk_room.md) maps 3 messages and 1
  command, as registered: the Roommatic's `CREATEFLAT` as text, answered by 59, after which it sends `SETFLATCAT` and
  a `SETFLATINFO` in a form of its own, unlike the navigator's.
- **Start** [s1-05](/tasks/s1-05-kiosk-room.md).
- **Done** [s1-12](/tasks/s1-12-instant-messenger.md): [hh_instant_messenger](/reference/r26/hh_instant_messenger.md)
  maps 4 messages and 2 commands, as registered: chats with friends by user id, invitations to the room, and the
  errors of undelivered lines.
- **Start** [s1-12](/tasks/s1-12-instant-messenger.md).
- **Done** [s1-17](/tasks/s1-17-recycler.md): [hh_recycler](/reference/r26/hh_recycler.md) maps 5 messages and 5
  commands, as registered: the rewards and the status, recycling from the hand, and taking or refusing the reward.
  `APPROVE_RECYCLED_FURNI` (224) is never sent.
- **Start** [s1-17](/tasks/s1-17-recycler.md).
- **Done** [s1-15](/tasks/s1-15-poll.md): [hh_poll](/reference/r26/hh_poll.md) maps 3 messages and 3 commands, as
  registered: the offer, the questions and their answers. `POLL_CANCEL` is sent without being registered, so it
  never leaves the client.
- **Start** [s1-15](/tasks/s1-15-poll.md).
- **Done** [s1-19](/tasks/s1-19-roomdimmer.md): [hh_roomdimmer](/reference/r26/hh_roomdimmer.md) maps 1 message and 3 commands, as
  registered: the presets, Apply and On/Off, and the dimmer's state, which comes as its furniture's state string.
- **Start** [s1-19](/tasks/s1-19-roomdimmer.md).
- **Done** [s1-20](/tasks/s1-20-dynamic-downloader.md): [hh_dynamic_downloader](/reference/r26/hh_dynamic_downloader.md)
  maps 2 messages and 2 commands, as registered: the aliases and revisions the client asks for once, before its first
  download, and the address each furniture cast downloads from.
- **Start** [s1-20](/tasks/s1-20-dynamic-downloader.md).
- **Done** [s1-08](/tasks/s1-08-buffer.md): [hh_buffer](/reference/r26/hh_buffer.md) maps 5 messages, which
  `hh_room` registers too, and no command: the client holds the updates of furniture still downloading and replays
  them, so the server needs nothing of its own.
- **Start** [s1-08](/tasks/s1-08-buffer.md).
- **Done** [s1-04](/tasks/s1-04-navigator.md): [hh_navigator](/reference/r26/hh_navigator.md) maps 18 messages
  and 18 commands, as registered: the tree of nodes, the own rooms, the search and the favourites, a flat's settings
  and their changes, entering a room or being refused, and forwarding. `SBUSYF` (13) is never sent.
- **Start** [s1-04](/tasks/s1-04-navigator.md).
- **Update** [S2](/phases/s2-login.md)'s scope says that the figure system's command, `GETAVAILABLESETS`, is
  never sent. Found by [s1-22](/tasks/s1-22-human.md).
- **Done** [s1-22](/tasks/s1-22-human.md): [hh_human](/reference/r26/hh_human.md) maps no message and 1 command,
  `GETAVAILABLESETS`, which no client sends, the two forms of figure string the client reads, and the four figure
  data files it downloads.
- **Update** [S0](/phases/s0-foundations.md) is done, and [S1](/phases/s1-protocol-reference.md) is the active
  phase.
- **Done** [s0-08](/tasks/s0-08-exit-check.md): on the merged state, install, every gate, the server's 47 tests and a
  project of each template pass; S0 meets its exit criteria.
- **Start** [s0-08](/tasks/s0-08-exit-check.md), again: s0-11 is done, so S0's exit criteria are checked on the
  merged state.
- **Done** [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md): for the backend and fullstack templates,
  `validateName` refuses `internal`, `vendor` and `testdata` with `name cannot be <name>: the go tool treats a folder
  named <name> specially`, and the client template takes them; `inter-nal` and the like still make projects.
- **Start** [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md).
- **Decision** [0026](/decisions/0026-refuse-names-the-go-tool-treats-specially.md): for the backend and fullstack
  templates, `validateName` refuses `internal`, `vendor` and `testdata`, whose folders the go tool treats specially;
  the client template keeps them. Answers [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md)'s question,
  and [S0](/phases/s0-foundations.md) has no open questions left.
- **Start** [s1-22](/tasks/s1-22-human.md).
- **Update** [S7](/phases/s7-club-help-extras.md)'s question on club bought in the client says that `SCR_BUY`
  sends the button's number, 1 to 3, not months. Found by [s1-10](/tasks/s1-10-club.md).
- **Done** [s1-10](/tasks/s1-10-club.md): [hh_club](/reference/r26/hh_club.md) maps 3 messages and 3 commands, as
  registered: the club status the client asks for after every 3, its responses and windows, buying by button, and
  the gifts, accepted one at a time.
- **Start** [s1-10](/tasks/s1-10-club.md).
- **Update** [S7](/phases/s7-club-help-extras.md) asks who receives the calls for help and where a staff member who
  follows one is taken: the client checks no right before it shows a call, and waits for the server to move it.
  Found by [s1-03](/tasks/s1-03-shared.md).
- **Done** [s1-03](/tasks/s1-03-shared.md): [hh_shared](/reference/r26/hh_shared.md) maps 7 messages and 8 commands,
  as registered: the calls for help, their pick-up, replies and categories, the mod tool's alerts, kicks and bans, the
  server's date, the error reports and the tracking codes. `GETAVAILABLESETS` (9) is never sent.
- **Start** [s1-03](/tasks/s1-03-shared.md).

## 2026-11-07

- **Blocked** [s0-08](/tasks/s0-08-exit-check.md): s0-10 is done, but [S0](/phases/s0-foundations.md) can be `done`
  only once [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md), which waits for the user's answer, is.
- **Create** [s0-11](/tasks/s0-11-names-the-go-tool-treats-specially.md): `internal`, `vendor` and `testdata` compile
  as Go package names but not as folders: the runners may not import `packages/internal`, the go tool reads
  `packages/vendor` as vendored code, and `./...` skips folders named `testdata`, which fails a backend's gates. What
  `tools/create` does with them is a new open question of [S0](/phases/s0-foundations.md). Found by s0-10.
- **Done** [s0-10](/tasks/s0-10-go-names-that-clash.md): `validateName` refuses, for the backend and fullstack
  templates, a name whose Go package would be a Go keyword, `main`, `init`, or one of the 5 names the backend's Go
  uses or the 15 the fullstack's does, derived from the templates and tested; of 218 names tried in a throwaway
  worktree, none it refuses compiles, and every one it accepts compiles but `internal`, `vendor` and `testdata`.
- **Start** [s0-10](/tasks/s0-10-go-names-that-clash.md).
- **Update** [s0-10](/tasks/s0-10-go-names-that-clash.md)'s question is answered by 0025, and
  [S0](/phases/s0-foundations.md) has no open questions left.
- **Decision** [0025](/decisions/0025-refuse-names-whose-go-package-cannot-compile.md): `validateName` refuses, with a
  plain message, a name whose Go package name cannot compile in the template being made: `main`, a Go keyword, or a
  name the template's own Go already uses; every generated project stays as it is. Answers
  [s0-10](/tasks/s0-10-go-names-that-clash.md)'s question.
- **Blocked** [s0-08](/tasks/s0-08-exit-check.md): every exit criterion of [S0](/phases/s0-foundations.md) passes on
  `main`, from `make install` and `make gates` in a fresh worktree to one project of each template, and
  [How the server is built](/reference/architecture.md) matches the code; S0 can be `done` only once
  [s0-10](/tasks/s0-10-go-names-that-clash.md), which waits for the user's answer, is.
- **Start** [s0-08](/tasks/s0-08-exit-check.md).
- **Done** [s0-07](/tasks/s0-07-r26-sessions.md): `StartInfo` and `StartMus` start a WebSocket listener on the host
  and port of `server.info` and `server.mus`, and the runner calls both. On `info`, `r26` sends `HELLO`, reads packets
  in each session's own goroutine and logs each unhandled one as `r26 <address> unhandled INIT_CRYPTO (206), 0 bytes`;
  on `mus`, the server logs the connect, each size and the close, and never answers.
- **Start** [s0-07](/tasks/s0-07-r26-sessions.md).
- **Create** [s0-10](/tasks/s0-10-go-names-that-clash.md): names whose Go package name is a Go keyword or `main`, or
  a name the generated Go already uses, such as `log`, `http`, `db` or `new`, still make projects that do not compile;
  what `tools/create` does with them is a new open question of [S0](/phases/s0-foundations.md). Found by s0-09.
- **Done** [s0-09](/tasks/s0-09-go-template-names.md): the Go package of `game-server` is `gameserver` while its
  folders and module paths keep the dash, and `create` runs the Go it writes through `go/format`, so the imports are in
  order for any name; projects of both Go templates named `tracker`, `tracker2`, `web-shop` and `game-server` pass
  their gates.
- **Start** [s0-09](/tasks/s0-09-go-template-names.md).
- **Update** [S2](/phases/s2-login.md) asks whether the server waits for `GENERATEKEY` (2002) before it sends
  `ENDOFCRYPTOPARAMS` (278): the client withholds `GENERATEKEY` in some cases, while its handler of 278 checks
  nothing. Found by [s1-02](/tasks/s1-02-entry-init.md); `plans/client`'s C1 asks whether LibreShockwave runs the key
  code at all.
- **Update** [s0-07](/tasks/s0-07-r26-sessions.md)'s steps follow 0021 to 0023,
  [s0-09](/tasks/s0-09-go-template-names.md)'s question is answered by 0024, and [S0](/phases/s0-foundations.md) has
  no open questions left.
- **Decision** [0024](/decisions/0024-go-package-names-drop-the-dash.md): the Go package of a backend or fullstack
  project is its name without the dashes, and folders and module paths keep them. Answers
  [s0-09](/tasks/s0-09-go-template-names.md)'s question.
- **Decision** [0023](/decisions/0023-mus-listener-before-s7.md): until S7 frames MUS, the `mus` listener accepts the
  WebSocket, logs the connect, the size of each message and the close, and never answers. Answers
  [s0-07](/tasks/s0-07-r26-sessions.md)'s question.
- **Decision** [0022](/decisions/0022-start-info-and-start-mus.md): `StartInfo` and `StartMus` of `packages/server`
  start the listeners, for the standalone runner and later the orchestrator; the runner gains the two calls and
  nothing else. Answers [s0-07](/tasks/s0-07-r26-sessions.md)'s question.
- **Decision** [0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md): a packet the server does not
  handle yet is logged as one line with the session's address, the id, the name and the body's size, never the body.
  Answers [s0-07](/tasks/s0-07-r26-sessions.md)'s question.

## 2026-11-06

- **Done** [s1-02](/tasks/s1-02-entry-init.md): [hh_entry_init](/reference/r26/hh_entry_init.md) maps 26 messages
  and 22 commands, as registered, and confirms 0012's handshake step by step, with its bytes. 308 has a second reader
  in `hh_tutorial`, asked for with the same id 228, and what the session parameters carry is a new open question of
  [S2](/phases/s2-login.md).
- **Start** [s1-02](/tasks/s1-02-entry-init.md).
- **Done** [s0-04](/tasks/s0-04-listener-config.md): `config.json` gives `server.info` and `server.mus` a host and a
  port each, by default `localhost` with 30000 and 30001, checked as `cms.host` and refused on one port; the installer
  writes their defaults, and housekeeping offers them to an older `config.json`.
- **Start** [s0-04](/tasks/s0-04-listener-config.md).
- **Update** [S0](/phases/s0-foundations.md), [s0-04](/tasks/s0-04-listener-config.md),
  [s0-07](/tasks/s0-07-r26-sessions.md), [s0-08](/tasks/s0-08-exit-check.md) and
  [How the server is built](/reference/architecture.md) follow 0020: a WebSocket listener on a host and port per
  connection, the exit criterion on WebSocket only, and s0-07 also asks what the `mus` listener does before S7.
- **Decision** [0020](/decisions/0020-info-and-mus-websocket-ports.md): `server.info` and `server.mus` are a host and a
  port each, and the server runs a WebSocket listener on each, which LibreShockwave opens; TCP and WebSocket paths
  wait for later. It supersedes 0019 and answers [s0-04](/tasks/s0-04-listener-config.md)'s question.
- **Done** [s0-06](/tasks/s0-06-encoding.md): `packages/server/encoding` reads and writes B64, VL64, both string
  forms, booleans, bytes and raw bodies byte for byte as ports of the client's scripts do, with UTF-8 text, and fuzzing
  finds no input that makes a reader panic.
- **Start** [s0-06](/tasks/s0-06-encoding.md).
- **Done** [s0-05](/tasks/s0-05-transport.md): `packages/server/transport` serves TCP with `ServeTCP(l, h)` and
  the WebSocket with the `http.Handler` `WebSocket(h)`, both as one `Conn` that closes when its handler returns; the
  WebSocket writes binary frames and reads binary and text frames.
- **Start** [s0-05](/tasks/s0-05-transport.md).
- **Update** [s0-04](/tasks/s0-04-listener-config.md)'s steps follow 0019, and its question leaves
  [S0](/phases/s0-foundations.md)'s open questions.
- **Decision** [0019](/decisions/0019-info-and-mus-listeners.md): the server listens as `server.info` and
  `server.mus`, each on a TCP port, a WebSocket path or both; it supersedes 0007.
- **Done** [s0-03](/tasks/s0-03-scaffold-server.md): `make create name=server template=backend` made
  `packages/server` and `apps/server`, which build and pass the gates as generated, and the package's README lays out
  `transport`, `encoding`, `r26` and `game` as [0005](/decisions/0005-package-layout.md) says, each with the task that
  brings it.
- **Start** [s0-03](/tasks/s0-03-scaffold-server.md).
- **Done** [s0-02](/tasks/s0-02-create-templates.md): `tools/create -template=fullstack|backend|client` makes today's
  projects byte for byte, Go-only backends and plain Vite clients, and a project of each kind passes its gates.
- **Create** [s0-09](/tasks/s0-09-go-template-names.md): the Go templates fail for a name with a `-`, and `gofmt`
  reorders the imports of a name that sorts after `store`. Found by s0-02.
- **Decision** [0018](/decisions/0018-client-is-a-plain-vite-app.md): a client project builds as a plain Vite app,
  `dist/index.html` and its script, with only the port in `vite.config.js`. Answers
  [s0-02](/tasks/s0-02-create-templates.md)'s question and unblocks it.
- **Blocked** [s0-02](/tasks/s0-02-create-templates.md): the fullstack, backend and client templates are written and
  tested, but a client project's `pnpm build` fails: client-r26's library build needs a global name, `_director`
  there. How a client builds is asked to the user.
- **Decision** [0017](/decisions/0017-client-vite-port.md): the client template derives its Vite port from the
  name, in 30000 to 39999 of its own; `client-r18` gets 30050. Answers [s0-02](/tasks/s0-02-create-templates.md)'s
  question.
- **Start** [s0-02](/tasks/s0-02-create-templates.md).
- **Update** [the rules](/rules.md#branches): once merged, the agent removes its worktree and deletes its branch
  (`plans/holo-port/decisions/0101-agents-clean-up-worktrees.md`).
- **Update** [s1-24](/tasks/s1-24-mus-framing.md) reads LibreShockwave in the submodule `vendor/LibreShockwave`
  (`plans/client/decisions/0003-libreshockwave-submodule.md`), and [S2](/phases/s2-login.md)'s question about the
  `/client` page points at `plans/client`, phase C1.
- **Update** [The Holograph Emulator](/reference/holoemu.md) describes `source/holoemu`: its layout, its dumps and how
  to read it, and [the rules](/rules.md) gain "Reading the emulator".
- **Decision** [0016](/decisions/0016-holoemu-is-a-reference.md): the Holograph Emulator is a reference, read when the
  client's `.ls` scripts are not enough, and never a port.

- **Create** [s1-24](/tasks/s1-24-mus-framing.md): the MUS framing of `#mus`, from LibreShockwave's Multiuser Xtra.
- **Decision** [0015](/decisions/0015-client-on-libreshockwave.md): the client runs on LibreShockwave, every socket is
  a WebSocket, and the `#mus` framing comes from LibreShockwave's source. Answers s0-05's question (binary frames) and
  S7's question on the `#mus` format.
- **Decision** [0014](/decisions/0014-text-is-utf8.md): text on the wire is UTF-8. Answers s0-06's question.

## 2026-11-05

- **Done** [s1-01](/tasks/s1-01-fuse-client.md): [fuse_client](/reference/r26/fuse_client.md) describes the
  connections, framing and values with worked examples. Text is UTF-8 only when `client.textdata.utf8` is on, a new
  open question of [s0-06](/tasks/s0-06-encoding.md). The `#mus` byte format is the Multiuser Xtra's, in no `.ls`
  script: an open question for S7.
- **Start** [s1-01](/tasks/s1-01-fuse-client.md).
- **Done** [s0-01](/tasks/s0-01-plan-bundle.md): the bundle, the `tracking-plans` skill and the `.claude/skills` link
  exist, and the bundle passes its checks.
- **Create** [s0-02](/tasks/s0-02-create-templates.md) to [s0-08](/tasks/s0-08-exit-check.md), S0's tasks, and
  [s1-01](/tasks/s1-01-fuse-client.md) to [s1-23](/tasks/s1-23-exit-check.md), S1's tasks.
- **Update** [S0](/phases/s0-foundations.md) and [S1](/phases/s1-protocol-reference.md) are active; S2 to S9 are
  planned, each with its open questions.
- **Decision** [0013](/decisions/0013-site-changes-like-mus.md): changes from the site reach the server like Holo's MUS
  commands, and under the orchestrator the CMS and housekeeping change the virtual state directly.
- **Decision** [0012](/decisions/0012-no-encryption.md): the server skips the client's encryption.
- **Decision** [0011](/decisions/0011-saved-and-memory-only-data.md): what the server saves and what lives only in
  memory.
- **Decision** [0010](/decisions/0010-hot-data-written-at-once.md): a change to hot data reaches the database at once.
- **Decision** [0009](/decisions/0009-virtual-holds-the-server-state.md): `packages/virtual` holds the hot data,
  loaded when needed and dropped when unused, and the temporary data.
- **Decision** [0008](/decisions/0008-reverse-engineer-ls-only.md): the R26 protocol comes from the client's `.ls`
  scripts.
- **Decision** [0007](/decisions/0007-protocols-per-listener.md): `r26` is the protocol package, each listener names
  its protocol, and r18 is a door left open.
- **Decision** [0006](/decisions/0006-transport.md): TCP and WebSocket are one byte-stream `Conn`, and the WebSocket
  mounts on any HTTP mux.
- **Decision** [0005](/decisions/0005-package-layout.md): the server lives in `packages/server`, and `virtual` holds
  only state.
- **Decision** [0004](/decisions/0004-old-server-is-the-model.md): the server deleted in `2ea51d7b` is the model for
  the structure.
- **Decision** [0003](/decisions/0003-create-templates.md): `tools/create` makes fullstack, backend and client projects.
- **Decision** [0002](/decisions/0002-server-app.md): the game server is `packages/server` and `apps/server`, with no
  web pages.
- **Decision** [0001](/decisions/0001-plan-in-plans-server.md): the plan lives in `plans/server`, worked through the
  `tracking-plans` skill.
- **Start** [s0-01](/tasks/s0-01-plan-bundle.md).
- **Create** the bundle and [s0-01](/tasks/s0-01-plan-bundle.md), from the user's request for a game server plan in the
  format of `plans/holo-port`.
