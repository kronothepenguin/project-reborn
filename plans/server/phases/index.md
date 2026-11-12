# Phases

S0 and S1 run in parallel: S0 builds the server's foundations, and S1 writes the protocol reference that the later
phases implement from. From S2 on, each phase builds a part of the hotel. The order from S2 on was proposed while
planning, and the user may change it.

## Order

1. [S0 Foundations](/phases/s0-foundations.md) — The plan and its skill, the three tools/create templates, and an empty server that accepts R26 clients over WebSocket, frames their packets and answers HELLO. **Done.**
2. [S1 R26 protocol reference](/phases/s1-protocol-reference.md) — Every message the R26 client receives and every command it sends, reverse engineered from the .ls scripts into one reference document per cast, which the later phases implement from. **Done.**
3. [S2 Login and session](/phases/s2-login.md) — A habbo logs in with an SSO ticket and reaches the hotel view with their name, look, credits, badges and settings, and the session stays alive. **Done.**
4. [S3 Navigator](/phases/s3-navigator.md) — The navigator lists the public rooms and the habbos' rooms, searches and keeps favourites, and habbos create, edit and delete their rooms. **Done.**
5. [S4 Rooms](/phases/s4-rooms.md) — Habbos enter rooms, see each other, walk, talk and act, and owners manage rights, the doorbell, kicks and bans. **Done.**
6. [S5 Furni, catalogue and trading](/phases/s5-furni-catalogue.md) — Habbos buy furni in the catalogue, keep it in their hand, place, move and use it in rooms, trade it and recycle it. **Done.**
7. [S6 Friends and messenger](/phases/s6-friends.md) — Habbos keep a friends list, send and answer friend requests, search habbos, follow friends and chat with them in the messenger.
8. [S7 Club, help and extras](/phases/s7-club-help-extras.md) — The smaller casts: club purchases and gifts, the tutorial and new-user help, guides, polls, photos, the sound machine, the room dimmer, pets, the call for help and error reports.
9. [S8 Instant games](/phases/s8-instant-games.md) — Habbos create, join and play the instant games of hh_ig, from the lobby to the arena, with the Game Hall of Fame.
10. [S9 Changes from the site](/phases/s9-site-changes.md) — Changes the CMS and housekeeping make to what the server holds reach players who are online at once, through commands like Holo's MUS, or directly under the orchestrator.

## Later

r18 and the orchestrator: `plans/later.md`.
