# Decisions

Design decisions confirmed by the user, numbered in the order they were taken. Accepted text is never rewritten; a
change supersedes a decision with a new one. The branch rule every plan follows is
`plans/holo-port/decisions/0097-no-agent-works-on-main.md`.

## Process

- [0001 The client's plan lives in plans/client](/decisions/0001-plan-in-plans-client.md) — plans/client plans how the R26 client reaches the player's browser, as a bundle of its own beside holo-port and server, because only its client page comes from HoloCMS.

## The client

- [0002 LibreShockwave and the .dcr first, a vanilla JavaScript client later](/decisions/0002-libreshockwave-first-then-javascript.md) — The CMS's client page first runs the R26 .dcr in the browser on LibreShockwave, and later a vanilla JavaScript client takes the place of LibreShockwave and the .dcr.
- [0003 LibreShockwave is a submodule at vendor/LibreShockwave](/decisions/0003-libreshockwave-submodule.md) — LibreShockwave is a git submodule at vendor/LibreShockwave, pinned at commit 3f90480, the one the game server's plan read, and the plans read it there instead of a clone of their own.
- [0004 The client's links come from site.url](/decisions/0004-client-links-from-site-url.md) — The links the client opens, such as a habbo's home page, mail and the logout pages, are built from the CMS setting site.url in the external variables the site serves, as the game server checks VERSIONCHECK's URLs against it.
