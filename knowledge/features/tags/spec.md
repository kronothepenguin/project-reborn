---
type: Spec
title: Tags
description: Habbos tag themselves, and anyone browses the tag cloud, finds habbos by tag and fights two tags.
status: done
projects: [packages/cms, packages/store]
---

# What

A habbo carries up to `homes.maxTags` tags on its profile. The tag cloud shows the tags in use, sized by how many
habbos carry them. The tags page finds the habbos of a tag, lets a habbo tag itself, and runs the tag fight.

# Behaviours

## Tagging yourself

- A habbo adds a tag on its home's profile widget: the tag is saved in lower case.
- A habbo adds a tag outside 2 to 20 letters and digits: it is refused with Holo's `Invalid tag`.
- A habbo adds a tag it already has, or one past `homes.maxTags`, 20 by default: the tag is refused.
- A habbo removes a tag: the tag leaves its profile.
- A habbo borrows another habbo's tag: the tag becomes its own.
- A user tags themselves: the tag goes to the active habbo.
- A habbo opens the Me page's Tags box: it lists its tags and the cloud of `Others Like...`, and adds and removes tags.

## The cloud and the search

- Anyone opens `/tags`: Holo's title, the Tags sub-tab and the cloud show (decision holo-port/0017).
- The cloud shows 20 random tags in use, sized 100% to 200% by how many habbos carry them.
- Anyone opens `/tags` without a search: Holo's `No results` shows.
- Anyone searches a tag: the tag is lowered and matched exactly, and up to 20 habbos show, in the order they took it.
- Each habbo found shows its avatar, its motto and its tags, and links to its home.
- The search counts its habbos in the title, and as Holo did, such as `1 - 2 / 2`.
- An archived habbo's tags leave the cloud, the search and the fight.
- A guest opens a search: the offer to take the tag stays hidden.
- A habbo searches a valid tag it lacks and has room for: it is offered the tag, and taking it lists the habbo.

## The tag fight

- Anyone fights two tags: the fight runs, then names the winner with its hits.
- Two tags with equal hits: the fight is a tie.
- Anyone presses `Again?`: an empty form and Holo's `Start` come back.
- `features.tagFight` is off: the tag fight is hidden.
