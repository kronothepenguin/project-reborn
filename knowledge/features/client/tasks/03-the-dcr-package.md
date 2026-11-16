---
type: Task
title: Keep the client's variables and texts in the database
description: A new module packages/assets with its first part, packages/assets/dcr, which copies external_variables.txt and external_texts.txt into the tables dcr_variables and dcr_texts and writes them out for the client; config.json gains assets.path.
scope: [packages/assets, packages/store, packages/config, go.work]
depends_on: []
skills: [applying-go-patterns, adding-data-persistence, adding-config-sections, testing-behaviours, documenting-with-okf, use-modern-go]
---

# Goal

The contract the client page, housekeeping and the installer build on ([Plan](/features/client/plan.md)). It runs
first. The behaviours of the spec it makes possible:

- The client asks for `/dcr/external_variables.txt`: it gets the stored variables, with the nine addresses pointing at
  this hotel and the client version equal to the game's setting.
- The client asks for `/dcr/external_texts.txt`: it gets the stored texts, with every "Habbo" written as the hotel's
  short name.
- Staff with `housekeeping.dcr` press "Import client files": the database holds exactly the variables and texts of the
  two files in the folder.
- The folder lacks one of the two files: the import is refused, names the missing file, and the database stays as it
  was.

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md): the user's architecture of `packages/assets`, the ten generated lines, and the
  shape of this package.
- `packages/store/knowledge/adding-persisted-data.md` and `tables.md`; `packages/config/knowledge/adding-a-section.md`.
- The main checkout holds the user's client files in `assets/dcr/` (git ignores `assets/`): read
  `assets/dcr/external_variables.txt` (140 lines) and `assets/dcr/external_texts.txt` (5,518 lines) there to learn the
  format, and leave them as they are. Tests use small files of their own.
- The spike found that the client stalls unless the nine addresses point at files that exist; its working copy of the
  variables is in `/tmp/claude-1000/-mnt-media-Projects-habbo/5838a8a3-d542-499e-90bf-949c857d87fb/scratchpad/client-01/` while that folder lasts.
- `go.work`, `packages/store/migrations` and the generated query files are shared files: this task is the one changing
  them now. The next free update number is 0026.

# Steps

- [ ] A new module `packages/assets` (`go work use`), with a short `README.md`, a `Makefile` that includes the shared
  check recipe and a `knowledge/` folder that says what the package is for and what its parts are.
- [ ] `config.json`'s `assets.path`, `assets` by default, through the `adding-config-sections` skill.
- [ ] The tables `dcr_variables` and `dcr_texts` (a key and a value each), an update that creates them, and their
  queries (`adding-data-persistence`).
- [ ] `packages/assets/dcr`, with exactly this exported shape:

  ```go
  // Import copies external_variables.txt and external_texts.txt of files into the database.
  func Import(ctx context.Context, q *store.Queries, files fs.FS) error

  // Hotel is what the written files take from the hotel.
  type Hotel struct {
      URL       string // the site's address
      ShortName string // the site's short name
      Version   int    // game.clientVersion
  }

  // Variables writes external_variables.txt for the client.
  func Variables(ctx context.Context, q *store.Queries, hotel Hotel) ([]byte, error)

  // Texts writes external_texts.txt for the client.
  func Texts(ctx context.Context, q *store.Queries, hotel Hotel) ([]byte, error)
  ```

- [ ] `Import` leaves the database holding exactly the two files' keys and values. A missing file is an error that
  names it, and the caller's transaction keeps the database as it was.
- [ ] `Variables` writes the stored rows, with the ten generated lines of the plan in place of whatever the rows hold
  for those keys: the addresses under `hotel.URL` (`/dcr/` for the figure data, the three XMLs and the furni, and
  `/c_images/` for the two image libraries), and `client.version.id` from `hotel.Version`.
- [ ] `Texts` writes the stored rows with every "Habbo" written as `hotel.ShortName`.
- [ ] Find which encoding and line ends the client reads (the spike saw it decode the texts as UTF-8), and keep them:
  a file imported and written out with nothing to replace gives the client the same bytes. Say in the report what you
  found.
- [ ] One test per behaviour of the goal, on the package: an import followed by `Variables` and by `Texts`; an import
  that replaces older rows; a missing file.

# Checks

```sh
make -C packages/assets check
make -C packages/store check
make -C packages/config check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/assets`,
`packages/store`, `packages/config`.
