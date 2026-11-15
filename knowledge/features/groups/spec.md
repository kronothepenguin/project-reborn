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

- A new hotel: a group costs 20 credits, a user owns up to 3 groups, a habbo holds up to 10 memberships, a group
  holds up to 500 members, and a name takes up to 25 characters and a description up to 200.
- A habbo buys a group: it takes `groups.price`, 20 credits by default, with Holo's ledger row in one transaction.
- A habbo opens the group purchase from the page or from the header's My Groups: Holo's form shows the price and the
  badge.
- A habbo with too few credits opens the purchase: the dialog opens on Holo's refusal, with its link to the credits.
- A blank form is refused with Holo's `Please fill in all fields!`.
- A habbo presses Back after a refused purchase: the form comes back empty.
- A name takes 1 to 25 characters and a description up to 200; a name another group has is refused, ignoring case
  (decision holo-port/0084).
- A user owns at most 3 groups across all their habbos, and each habbo holds at most 10 memberships, requests included
  (decision holo-port/0082).
- `features.groupPurchase` is off: the dialog says so, as Holo's did.
- The purchase succeeds: the dialog congratulates the owner and links to the group's home.

## Joining and leaving

- A group is Regular, Exclusive, Private or Unlimited (decision holo-port/0081).
- A habbo joins a Regular group with fewer than 500 members, or an Unlimited group: it becomes a member.
- A habbo joins a full Regular group: "This group is full.", and archived members leave the count.
- A habbo with `groups.maxMemberships` memberships and requests joins any group, one it is in included: Holo's limit
  message shows before any other answer.
- A habbo joins an Exclusive group: a request waits for an admin, and the group offers nothing more.
- A habbo with a waiting request is archived: its request leaves the count and the list of requests.
- A habbo opens a Private group: it offers neither Join nor a request.
- A member leaves a group: Holo's dialog asks first, and the membership and the favourite go.
- The owner leaves its own group: it is refused.
- A member makes a group its favourite: Holo's dialog asks first, and the old favourite stops being one.
- A habbo makes a group its favourite, or leaves a group, while it is not a member: it is refused.
- Joining, leaving and the favourite act for the active habbo only (decision holo-port/0086).
- A habbo cancels one of Holo's group dialogs: nothing changes.

## Running a group

- The owner opens Settings: the name, the text with a counter from 200, and the four types with Holo's texts show.
- The owner changes the type: Holo's dialog asks first; choosing Unlimited warns that it cannot be undone, and an
  Unlimited group's types stay locked (decision holo-port/0081).
- The owner changes an Exclusive group's type: its waiting requests go at once.
- An admin opens Members: the owner, who cannot be ticked, and the members show, with Holo's counts and pages.
- An admin ticks members: Give rights turns on for members, Revoke rights for admins and Remove for anyone; with nobody
  ticked, every action is off.
- An admin accepts a request, gives or revokes rights, or removes a member: Holo's dialog asks first.
- An admin demotes or removes the owner: it is refused.
- The owner deletes the group: Holo's warning asks first, the group goes, and every item on its home goes back to the
  user whose habbo placed it (decision holo-port/0083).
- Housekeeping has no page for groups (decision holo-port/0085).

## Group pages

- Anyone opens a group's home: it shows the Group information and Group Members widgets on the 922-pixel playground
  (decision holo-port/0017).
- Anyone opens a group's home: it writes nothing, and a waiting request stays.
- Anyone opens an Exclusive group's home: it shows Holo's Exclusive icon.
- A missing group answers 404 with Holo's page and its search.
- `GET /groups?name=` opens the group with that name, ignoring case, or says that nothing was found
  (decision holo-port/0095).
- An admin opens Edit on a group's home: Holo's menu offers Settings, Members, Badge and Modify page.
- An admin opens Modify page: the home editor opens on the group's home, and the Widgets tab offers Group Members.
- An admin opens Modify page: the skins come in Holo's order, with the club and staff skins for those who may use them.
- An admin edits a group's home: the Group information widget's menu offers its skins, without Remove.
- A request removes the Group information widget: it stays on the home, back in its corner with the default skin.
- An admin edits a group's home with Group Members placed: it shows greyed out in the inventory.
- An admin removes an item another user placed: Holo's warning shows, and the item goes back to its placer
  (decision holo-port/0098).
- An admin edits a group's home: Holo's warning marks only the items another user placed.
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
- A habbo presses the minus of the info box in a MY GROUPS widget: the list comes back.
- In a room a habbo shows its favourite group's badge, or none (decision server/0068).
