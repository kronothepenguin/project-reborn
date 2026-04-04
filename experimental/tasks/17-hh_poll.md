# Task: hh_poll — Poll System

**Priority:** P5  
**Status:** 🔴 Not started  
**Source:** `casts/hh_poll/` (3 scripts, 6 `.window.txt`, thread.index, variable.index)

## Description

Poll system. Display and respond to hotel-wide or room-specific polls.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Poll Interface Class` | Script | Poll window/controller |
| `Poll Component Class` | Script | Poll state |
| `Poll Handler Class` | Script | Server messages |

## Thread Index
```
thread.id = poll
```

## Window Files (6)
- `poll_question_main/open/selection_1.window.txt` — Question display variants
- `poll_offer.window.txt` — Poll offer dialog
- `poll_thank_you.window.txt` — Thank you after voting
- `poll_purkka.window.txt` — Poll variant

## Translation Criteria

1. **Poll Interface**: Show poll questions, multiple choice or text input
2. **Poll Offer**: Modal dialog that blocks until user responds or dismisses
3. **Thank You**: Confirmation after submitting poll
4. **Server Messages**: Receive poll data, submit responses

## Cross-Cast Dependencies
- Uses `hh_interface` for UI dialogs
