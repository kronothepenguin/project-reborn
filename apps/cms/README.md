# cms — app runner

The runners of `packages/cms`: `cmd/cms` serves the embedded build, and `cmd/cms-dev` serves the Astro dev server.

`apps/reborn` runs the whole hotel, the CMS included. Run the CMS alone to work on it, or to test how it talks to the
game. Run alone, it tells the game of a change, and opens and closes its doors, through the game's `/api/` on
`server.api`, `localhost:15445` by default.

## Ports

- App (Go HTTP server): `cms.host` and `cms.port` in `config.json`, `localhost` and 17387 by default. A pod sets
  `cms.host` to `0.0.0.0`.
- Astro dev server: 22827, baked in `packages/cms/astro.config.mjs`.

## Run

```sh
make install    # once: this project's folders and dependencies
make dev        # Astro dev server + air hot reload → http://localhost:17387
make check      # checks the formatting, vets and builds the runner
```

## Production

From the repository root:

```sh
pnpm --dir packages/cms build
go build -o ./apps/cms/tmp/cms ./apps/cms/cmd/cms
./apps/cms/tmp/cms   # → http://localhost:17387, reads ./config.json
```

How it works: `packages/cms/knowledge/index.md` and `knowledge/programs.md`.
