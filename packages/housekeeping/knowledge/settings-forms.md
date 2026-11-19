---
type: Reference
title: The settings forms
description: How GET /settings and POST /settings/{section} lay the declared settings out as forms, save a section all or nothing, and start or stop the game after a switch.
---

# The forms

`GET /settings` and `POST /settings/{section}` are forms over `settings.Declared()`.

- `forms` in `internal/router/settings.go` gives them Holo's texts. A setting it leaves unnamed still gets a form,
  with its key as its label, so a setting declared later is editable at once.
- `hiddenSettings` keeps `housekeeping.note` for the dashboard.
- A field's kind comes from its declaration: toggle, number, text, a choice from a list, or a long text. A long text
  takes one row per 60 characters, from 2 to 10, as Holo's content tool sized it.
- A setting marked `secret` in the catalogue is a password field: `settings.Declared` keeps its value out, a blank field
  keeps it, and a checkbox clears it.

# A save

- A post reads only the fields of its section, so a form reaches no other key.
- It saves all of them or none: `settings.Validate` checks them together, then `setAll` writes each with
  `settings.Set`, in one transaction with the staff log row, so a value back at its default deletes the row.
- `setAll` lets a refused key wait for the others, because a rule across two keys, as the password limits, can refuse
  the first until the second is written. A round that writes nothing is a real failure.
- One staff log row lists the changed keys ([the staff log](/staff-log.md)).
- A save redirects to `?section=…&saved=1`, so a reload shows the message without posting again.

# The game's switches

- `site.maintenance` (Turn your site on/off) and `game.closed` (Turn your hotel on/off) close the game's doors while
  either is on. The game reads both when it starts.
- A save that turned one on calls `Hotel.Stop`; a save that turned one off calls `Hotel.Start`, and the game keeps its
  doors closed while the other is still on. The call runs after the commit, with a context of its own of 15 seconds,
  because a stop holds the players' connections for 5. A failure is logged and the save stands.
- The form of the hotel's switch says whether the game runs and how many habbos are inside, or "The game server gives
  no answer." when `Hotel.Status` fails, takes over a second, or no game is injected.
- The dashboard asks `Hotel.Status` too, with the same second, and shows the habbos online beside Members, 0 while the
  game gives no answer.
