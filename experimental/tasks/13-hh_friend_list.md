# Task: hh_friend_list — Friends System

**Priority:** P5  
**Status:** 🔴 Not started  
**Source:** `casts/hh_friend_list/` (7 script members, 6 `.window.txt`, thread.index, variable.index, 30+ bitmaps)

## Description

Friends list system. Display online/offline friends, manage friend requests, search friends, show user info.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Friend List Interface Class` | Script | Main friend list window |
| `Friend List Component Class` | Script | Friend list state |
| `Friend List Handler Class` | Script | Server message handling |
| `Friend List Container` | Script | Friend list view container |
| `Friend Request List Container` | Script | Incoming friend requests |
| `Friend List View Base` | Script | Base view class |
| `Friend List Actions Base` | Script | Base actions class |
| `Friend Online/Offline/Request List View` | Script | List views by status |
| `Friend Search Results View` | Script | Search results display |
| `Friend Infobox Class` | Script | Friend info popup |

## Thread Index
```
thread.id = friend_list
```

## Window Files (6)
- `friends_list_offline/online/base/friend_requests/search.window.txt` — List view variants
- `friendlist_userinfo.window.txt` — User info popup

## Bitmaps (30+)
- Panels, icons, buttons, shadows for friend list UI

## Translation Criteria

1. **Friend List Interface**: Main window with tabs (online, offline, requests, search)
2. **List Views**: Scrollable list with friend name, status, location (in room)
3. **Friend Requests**: Accept/decline incoming requests
4. **Search**: Search users by name, send friend requests
5. **Infobox**: Popup with friend details when hovering/clicking

## Cross-Cast Dependencies
- Uses `hh_interface` for UI widgets
- Used by `hh_instant_messenger` for friend data
- Used by `hh_room_ui` for instant friend request
