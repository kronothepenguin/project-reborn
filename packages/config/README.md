# config

Shared configuration layer for Project Reborn. `config.json` in the process working directory holds only the values a
program needs before the database opens, such as the database path and the ports.

How it works: `knowledge/index.md`.

Check, from `packages/config`:

```sh
make check
```
