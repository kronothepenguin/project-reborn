# TICKET-022: Poll System

**Priority:** POST-MVP
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** TICKET-002

## Summary
Implement in-room polls (`hh_poll` cast). The server can start a poll (POLL_START, 234) in a room, players answer questions (POLL_ANSWER, 236), and the server collects results. Polls are used for community surveys and some game events. This is a simple request-response flow with no complex state machine.

## Server (Go)
- Package: `internal/app/game/protocol/hh_poll/`
- Inbound commands:
  - 233 `POLL_OPEN` — client acknowledges receiving a poll; server records that this user has the poll open
  - 236 `POLL_ANSWER` — read `poll_id int`, `question_id int`, `answer_id int`; store answer in DB; if all questions answered, send POLL_COMPLETE (238) to the client
  - 237 `POLL_REJECT` — client declined the poll; record rejection; server may not send this poll again
- Outbound commands to register:
  - 234 `POLL_START` — sent by server to start a poll: `poll_id int`, `title string`, `num_questions int`, then per question: `question_id int`, `type int`, `text string`, `num_answers int`, then per answer: `answer_id int`, `answer_text string`
  - 235 `POLL_QUESTION` — follow-up single question packet (used when sending questions one at a time)
  - 238 `POLL_COMPLETE` — sent after all answers received; may include a thank-you message
- DB changes needed: yes
  - New table `polls`: `id INT PK AUTOINCREMENT`, `title TEXT`, `is_active BOOL DEFAULT TRUE`
  - New table `poll_questions`: `id INT PK`, `poll_id INT FK polls`, `type INT`, `text TEXT`, `order INT`
  - New table `poll_answers`: `id INT PK`, `question_id INT FK poll_questions`, `text TEXT`
  - New table `poll_responses`: `user_id INT FK users_avatar`, `question_id INT FK poll_questions`, `answer_id INT`, `answered_at DATETIME`
  - Add sqlc queries: `GetActivePoll`, `GetPollQuestions`, `RecordResponse`

## Client (Godot)
- Scene/script: `client/hh_poll/`
- Reference: `casts/hh_poll/` — Interface/Component/Handler .ls files
- What to implement:
  - `hh_poll.gd` — registers for POLL_START (234); on receipt, opens the poll dialog
  - `poll_window.tscn` — displays poll title and questions sequentially; radio/checkbox answers; "Submit" and "Skip" buttons
  - On submit: send POLL_ANSWER for each answered question; on POLL_COMPLETE, close dialog
  - On skip/close: send POLL_REJECT (237)

## Acceptance criteria
- [ ] POLL_START sent to a room triggers the poll dialog on all connected clients
- [ ] Player answering all questions sends POLL_ANSWER for each; server stores responses in DB
- [ ] Player declining sends POLL_REJECT; server records rejection
- [ ] POLL_COMPLETE is sent after all questions are answered
- [ ] Poll data (questions, answers) is seeded from DB, not hardcoded
- [ ] A user cannot answer the same poll twice (server checks poll_responses)

## Notes
- Command IDs 233–238 need verification from `casts/hh_poll/` Handler regMsgList.
- For MVP, polls are manually triggered from DB (no in-game poll creation UI). Post-MVP: admin panel to create and send polls.
- Poll type `int` in questions: 1 = single-choice (radio), 2 = multi-choice (checkbox). Implement single-choice first.
