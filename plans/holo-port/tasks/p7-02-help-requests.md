---
type: Task
title: Send help requests from the Help Tool window
description: GET /help shows go.php's Ask your question form in the Help Tool window to a signed-in habbo, and POST /help writes the active habbo's help request with Holo's answers, one waiting request per habbo with the post reports, within 50 characters of subject and help.messageMaxLength of question.
status: todo
phase: p7
depends_on: [p7-01]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/iot/go.php, source/holocms/iot/index.php, source/holocms/iot/header.php, source/holocms/iot/footer.php, source/holocms/templates/community/header.php, source/holocms/web-gallery/static/js/common.js]
timestamp: 2026-11-09T18:04:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:04:21+00:00"}
---

# Goal

A habbo asks staff for help from the site, as with Holo's help tool ([0034](/decisions/0034-behaviour-matches-holo.md),
[0090](/decisions/0090-post-reports.md), [0108](/decisions/0108-help-asks-visitors-to-sign-in.md),
[0109](/decisions/0109-help-request-lengths.md)).

# Steps

- [ ] `GET /help` shows go.php's form in the Help Tool window of `layouts/help-tool.astro`, as the post reports
  do: the `Ask your question` heading with its picture, `You can contact Player Support through this form. They
  will get back to you as soon as possible. If it's urgent, you may also use the Call For Help system ingame.`,
  `Subject:` of 50 characters, `Your question/problem:` and `Proceed`. A visitor who is not signed in goes to
  sign in, as for the post reports ([0108](/decisions/0108-help-asks-visitors-to-sign-in.md)).
- [ ] `POST /help` answers as go.php, in one transaction with the ticket
  ([0090](/decisions/0090-post-reports.md)):
  - a blank subject or question: `Please do not leave any fields blank`, and the form again, empty, as Holo's;
  - a subject over 50 characters: `Your subject may not be longer than 50 characters.`, and a question over
    `help.messageMaxLength`: `Your question may not be longer than <n> characters.`, each with the form again
    ([0109](/decisions/0109-help-request-lengths.md));
  - a request or post report of the active habbo that staff have not picked up yet: `Unable to submit support
    request: you still have a pending support request. Please try again later.`;
  - otherwise the active habbo's ticket, with the subject, the question and the address, and `Ticket submitted. We
    will get back to you shortly, please be patient as this might take a while. Note that you cannot send any more
    support requests until this support ticket is picked up.`, Holo's `untill` spelled correctly.
  After the last two, the form is gone, and `Close` closes the window.
- [ ] The header's `Help` opens the Help Tool's own window, `habbohelp`, as Holo's `openOrFocusHelp` did, the
  window the post reports open in.
- [ ] Housekeeping's Help Queries shows the request as it shows the reports ([hk-b-07](/tasks/hk-b-07-help.md)).
- [ ] Unit tests of the page and of every answer, the transaction and the rule shared with the reports, and a `help`
  browser suite.
- [ ] [Holo's differences](/reference/holo-differences.md): `/help` in place of `iot/go.php?lang=en&country=uk`,
  signing in first, the two lengths, and the text kept as typed and escaped where it is shown, where Holo escaped it
  into the database; and `The page behind Help` leaves the list of what waits for a later phase.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs help forum housekeeping-users
```

# Notes

- Runs on the branch `p7`.
- The store already writes and counts the tickets: `CreateHelpTicket` with no post, and `CountWaitingHelpTickets`,
  which counts help requests and post reports alike.
- go.php checks for a waiting request only when the form is sent, so the form shows while one waits, as Holo's did.
