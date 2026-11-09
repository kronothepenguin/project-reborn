---
type: Reference
title: R26 hh_roomdimmer
description: How the R26 client loads a room dimmer's presets, saves and applies one, turns the dimmer on and off, and fades the room to the state the dimmer's furniture carries, from hh_roomdimmer's .ls scripts.
timestamp: 2026-11-09T18:29:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:29:18+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_roomdimmer/`. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `4_Roomdimmer Interface Class.ls` | The control panel: the presets, the effect, the colour and the lightness, Apply and On/Off |
| `5_Roomdimmer Component Class.ls` | The presets, the dimmer's state and the fade to it; sends the three commands |
| `6_Roomdimmer Handler Class.ls` | Registers 1 message and 3 commands |
| `8_Furniture Roomdimmer Class.ls` | The dimmer as furniture in a room: its state string and its double click |
| `9_Color Converter Class.ls` | RGB to HSL and back, for the lightness |

The dimmer's state reaches the client as the state of its furniture, in `hh_room`'s messages about active objects
([s1-06](/tasks/s1-06-room.md)), and the room's owner flag, `room_owner`, comes from `hh_room` too.

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 365 | `handleDimmerPresets` | `#info` | int n; int selected preset id; then n × (int preset id; int effect; string colour; int lightness) | The answer to `MSG_ROOMDIMMER_GET_PRESETS`. The colour is `#RRGGBB`. The selected preset id is read and not kept |

# Commands from the client

Registered by `6_Roomdimmer Handler Class.ls`. Every sender calls `send`: with no body it sends the id alone, and with
a typed list it goes through `sendNew` ([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 341 | `MSG_ROOMDIMMER_GET_PRESETS` | `#info` | `5_Roomdimmer Component Class.ls`: `roomdimmerDefined`, no body | none | When a dimmer is placed in the room the client shows |
| 342 | `MSG_ROOMDIMMER_SET_PRESET` | `#info` | `5_Roomdimmer Component Class.ls`: `savePreset`, typed | int preset id; int effect; string colour, `#RRGGBB`; int lightness; bool apply: always true | Apply on the control panel |
| 343 | `MSG_ROOMDIMMER_CHANGE_STATE` | `#info` | `5_Roomdimmer Component Class.ls`: `toggleOnoff`, no body | none | On/Off on the control panel |

# Flows

## Loading the presets

1. When `hh_room` defines a room dimmer in the room, and not in the hand, the client sends
   `MSG_ROOMDIMMER_GET_PRESETS`.
2. The server answers 365 with the presets. Until it does, a double click opens nothing.

## Using the dimmer

1. The room's owner double-clicks the dimmer, which opens the control panel; anyone else selects it as other
   furniture.
2. The panel shows the presets of 365. A preset button chooses one, the palette a colour, the slider a lightness, and
   `background only` switches the effect between 1 and 2.
3. Apply sends `MSG_ROOMDIMMER_SET_PRESET` with the chosen preset, and the client keeps it as sent.
4. On/Off sends `MSG_ROOMDIMMER_CHANGE_STATE`.
5. The client changes nothing by itself: the room changes when the dimmer's furniture gets a new state.

## The dimmer's state

The dimmer's furniture carries a state string of 5 items separated by commas:

| Item | What it is |
| --- | --- |
| state | 2 is on; anything else is off |
| preset id | |
| effect | 1 sets the dimmer's colour (`#setDimmerColor`), 2 colours the whole room (`#colorizeRoom`) |
| colour | `#RRGGBB` |
| lightness | Takes the place of the colour's lightness, in HSL |

A string of fewer than 5 items sets the furniture's state to 1 and leaves the dimmer alone. On, the client fades from
the colour it shows to the new one over 1.5 seconds; off, it removes the effect at once.

# Notes

## Counts

`6_Roomdimmer Handler Class.ls` registers 1 message and 3 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says. No other cast registers them.

## Quirks

- 365's selected preset id is never used: the selected preset comes from the dimmer's state.
- `MSG_ROOMDIMMER_SET_PRESET` always sends true as its last field.
- The component stops listening to `#roomdimmer_selected` and `#roomdimmer_removed` when it is gone, and goes on
  listening to `#roomdimmer_defined` and `#roomdimmer_set_state`.
