# Task: hh_instant_messenger — IM Client

**Priority:** P4  
**Status:** 🔴 Not started  
**Source:** `casts/hh_instant_messenger/` (5 script members, 3 `.window.txt`, thread.index, variable.index, 37 bitmaps)

## Description

The instant messenger client. Chat with friends, receive invitations, manage online status.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Instant Messenger Interface Class` | Script | Main IM window |
| `Instant Messenger Component Class` | Script | IM state/component |
| `Instant Messenger Handler Class` | Script | Server message handling |
| `IM Chat Renderer Class` | Script | Chat message rendering |
| `IM Tabs Class` | Script | Tab management (multiple chats) |

## Thread Index
```
thread.id = instant_messenger
```

## Window Files (3)
- `instant_message.window.txt` — Main IM window
- `friend_invitation.window.txt` — Friend invitation dialog
- `empty_im.window.txt` — Empty IM state

## Bitmaps (37)
- Tabs, buttons, shadows, borders for IM UI

## Translation Criteria

1. **IM Interface**: Main window with friend list, online/offline status, chat tabs
2. **Chat Renderer**: Message bubbles, timestamps, typing indicators
3. **Tabs**: Multiple concurrent chat sessions
4. **Invitations**: Accept/decline game invites from IM
5. **Online Status**: Track friend online status, show in room

## Cross-Cast Dependencies
- References `hh_ig` for minigame invites shown in IM
- References `hh_friend_list` for friend data
- Uses `hh_interface` for IM UI elements
