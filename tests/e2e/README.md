# e2e — browser suites

Real Chromium against the production binaries. A run builds the frontends and the
programs, the game server among them, installs a throwaway hotel through the
installer, and gives each suite a fresh copy of it, with a mail stub standing in
for the SMTP server.

## Run

```sh
make install                 # once: downloads Chromium
make test                    # every suite, from the repository root: make e2e
pnpm test register me        # only these suites
pnpm test --skip-build me    # reuse the last binaries
```

Exit status 0 means every check passed. Failures print as they happen.

How it works: `knowledge/index.md`.
