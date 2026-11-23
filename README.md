# Project Reborn

Project Reborn is a remake of Habbo Hotel as it was around 2008 — the classic Shockwave (Macromedia Director) era (R26): rooms, navigator, friends, catalogue, clubs, and the rest.

The client is a JavaScript reimplementation of the Shockwave client: a director runtime (shockwave player) that runs the translated Lingo movies. The server, CMS, housekeeping and installer are Go. `reborn` runs them all from one binary.

> Early development. Most systems are incomplete or not yet started.

---

## Stack

- [Go 1.27+](https://go.dev/dl/) — Go workspace, no root module
- [SQLite](https://www.sqlite.org/) + [sqlc](https://sqlc.dev/) — type-safe generated queries
- [pnpm](https://pnpm.io/) — all JavaScript, including the Vite client
- [Astro](https://astro.build/) + [Tailwind](https://tailwindcss.com/) — static HTML for CMS/housekeeping, embedded into the Go binaries
- [Director runtime](packages/director/) — Shockwave player reimplementation (`@project-reborn/director`)

`air` and `sqlc` are declared as `tool` directives in the relevant `go.mod` files, and Astro is a pnpm dependency, so no global installs are needed.

---

## Documentation

- `AGENTS.md` holds the hard rules of working in this repository.
- `knowledge/index.md` is the start of the knowledge: the workflow, the architecture, the features and how the programs work together.

---

## Getting Started

### 1. Fetch dependencies

```bash
git submodule update --init    # vendor/LibreShockwave and vendor/HabboWidgets
make install        # every project's folders and dependencies, and the tools
```

Each project also has its own `make install`, the minimum needed to develop and run it.

The client page runs the game on LibreShockwave's player, which `make player` builds from `vendor/LibreShockwave` into
`packages/cms/public/libreshockwave/`. It needs [Emscripten](https://emscripten.org/) and two of its libraries, built
once:

```bash
embuilder build zlib libjpeg
make player         # about three minutes; EMSCRIPTEN=<folder of emcc> when emcc is not on the PATH
```

### 2. Build the frontends

```bash
make frontends      # once: the Go programs embed their builds, reborn's dist among them
```

### 3. Run the hotel

```bash
make dev            # reborn with live reload → http://localhost:16416
```

From an empty folder, reborn serves the installer at `/installer/`, then the site at `/` and housekeeping at
`/housekeeping/`. `apps/reborn/README.md` has the details.

Run a program alone to work on that program, or to test how the programs talk. Each app owns its own `Makefile`:

```bash
cd apps/cms && make dev
```

The dev and build modes of the web apps are in `knowledge/programs.md`.

---

## Building

```bash
make frontends      # every frontend the Go programs embed
make build          # → ./bin/reborn
```

Each app also builds on its own; its `README.md` has the steps.

---

## Releases

Pushing a tag like `v0.1.0` publishes a GitHub release, once `make check` and the browser suites have passed:

- `reborn-<tag>-linux-amd64.tar.gz` and `reborn-<tag>-linux-aarch64.tar.gz`, each with
  `reborn`, `cms`, `housekeeping`, `installer` and `server`;
- `SHA256SUMS`.

To try one, unpack it in an empty folder, run `./reborn` and follow the installer at
`http://localhost:16416/installer/`. Once the administrator exists, the hotel runs there.

To run the programs apart instead, run `./installer` and follow it at `http://localhost:17306/installer/`. Then stop it
and run `./cms`, `./housekeeping` and `./server` from the same folder, which now holds `config.json` and the database.

`make release VERSION=v0.1.0` builds the same archives into `release/`.

---

## Testing

```sh
make check          # make check in every project of apps/, packages/ and tools/, then the knowledge check
make e2e            # real Chromium against the production binaries, see tests/e2e
```

GitHub Actions runs both on every push to `main` and on pull requests.

---

## License

Not yet decided.
