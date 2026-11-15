---
type: Reference
title: The settings forms
description: How GET /settings and POST /settings/{section} lay the declared settings out as forms and save a section all or nothing.
---

# The forms

`GET /settings` and `POST /settings/{section}` are forms over `settings.Declared()`.

- `forms` in `internal/router/settings.go` gives them Holo's texts. A setting it leaves unnamed still gets a form,
  with its key as its label, so a setting declared later is editable at once.
- `hiddenSettings` keeps `housekeeping.note` for the dashboard.
- A field's kind comes from its declaration: toggle, number, text, a choice from a list, or a long text. A long text
  takes one row per 60 characters, from 2 to 10, as Holo's content tool sized it.
- A setting marked `secret` in the catalogue is a password field: `Declared()` keeps its value out, a blank field
  keeps it, and a checkbox clears it.

# A save

- A post reads only the fields of its section, so a form reaches no other key.
- It saves all of them or none: `settings.Validate` checks them together, then `setAll` writes each with
  `settings.Set`, so a value back at its default deletes the row.
- `setAll` lets a refused key wait for the others, because a rule across two keys, as the password limits, can refuse
  the first until the second is written. A round that writes nothing is a real failure.
- One staff log row lists the changed keys ([the staff log](/staff-log.md)).
- A save redirects to `?section=…&saved=1`, so a reload shows the message without posting again.
