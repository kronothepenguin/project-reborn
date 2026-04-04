# Task: hh_guide — Guide Tool (Player Helper)

**Priority:** P7  
**Status:** 🔴 Not started  
**Source:** `casts/hh_guide/` (3 scripts, 3 `.window.txt`, thread.index, variable.index)

## Description

Guide tool — player helper system. Players can request guides (experienced players) for help.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Guide Interface Class` | Script | Guide tool window |
| `Guide Component Class` | Script | Guide state |
| `Guide Handler Class` | Script | Server messages |
| `Guide Tool Icon Class` | Script | Guide tool icon in room bar |

## Thread Index
```
thread.id = guide
```

## Window Files (3)
- `guide_tool_start.window.txt` — Start guide session
- `guide_tool_waiting.window.txt` — Waiting for guide
- `guide_tool_invite.window.txt` — Guide invitation

## Translation Criteria

1. **Guide Interface**: Request a guide, accept guide sessions
2. **Tool Icon**: Icon in room bar to toggle guide tool
3. **Waiting**: Animated waiting state while searching for available guide
4. **Invitation**: Accept/decline guide invitations

## Cross-Cast Dependencies
- Uses `hh_interface` for UI
