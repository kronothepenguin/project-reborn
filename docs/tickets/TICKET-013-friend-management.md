# TICKET-013: Friend Management

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client
**Depends on:** TICKET-012

## Summary
Implement add friend (request + accept/decline), remove friend, Habbo search, and follow friend. The handler stubs in `friend_list.go` are registered but return nil. This ticket implements all CRUD operations for the friendship relationship so users can build their social graph.

## Server (Go)
- Package: `internal/app/game/protocol/hh_friend_list/`
- Inbound commands to implement (currently nil stubs):
  - 39 `FRIENDLIST_FRIENDREQUEST` (handleFRIENDLIST_FRIENDREQUEST) — read `targetName string`; look up target by name in online sessions or DB; if target has friend requests enabled, send FRIENDREQUEST (132) to the target's session with the requester's ID and name; add pending request to target's `FriendList.Requests`; if target offline, persist request to DB
  - 37 `FRIENDLIST_ACCEPTFRIEND` (handleFRIENDLIST_ACCEPTFRIEND) — read `requesterID int`; validate request exists; insert bidirectional rows into `friendships`; send FRIENDLISTUPDATE to both parties with the new friend entry
  - 38 `FRIENDLIST_DECLINEFRIEND` (handleFRIENDLIST_DECLINEFRIEND) — read `requesterID int`; remove the pending request; optionally send FRIENDREQUESTRESULT (315) with failure code
  - 233 `FRIENDLIST_GETFRIENDREQUESTS` (handleFRIENDLIST_GETFRIENDREQUESTS) — query DB for pending requests where `friend_id = sessionUserID`; send FRIENDREQUESTLIST (314) with count and each requester's ID+name
  - 40 `FRIENDLIST_REMOVEFRIEND` (handleFRIENDLIST_REMOVEFRIEND) — partially implemented (sends FRIENDLISTUPDATE with remove op) but doesn't delete from DB; add `DELETE FROM friendships WHERE (user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)`; also send update to the other party if online
  - 41 `MESSENGER_HABBOSEARCH` (handleMESSENGER_HABBOSEARCH) — read `query string`; search `users_avatar` by name LIKE; send HABBOSEARCHRESULT (435) with matching users (online/offline status, figure)
  - 262 `FOLLOW_FRIEND` (handleFOLLOW_FRIEND) — read `friendID int`; check friend is online and in a room; send ROOMFORWARD (286) to the follower with the friend's current room ID; send FOLLOWFAILED (349) if friend is offline or in a non-followable room
- Outbound commands (all registered): FRIENDREQUEST (132), FRIENDREQUESTLIST (314), FRIENDREQUESTRESULT (315), FRIENDLISTUPDATE (13), HABBOSEARCHRESULT (435), FOLLOWFAILED (349), ROOMFORWARD (286 — registered in hh_navigator)
- DB changes needed: yes
  - New table `friend_requests`: `requester_id INT FK users_avatar`, `recipient_id INT FK users_avatar`, `created_at DATETIME`; composite PK
  - Add sqlc queries: `InsertFriendRequest`, `GetPendingRequestsForUser`, `DeleteFriendRequest`, `InsertFriendship`, `DeleteFriendship`
- Virtual state changes:
  - `pkg/virtual/friend_list.go`: add `Requests []FriendRequest` to `FriendList`; `FriendRequest{RequesterID int, RequesterName string}`
  - `pkg/virtual/hotel.go`: add `FindHabboByName(name string) *Habbo` (online lookup); add `FindHabboInDB(storage, name string)` for offline lookup

## Client (Godot)
- Scene/script: `client/hh_friend_list/`
- Builds on TICKET-012 friend list window.
- What to implement:
  - Search tab: text field + search button; sends MESSENGER_HABBOSEARCH (41); displays HABBOSEARCHRESULT (435) as a list of users with "Add Friend" button; clicking Add sends FRIENDLIST_FRIENDREQUEST (39)
  - Friend request notification: on FRIENDREQUEST (132) inbound, show alert with requester name and "Accept / Decline" buttons; Accept sends FRIENDLIST_ACCEPTFRIEND (37); Decline sends FRIENDLIST_DECLINEFRIEND (38)
  - Pending requests tab: send FRIENDLIST_GETFRIENDREQUESTS (233) on window open; display FRIENDREQUESTLIST (314) with accept/decline per entry
  - Remove friend: right-click on friend row -> "Remove Friend" confirmation; sends FRIENDLIST_REMOVEFRIEND (40)
  - Follow friend: right-click on online friend -> "Follow"; sends FOLLOW_FRIEND (262); on ROOMFORWARD (286) response, initiate room entry flow for that room ID; on FOLLOWFAILED (349), show "Friend not available to follow" message
  - Reference: `casts/hh_friend_list/15_Friend Search Results View.ls`, `casts/hh_friend_list/14_Friend Request List View.ls`, `casts/hh_friend_list/11_Friend List Actions Base.ls`

## Acceptance criteria
- [ ] Searching by partial name returns matching users; "Add Friend" button is visible for non-friends
- [ ] Sending a friend request delivers FRIENDREQUEST to the target's session if online
- [ ] Pending request is stored in DB and delivered via FRIENDREQUESTLIST if target is offline
- [ ] Accepting a friend request adds both parties to each other's friend list immediately
- [ ] Declining removes the request without error
- [ ] Removing a friend updates both parties' friend lists and deletes the DB row
- [ ] HABBOSEARCHRESULT includes online status for each result
- [ ] Follow friend: if friend is in a room, ROOMFORWARD is received and room entry is initiated
- [ ] FOLLOWFAILED shows an informative message when follow is not possible

## Notes
- ROOMFORWARD (286) is registered in `hh_navigator`, not `hh_room` or `hh_friend_list`. The client must listen for it regardless of which window is focused and treat it as a room redirect.
- The `FRIENDLISTUPDATE` format for a new friend uses update type 0 (add); for remove, type -1. The `serializeUpdateFriends` helper in `friend_list.go` already takes `updateType int`.
- Habbo search results include both online and offline habbos; offline ones have `Online=0`.
