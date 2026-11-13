# Project Reborn

Project Reborn is a remake of Habbo Hotel as it was around 2008 — the classic Shockwave (Macromedia Director) era (R26): rooms, navigator, friends, catalogue, clubs, and the rest.

The client is a JavaScript reimplementation of the Shockwave client: a director runtime (shockwave player) that runs the translated Lingo movies. The server, CMS, housekeeping and installer are Go. An orchestrator, `apps/reborn`, which runs them all from one binary, is planned.

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
make install        # every project's folders and dependencies, and the tools
```

Each project also has its own `make install`, the minimum needed to develop and run it.

### 2. Run an app's dev server

Each app owns its own `Makefile` with app-specific targets.

```bash
cd apps/cms && make dev
```

The dev and build modes of the web apps are in `knowledge/programs.md`.

---

## Building

Each app builds on its own; its `README.md` has the steps.

```bash
pnpm --filter @project-reborn/cms build
go build -o ./apps/cms/tmp/cms ./apps/cms/cmd/cms
```

`make frontends` builds the three frontends at once.

---

## Releases

Pushing a tag like `v0.1.0` publishes a GitHub release, once every gate has passed:

- `reborn-<tag>-linux-amd64.tar.gz` and `reborn-<tag>-linux-aarch64.tar.gz`, each with
  `cms`, `housekeeping` and `installer`;
- `SHA256SUMS`.

To try one, unpack it in an empty folder, run `./installer` and follow it at
`http://localhost:17306`. Then stop it and run `./cms` and `./housekeeping` from the
same folder, which now holds `config.json` and the database.

`make release VERSION=v0.1.0` builds the same archives into `release/`.

---

## Testing

```sh
make gates          # formatting, vet and tests of every module, frontends, generated code and docs
make e2e            # real Chromium against the production binaries, see tests/e2e
```

GitHub Actions runs both on every push to `main` and on pull requests.

---

## License

Not yet decided.
