---
type: Task
title: Serve the client's folder from the CMS
description: The CMS serves assets/dcr/ of the folder config.json names at /dcr/, and writes external_variables.txt and external_texts.txt there from the database.
scope: [packages/cms]
depends_on: [03-the-dcr-package]
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

The client loads everything it needs from the hotel ([Plan](/features/client/plan.md)). The behaviours of the spec:

- The client asks for a file of its folder (the `.dcr`, a cast, a furni, an XML): the CMS serves it from `assets/dcr/`
  of the folder `config.json` names, at `/dcr/`.
- The client asks for `/dcr/external_variables.txt`: it gets the stored variables, with the nine addresses pointing at
  this hotel and the client version equal to the game's setting.
- The client asks for `/dcr/external_texts.txt`: it gets the stored texts, with every "Habbo" written as the hotel's
  short name.

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `packages/assets/knowledge/index.md`: `dcr.Variables`, `dcr.Texts` and `dcr.Hotel`.
- `packages/settings/knowledge/settings.md`: `site.url`, `site.shortName` and `game.clientVersion`, read on use.
- The user: "what i want is to serve the asset files, as we are downloading them and won't include them in the repo,
  it is valid to create a folder and use http.FileServe to seve that folder."
- The CMS reads the assets folder from the config itself; it is the same for every runner, so it is no option.

# Steps

- [ ] `GET /dcr/external_variables.txt` and `GET /dcr/external_texts.txt`: handlers that write `dcr.Variables` and
  `dcr.Texts` with the hotel's address, short name and client version, in the content type and encoding the client
  reads.
- [ ] Every other path under `/dcr/` is served from `<assets.path>/dcr/` with `http.FileServer`. A file that is
  missing answers 404.
- [ ] One test per behaviour of the goal, through the router, with a temporary assets folder.
- [ ] Update `packages/cms/knowledge`.

# Checks

```sh
make -C packages/cms check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`.
