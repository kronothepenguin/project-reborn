---
type: Task
title: Port Holo's client page onto LibreShockwave
description: The CMS serves Holo's client.php, clientutils.php and unloadclient.php ported exactly, with LibreShockwave's player built from the submodule running the R26 .dcr and an SSO ticket, the game's addresses from config.json and Holo's other client settings as settings.
scope: [packages/cms, packages/settings, packages/virtual, Makefile, .gitignore]
depends_on: [01-spike-the-client-logs-in]
skills: []
---

# Goal

A signed-in habbo opens the site's client page and the R26 client logs in there
([0012](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md)).

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `source/holocms/client.php`
- `source/holocms/clientutils.php`
- `source/holocms/unloadclient.php`
- `source/holocms/templates/client`
- [The client page ports Holo's, with LibreShockwave in place of Adobe's
  plugin](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md)
- The settings' list lives in `packages/virtual/settings` until
  [platform 06](/features/platform/tasks/06-settings-package.md) moves it to `packages/settings`; this task declares the
  new settings wherever the list is when it runs, and never runs at the same time as a task that changes it.
- Offering LibreShockwave's source to players waits for [the assets feature](/features/assets/spec.md).

# Steps

- [ ] A make target builds LibreShockwave's player from `vendor/LibreShockwave` into a folder of the CMS's `public/`
  that git ignores, as [client 01](/features/client/tasks/01-spike-the-client-logs-in.md) found; `make install` runs it
  when Emscripten is there and says how to get it otherwise.
- [ ] The CMS's client page, utility page and unload page are Holo's, ported exactly
  ([holo-port 0034](/decisions/holo-port/0034-behaviour-matches-holo.md)), with the player in place of Adobe's plugin:
  signed-in only, an SSO ticket from `packages/auth`, and Holo's parameters.
- [ ] The game's info and mus hosts and ports come from `config.json`'s `server.info` and `server.mus`; the `.dcr`, the
  external texts and the variables are served from `/r26/` (the files the user copied,
  [0011](/decisions/reborn/0011-no-habbo-files-in-the-repository.md)). Holo's other settings of the page (the reload
  address, the loader, the wide screen) become declared settings.
- [ ] Handler tests: a signed-out visit is sent to sign in; a signed-in one gets a page with a fresh ticket and the
  parameters; the utility page answers Holo's keys.
- [ ] Checked by hand in a browser with the files of the main checkout, as the client files are never in the
  repository: the client logs in; the result written in the report.

# Checks

```sh
cd packages/cms && go vet ./... && go test ./... -race
make gates
```
