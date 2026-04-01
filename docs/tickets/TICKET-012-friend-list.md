# TICKET-012: Friend List - View

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** none (login/hh_entry_init already done)

## Summary
Implement the friend list initialization flow so that after login the client receives a FRIENDLISTINIT (12) response containing the user's online and offline friends with their figures and online status. The `handleFriendListInit` handler in `friend_list.go` already has structure for serialization but depends on a `habbo.FriendList` that is loaded in `habbo.load()` — the `loadFriendList` function exists but needs DB backing. This ticket makes the friend list window functional with real data.

## Server (Go)
- Package: `internal/app/game/protocol/hh_friend_list/`
- Inbound commands to implement:
  - 12 `FRIENDLIST_INIT` (handleFriendListInit) — handler is substantially implemented; serializes categories and friends using `serializeFriends` and `serializeCategories`. The gap is `habbo.FriendList` being populated from DB rather than returning an empty struct. Verify `loadFriendList` in `habbo.go` runs the correct DB query.
  - 15 `FRIENDLIST_UPDATE` (handleFriendListUpdate) — currently sends FRIENDLISTUPDATE with no args (missing categories/friends); fix to send proper delta update; for now, sending a full re-serialization is acceptable
- Online presence broadcast: when a Habbo logs in, find all their friends who are currently online and send FRIENDLISTUPDATE (13) to each friend's session with the newly-logged-in friend marked as online; reverse on logout
- Outbound commands (all registered): FRIENDLISTINIT (12), FRIENDLISTUPDATE (13)
- DB changes needed: yes
  - New table `friendships`: `user_id INT FK users_avatar`, `friend_id INT FK users_avatar`, `category_id INT DEFAULT 0`; composite PK `(user_id, friend_id)`; unique constraint ensures no duplicates
  - New table `friend_categories`: `id INT PK AUTOINCREMENT`, `owner_id INT FK users_avatar`, `name TEXT`
  - Add sqlc queries: `GetFriendsByUserID`, `GetFriendCategoriesByUserID`
- Virtual state changes:
  - `pkg/virtual/friend_list.go`: `FriendList` struct with `Friends []Friend`, `Categories []FriendListCategory`, `Requests []FriendRequest`, `ExtendedLimit int`; `loadFriendList(storage, userID)` must execute the DB query and populate this struct
  - `pkg/virtual/friend_list.go`: `Friend` struct already exists with ID/Name/Sex/Online/CanFollow/Figure/CategoryID/Mission/LastAccess — ensure `Online int` is set by checking `Hotel.Sessions` map at load time
  - `pkg/virtual/hotel.go`: add `FindOnlineHabboByID(id int) *Habbo` helper for online status resolution

## Client (Godot)
- Scene/script: `client/hh_friend_list/`
- `client/hh_friend_list/` is currently empty.
- What to implement:
  - `hh_friend_list.gd` — cast entry point; registers FRIENDLISTINIT (12) and FRIENDLISTUPDATE (13) listeners on `message_bus`; sends FRIENDLIST_INIT (outbound 12) on cast load
  - `friend_list_window.tscn` — friend list window UI with online/offline tabs
  - `friend_list_online.gd` — populates online friends list from FRIENDLISTINIT; each row: figure thumbnail, name, online indicator
  - `friend_list_offline.gd` — populates offline friends list (grayed out)
  - On FRIENDLISTUPDATE (13): apply delta changes (friend came online/went offline); move friend between tabs
  - Friend limit display: show `current / max` count from FRIENDLISTINIT header fields
  - Reference: `casts/hh_friend_list/3_Friend List Interface Class.ls`, `casts/hh_friend_list/12_Friend Online List View.ls`, `casts/hh_friend_list/13_Friend Offline List View.ls`

## Acceptance criteria
- [ ] FRIENDLIST_INIT is sent by the client after login
- [ ] Server responds with FRIENDLISTINIT containing correct friend count and friend data from DB
- [ ] Online friends appear in the online tab; offline friends in the offline tab
- [ ] Friend figure is displayed as a small avatar thumbnail for each friend entry
- [ ] When a friend logs in after you, a FRIENDLISTUPDATE moves them to the online tab
- [ ] When a friend logs out, FRIENDLISTUPDATE moves them to the offline tab
- [ ] Friend list with 0 friends renders an empty state without error
- [ ] Friend limit (max/extended) is displayed correctly in the window header

## Notes
- `serializeFriends` in `friend_list.go` is already implemented correctly; only the data source needs to be real.
- `Friend.Online` is an int in the virtual struct (0=offline, 1=online, 2=in room); set appropriately.
- `Friend.CanFollow` (0 or 1) indicates whether the friend is followable (in a room); resolve via `Hotel.FindOnlineHabboByID`.
- Category ID 0 is the default "Friends" category.
- `MAILNOTIFICATION` (363) and `MAILCOUNTNOTIFICATION` (364) are companion messages sent after FRIENDLISTINIT in some client versions; stub them out by sending count=0.
