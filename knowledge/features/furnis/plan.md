---
type: Plan
title: "Furnis, with the catalogue: how"
description: The store, virtual and the game server hold the catalogue and furni over the R26 protocol; housekeeping edits the catalogue and furni, and the game brings the furni S5 left out.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/store` | Holo's catalogue seeded by an update; furni definitions apart from catalogue items; each furni, its post-it note, the recycler's rewards and recyclings |
| `packages/virtual` | `furni` and `catalogue`, loaded at start; `furni.Create`, the pieces one furni gives; `room`, a loaded room's furni, floor, trades and teleport passages (`packages/virtual/knowledge/index.md`) |
| `packages/server` | The catalogue, the hand, furni in rooms, presents, rollers, teleports, post-its, trading, credit furni and the recycler, over the R26 protocol (`packages/server/knowledge/r26/`) |
| `packages/cms` | The shared inventory, `/account/furni`, with Take |
| `packages/housekeeping` | The settings that set the furni limits and the recycler |

Planned:

| Project | Part |
| --- | --- |
| `packages/housekeeping` | A catalogue editor ([later](/features/furnis/later.md), "A catalogue editor in housekeeping"); a habbo's furni seen and changed by staff |
| `packages/server` | Reloads the catalogue when it changes; one-way doors and the fortune teller; limits for post-its and rollers, with the client's alerts 403 and 404 ([later](/features/furnis/later.md)) |
| `packages/store`, `packages/virtual` | What those need |
| `packages/installer` | Shares the catalogue's lists and edits with the editor, if [the installer](/features/installer/spec.md) gets its review step |
| `packages/cms` | Already holds the shared inventory, `/account/furni` |

The catalogue's pages that S5 left out, Pets, Camera, the Trax pages and the Club Shop, come back with the features that
sell them, in [extras](/features/extras/spec.md)
([server 0101](/decisions/server/0101-the-pages-of-s7s-furni-wait-for-s7.md)).

# Decisions

- [Furni and rooms](/decisions/holo-port/0057-furni-and-rooms.md) — Every furni belongs to a user: in a habbo's hand,
  shared when no habbo holds it, or placed in a room; shared furni moves one way, to a habbo.
- [A hotel starts with Holo's catalogue, changed by database
  updates](/decisions/server/0091-holos-catalogue-changed-by-updates.md) — An update seeds Holo's English catalogue; a
  change is another update.
- [A trade lives only in memory](/decisions/server/0092-a-trade-lives-only-in-memory.md) — Furni stays in its hand
  until both accept, then changes hands in one transaction; a restart or leaving closes the trade.
- [A recycling is saved](/decisions/server/0093-a-recycling-is-saved.md) — The furni given wait in the database with
  the start time, so a restart changes nothing.
- [Any habbo sends a present to any habbo](/decisions/server/0094-any-habbo-sends-a-present-to-any-habbo.md) — Any
  catalogue furni goes by name to any habbo in a box with a note; an unknown name charges nothing.
- [S5 builds item vouchers, the shared inventory page, Recycler Options and the dashboard
  counts](/decisions/server/0095-s5-builds-four-site-pieces.md) — The four site pieces that wait for furni in the
  store.
- [The hand is read from the database each time](/decisions/server/0096-the-hand-is-read-from-the-database.md) — The
  server keeps no copy of a hand; what the site gives shows when the hand opens.
- [Furni definitions and catalogue items have tables of their
  own](/decisions/server/0097-furni-definitions-and-catalogue-items-apart.md) — A furni is sold on several pages or on
  none, and a deal is one item that gives several furni.
- [S5's shared data lives in virtual/furni and virtual/catalogue](/decisions/server/0098-virtual-furni-and-catalogue.md)
  — Both load at start; a room's placed furni and an open trade live in the loaded room.
- [The catalogue's page names are English](/decisions/server/0099-the-catalogues-page-names-are-english.md) — Six
  Dutch or misspelt page names are seeded in English; everything else stays Holo's.
- [Sixteen catalogue pages need level 7, and two the
  club](/decisions/server/0100-sixteen-pages-need-level-7-and-two-the-club.md) — The rare pages need level 7; Greek and
  Advertisement need the club or level 2.
- [The pages of S7's furni wait for S7](/decisions/server/0101-the-pages-of-s7s-furni-wait-for-s7.md) — Pets, Camera
  and the five Trax pages come with what makes their furni work.
- [Club Furni and Club Shop sell only to club
  members](/decisions/server/0102-club-furni-and-club-shop-sell-to-club-members.md) — Everyone sees them; anyone else
  gets the client's club message and pays nothing.
- [Whoever picks a furni up keeps it](/decisions/server/0103-whoever-picks-a-furni-up-keeps-it.md) — Rights place and
  move; the owner picks up and keeps what it picks up.
- [A room holds up to 500 furni](/decisions/server/0104-a-room-holds-up-to-500-furni.md) — `game.maxRoomFurni`, 500;
  one more stays in the hand.
- [Only a room's owner opens a present](/decisions/server/0105-only-a-rooms-owner-opens-a-present.md) — The furni goes
  to the owner's hand; `fuse_pick_up_any_furni` opens nothing.
- [A present's note is cut at 200 characters](/decisions/server/0106-a-presents-note-is-cut-at-200-characters.md) —
  `game.presentNoteMaxLength`, 200.
- [Rollers roll, every 2 seconds](/decisions/server/0107-rollers-roll-every-two-seconds.md) — A roller carries the furni
  and the habbo on it one tile when the next is free.
- [Habbos with rights write post-its; the owner and staff with the fuse delete
  them](/decisions/server/0108-rights-write-notes-owner-and-staff-delete.md) — Rights write and colour a note; the owner
  or `fuse_remove_stickies` deletes it.
- [A post-it's longest text is a setting, 684 by default](/decisions/server/0109-post-it-length-is-a-setting.md) —
  `game.postItMaxLength`; a longer note is refused.
- [A teleport takes a habbo past every check of the room's
  door](/decisions/server/0110-a-teleport-skips-every-check-of-the-door.md) — The doorbell, the password, a ban and a
  full room let it through.
- [A teleport keeps its partner, whoever holds either](/decisions/server/0111-a-teleport-keeps-its-partner.md) — It
  works while both stand in rooms.
- [Habbos trade in any room](/decisions/server/0112-habbos-trade-in-any-room.md) — The client's category switch only
  shows or hides the Trade button.
- [A side of a trade offers up to a setting, 65 by
  default](/decisions/server/0113-a-trade-side-offers-up-to-a-setting.md) — `game.maxTradeFurni`.
- [A furni on offer in a trade is locked](/decisions/server/0114-a-furni-on-offer-is-locked.md) — The other side gets
  exactly what the window showed.
- [The room's owner redeems a credit furni, worth what its name
  says](/decisions/server/0115-the-rooms-owner-redeems-credit-furni.md) — `CF_50_goldbar` gives 50.
- [A recycling that waits too long loses its reward and gives the furni
  back](/decisions/server/0116-a-recycling-that-waits-too-long-gives-the-furni-back.md) — After the time-out, 7 days,
  only cancelling works.
- [The recycler checks a furni's age, from when it was made](/decisions/server/0117-the-recycler-checks-a-furnis-age.md)
  — 30 days by default, 0 for no rule; trading keeps the age.
- [A recycling starts only in a room](/decisions/server/0118-a-recycling-starts-in-a-room.md) — Taking the reward and
  cancelling work anywhere.
- [The shared inventory is the account page Furni](/decisions/server/0122-the-shared-inventory-is-an-account-page.md) —
  `/account/furni`, after Habbos in the account's menu.
- [Take moves one kind of shared furni, or all of it](/decisions/server/0123-take-moves-a-kind-of-furni-or-all.md) —
  Identical furni share a row with a count.
- [An item voucher gives what buying the furni gives](/decisions/server/0125-an-item-voucher-gives-what-buying-gives.md)
  — One piece of code in `packages/virtual/furni` makes a teleport's pair and a pad's 20 notes for both.

# Notes

Chosen without asking the user, each as Holo had it unless noted:

- A catalogue page the habbo does not see gets no answer, where Holo sent a page of its own.
- The hand holds any number of furni.
- The credit history's lines read `Catalogue purchase (<item>)` and `Furni exchanged (<item>)`, in HoloCMS's style.
- A pad of post-its holds 20 notes.
- A deal can be a present, all its furni in one box, and a habbo may send itself a present.
- Anyone in a room changes a furni's state; only a habbo that controls the room opens a gate, spins the wheel or
  decorates the room.
- Furni stacks no higher than Holo's 20, the setting `game.maxStackHeight`.
- A `post.it.vd` takes any six hexadecimal digits as its colour, and post-its have no word filter, as chat has none.
- The placer of a post-it gets its hand again after each note, which Holo never sent, so the pad shows its count.
- The five sprites Holo sold as pairs are the teleports. A habbo comes out of a teleport even while another stands in
  it.
- Taking one accept away takes both. Beyond Holo, only a furni marked tradeable is offered, once, and both sides need
  `fuse_trade`.
- The recycler's times are Holo's minutes: 43200 old, 60 a recycling, 10080 to the time-out, counted from the start.
- Beyond Holo, the recycler takes only a recyclable furni, and a reward is taken or refused while the recycler is off,
  so turning it off strands nothing.
- On the Furni page, a kind is a furni definition, whatever each piece's state, named as the catalogue sells it or by
  its sprite. A furni that waits in a present stays in its box.
