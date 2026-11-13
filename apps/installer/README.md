# installer — app runner

Thin runner for `packages/installer`: `./cmd/installer` for production, `./cmd/installer-dev` for development.

## Ports

- App (Go HTTP server): **17306**, in both runners
- Astro dev server: **25050**, in `packages/installer/astro.config.mjs`

## Run

```sh
make install    # once: this project's folders and dependencies
make dev        # astro (background) + air hot reload → http://localhost:17306
make web        # astro dev server only → http://localhost:25050
make stop       # stop the background astro server
```

## Production

```sh
cd ../../packages/installer
pnpm build
cd ../..
go build -o ./apps/installer/tmp/installer ./apps/installer/cmd/installer
./apps/installer/tmp/installer   # → http://localhost:17306, reads ./config.json
```

How it works: `packages/installer/knowledge/index.md` and `knowledge/programs.md`.
