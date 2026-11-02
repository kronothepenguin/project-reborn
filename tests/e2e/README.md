# e2e — browser suites

Real Chromium against the production binaries. A run builds the frontends and the
programs, installs a throwaway hotel through the installer, and gives each suite a
fresh copy of it, with a mail stub standing in for the SMTP server.

## Run

```sh
make install                 # once: downloads Chromium
make test                    # every suite, from the repository root: make e2e
pnpm test register me        # only these suites
pnpm test --skip-build me    # reuse the last binaries
```

Exit status 0 means every check passed. Failures print as they happen, and
screenshots and server logs stay in `.run/`, which is git-ignored.

## Rules of a run

- The CMS and housekeeping listen on free ports, so a run does not disturb a
  development server.
- The installer's port, 17306, is baked in its runners. A run refuses to start
  while it is busy, and it never talks to a server it did not start.
- A suite fails if a program logs anything beyond its start-up line.

## Suites

| Suite | Covers |
| --- | --- |
| `signed-out` | Landing, sign-in, forgot and reset, legal pages, ban, throttle |
| `register` | The registration form, with and without JavaScript |
| `me`, `looks`, `details`, `habbos` | The Me page and the account tabs |
| `maintenance` | The site closed, and staff signing in |
| `art` | The home art, served by the binary |
| `housekeeping-access` | Every route as a guest, a player and staff |
| `housekeeping-admin` | Access groups, members, the guard and the log |
| `housekeeping-settings` | The settings forms |
| `housekeeping-maintenance` | Maintenance saved in housekeeping, read by the CMS |
| `together` | The installer's forms, then the CMS and housekeeping side by side |

## Writing a suite

A suite is a module in `suites/`, registered in `run.mjs`. Its default export takes
the run's helpers: `base`, `hk`, `browser`, `check`, `sql`, `mails`, `shot`,
`start`, `stop` and `restart`. It may also export:

- `programs`: what to start, `["cms"]` by default;
- `prepare`: runs on the copy of the hotel before the programs start;
- `emptyFolder`: `true` to start with no hotel at all.
