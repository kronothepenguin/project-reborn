# TICKET-024: Tutorial System

**Priority:** POST-MVP
**Size:** M
**Affects:** Server / Client / DB
**Depends on:** TICKET-002

## Summary
Implement the new-player tutorial (`hh_tutorial` cast). After first login, the server sends tutorial configuration to the client; the client walks the player through guided steps (moving, chatting, entering rooms) and reports completion of each step. Tutorial data is DB-backed and can be disabled per-user once completed.

## Server (Go)
- Package: `internal/app/game/protocol/hh_tutorial/`
- Inbound commands:
  - 250 `GET_TUTORIAL_CONFIGURATION` — client requests tutorial config on first login; check if user has `tutorial_completed = FALSE`; if so, send TUTORIAL_CONFIGURATION (251); if completed, send nothing or TUTORIAL_COMPLETE
  - 252 `TUTORIAL_ACKNOWLEDGE` — client acknowledges a tutorial step; advance step in DB; if final step, mark tutorial complete
- Outbound commands to register:
  - 251 `TUTORIAL_CONFIGURATION` — tutorial config: `num_steps int`, per step: `step_id int`, `type string`, `title string`, `body string`, `target_element string`
  - 253 `TUTORIAL_COMPLETE` — tutorial finished; may grant a reward (starter furniture or credits)
- DB changes needed: yes
  - Add column to `users_avatar`: `tutorial_step INT DEFAULT 0` (0 = not started, -1 = completed)
  - New table `tutorial_steps`: `id INT PK`, `order INT`, `type TEXT`, `title TEXT`, `body TEXT`, `target_element TEXT`
  - Add sqlc queries: `GetTutorialStep`, `UpdateTutorialStep`, `CompleteTutorial`

## Client (Godot)
- Scene/script: `client/hh_tutorial/`
- Reference: `casts/hh_tutorial/` — Interface/Component/Handler .ls files
- What to implement:
  - `hh_tutorial.gd` — sends GET_TUTORIAL_CONFIGURATION (250) after login if the player is new; registers for TUTORIAL_CONFIGURATION (251)
  - `tutorial_overlay.tscn` — fullscreen semi-transparent overlay with step cards; arrows pointing to UI elements; "Next" and "Skip" buttons
  - Step card: shows title, body text, and highlights the `target_element` in the UI using a cutout/highlight
  - On "Next": send TUTORIAL_ACKNOWLEDGE (252); advance to next step
  - On "Skip": send all remaining TUTORIAL_ACKNOWLEDGEs at once to mark tutorial done
  - On TUTORIAL_COMPLETE: dismiss overlay; show "Tutorial complete!" toast with any reward

## Acceptance criteria
- [ ] First-time players receive TUTORIAL_CONFIGURATION after login
- [ ] Tutorial overlay is shown step-by-step, highlighting the correct UI element each time
- [ ] TUTORIAL_ACKNOWLEDGE advances the step in DB
- [ ] Completing all steps marks `tutorial_step = -1` in DB; tutorial is not shown again
- [ ] Players who skip the tutorial also have it marked complete in DB
- [ ] Returning players do not receive tutorial again
- [ ] Tutorial completion may grant a starter reward (configurable in DB)

## Notes
- Command IDs 250–253 need verification from `casts/hh_tutorial/` Handler regMsgList.
- Tutorial `target_element` strings map to Godot node names or autoload properties. Define a mapping in `hh_tutorial.gd`.
- For MVP, tutorial steps are seeded via DB migration. In-game tutorial editor is out of scope.
