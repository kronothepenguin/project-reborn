# TICKET-014: Instant Messenger / Console

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client
**Depends on:** TICKET-012

## Summary
Implement the instant messaging console so that friends can send private messages to each other regardless of which room they are in. The client sends MESSENGER_SENDMSG (outbound 33); the server delivers IMMESSAGE (inbound 134) to the recipient's session if online, or persists it for offline delivery. `handleMESSENGER_SENDMSG` in `instant_messenger.go` is a one-line nil stub.

## Server (Go)
- Package: `internal/app/game/protocol/hh_instant_messenger/`
- Inbound commands to implement:
  - 33 `MESSENGER_SENDMSG` (handleMESSENGER_SENDMSG) — read `recipientID int` and `message string`; validate caller and recipient are friends (check `friendships` table); if recipient is online, send IMMESSAGE (134) to their session with `{senderID, senderName, timestamp, message}`; if offline, persist to a `messages` table; send IMERROR (261) if recipient not found or not a friend
  - 34 `FRIEND_INVITE` (handleFRIEND_INVITE) — read `recipientID int` and `message string`; send IMINVITATION (135) to the recipient with the inviter's current room ID; used for "join me in my room" invite; send INVITATIONERROR (262) if recipient is not a friend or already in a room
- Offline message delivery: on FRIENDLIST_INIT (login), query `messages` table for unread messages addressed to the user; send each as IMMESSAGE to the session; mark as delivered
- Outbound commands (all registered): IMMESSAGE (134), IMINVITATION (135), IMERROR (261), INVITATIONERROR (262)
- DB changes needed: yes
  - New table `messages`: `id INT PK AUTOINCREMENT`, `sender_id INT FK users_avatar`, `recipient_id INT FK users_avatar`, `body TEXT`, `sent_at DATETIME`, `delivered BOOL DEFAULT FALSE`
  - Add sqlc queries: `InsertMessage`, `GetUndeliveredMessages`, `MarkMessagesDelivered`
- Virtual state changes:
  - `pkg/virtual/hotel.go`: add `FindSessionByHabboID(id int) Session` for online delivery routing

## Client (Godot)
- Scene/script: `client/hh_instant_messenger/`
- `client/hh_instant_messenger/` is currently empty.
- What to implement:
  - `hh_instant_messenger.gd` — registers IMMESSAGE (134), IMINVITATION (135), IMERROR (261) listeners
  - `im_window.tscn` — tabbed chat window; each tab is a conversation with one friend
  - Opening a tab: clicking a friend in the friend list opens/focuses their IM tab; sends a new message via text field + Enter
  - On send: send MESSENGER_SENDMSG (33) with `recipientID` and message text
  - On IMMESSAGE (134): parse `senderID, senderName, timestamp, message`; open or focus the sender's tab; append message to chat log with timestamp
  - On IMERROR (261): show error notification (e.g. "Failed to send message")
  - On IMINVITATION (135): show invitation popup with sender name and "Accept" button; Accept initiates room entry for the invitation room ID
  - Room invitation send: "Invite to room" button in friend context menu sends FRIEND_INVITE (34) with current room ID
  - Reference: `casts/hh_instant_messenger/3_Instant Messenger Interface Class.ls`, `casts/hh_instant_messenger/7_IM Chat Renderer Class.ls`, `casts/hh_instant_messenger/8_IM Tabs Class.ls`

## Acceptance criteria
- [ ] Sending a message to an online friend delivers IMMESSAGE to their session in real time
- [ ] Sent message appears in the sender's chat tab with a "sent" indicator
- [ ] Received message opens the sender's IM tab (or indicates unread if already open on a different tab)
- [ ] Sending to a non-friend results in IMERROR (261); client shows error notification
- [ ] Offline messages: sending to an offline friend persists the message; recipient receives it on next login
- [ ] Unread message count indicator is shown on the IM button/icon in the hotel bar
- [ ] Room invitation: sending FRIEND_INVITE delivers IMINVITATION to the recipient; Accept initiates room entry
- [ ] INVITATIONERROR is shown as a notification to the inviter if the invite cannot be delivered
- [ ] Multiple concurrent IM tabs are supported; switching tabs shows the correct conversation history

## Notes
- IMMESSAGE payload format: the existing protocol.go infrastructure should handle this as standard String/Int args. Verify the exact field order expected by the client by checking `casts/hh_instant_messenger/5_Instant Messenger Handler Class.ls`.
- Message body length limit: 512 characters server-side; truncate silently.
- For offline delivery, messages older than 30 days can be purged by a maintenance task (POST-MVP).
- The IM window is separate from room chat — it operates on the friend-list connection context, not the room session.
