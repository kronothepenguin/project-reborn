---
type: Spec
title: Groups
description: Habbos buy, join, run and decorate groups, each with a home and a badge drawn by the CMS.
status: done
projects: [packages/cms, packages/store, packages/server]
---

# What

A habbo buys a group with credits from the Me page. Others join it, ask to join, or stay out, by the group's type. The
owner and the admins run the members, the settings, the badge and the group's home. The CMS draws every group badge,
and a habbo shows its favourite group's badge on the site and in rooms.

# Behaviours

## Buying

- A habbo buys a group: it takes `groups.price`, 20 credits by default, with Holo's ledger row in one transaction.
- A habbo with too few credits opens the purchase: the dialog opens on Holo's refusal, with its link to the credits.
- A blank form is refused with Holo's `Please fill in all fields!`.
- A name takes 1 to 25 characters and a description up to 200; a name another group has is refused, ignoring case
  (decision holo-port/0084).
- A user owns at most 3 groups across all their habbos, and each habbo holds at most 10 memberships, requests included
  (decision holo-port/0082).
- `features.groupPurchase` is off: the dialog says so, as Holo's did.
- The purchase succeeds: the dialog congratulates the owner and links to the group's home.

## Joining and leaving

- A group is Regular, Exclusive, Private or Unlimited (decision holo-port/0081).
- A habbo joins a Regular group with fewer than 500 members, or an Unlimited group: it becomes a member.
- A habbo joins an Exclusive group: a request waits for an admin, and the group offers nothing more.
- A habbo opens a Private group: it offers neither Join nor a request.
- A member leaves a group: Holo's dialog asks first, and the membership and the favourite go.
- The owner leaves its own group: it is refused.
- A member makes a group its favourite: Holo's dialog asks first, and the old favourite stops being one.
- Joining, leaving and the favourite act for the active habbo only (decision holo-port/0086).

## Running a group

- The owner opens Settings: the name, the text with a counter from 200, and the four types with Holo's texts show.
- The owner changes the type: Holo's dialog asks first; choosing Unlimited warns that it cannot be undone, and an
  Unlimited group's types stay locked (decision holo-port/0081).
- The owner changes an Exclusive group's type: its waiting requests go at once.
- An admin opens Members: the owner, who cannot be ticked, and the members show, with Holo's counts and pages.
- An admin accepts a request, gives or revokes rights, or removes a member: Holo's dialog asks first.
- An admin demotes or removes the owner: it is refused.
- The owner deletes the group: Holo's warning asks first, the group goes, and every item on its home goes back to the
  user whose habbo placed it (decision holo-port/0083).
- Housekeeping has no page for groups (decision holo-port/0085).

## Group pages

- Anyone opens a group's home: it shows the Group information and Group Members widgets on the 922-pixel playground
  (decision holo-port/0017).
- A missing group answers 404 with Holo's page and its search.
- `GET /groups?name=` opens the group with that name, ignoring case, or says that nothing was found
  (decision holo-port/0095).
- An admin opens Modify page: the home editor opens on the group's home, and the Widgets tab offers Group Members.
- An admin removes an item another user placed: Holo's warning shows, and the item goes back to its placer
  (decision holo-port/0098).
- A user archives a habbo: its stickers and notes on group homes stay (decision holo-port/0096).

## Badges

- An admin opens the badge editor: it shows the CMS's palette, and Save stores the code the editor writes.
- The CMS draws a badge at `/habbo-imaging/badge/{code}` in the Tailwind palette (decision holo-port/0102).
- A badge code the editor would not write answers 404.

## Across the site

- The Me page's Groups box lists the habbo's groups with their badges, and Hot Groups loads groups at random.
- The header's My Groups lists the memberships before the owned groups, with Holo's marks; a guest has no My Groups.
- A habbo's profile and the staff page show its favourite group's badge, linking to the group.
- A click on a group in a MY GROUPS widget opens Holo's info box in its place.
- In a room a habbo shows its favourite group's badge, or none (decision server/0068).
