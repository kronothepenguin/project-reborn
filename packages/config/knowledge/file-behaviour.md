---
type: Reference
title: The file's behaviour
description: When config.json is created, read and rewritten, how Differences and Rewrite bring it up to a release's keys, and how SaveReborn writes the reborn section.
---

# The file

- Absent `config.json`: created with the declared defaults (pretty-printed JSON plus a trailing newline, mode `0644`).
- Key missing from an existing file: the declared default is returned; the file is not modified.
- Key present: the file's value wins over the default.
- Existing files are rewritten only by `Rewrite`, when an administrator saves a release's new keys from housekeeping,
  and by `SaveReborn`, when the installer inside reborn saves the hotel's address; both drop the keys nothing reads. Otherwise formatting, ordering, and unrecognized keys stay as written, and
  `Create` writes only when the file is absent.
- Keys are lowerCamelCase.

# Differences and Rewrite

- `Differences() (missing, unused []Key, err error)` compares `config.json` with the declared keys: the keys the file
  lacks, with their defaults, and the keys nothing reads, with the file's values. A `Key` is a dotted key path, such as
  `cms.port`, and its JSON value.
- `Rewrite(values map[string]json.RawMessage) error` writes `config.json` again with its keys as they are, the keys it
  lacks with the values given (their defaults otherwise), and without the keys nothing reads. Only missing keys may be
  given values (`ErrNotNew`), the result must pass `Validate`, and a temporary file is renamed over `config.json`. With
  nothing missing or unused, the file stays as it is.
- Housekeeping's updates page calls both when a release adds keys (`packages/housekeeping/internal/router/updates.go`).

# SaveReborn

- `SaveReborn(r reborn.Reborn) error` writes `r` as the `reborn` section of the existing `config.json`, and writes the
  file again as `Rewrite` does: the other keys with their values, the keys it lacks with their defaults, and none of the
  keys nothing reads. A result that fails `Validate` leaves the file as it was. Without `config.json` it fails with
  `fs.ErrNotExist` and creates nothing.
- A section gets a typed save function of its own when a program saves it; config is static types.
- The installer inside reborn calls it with the hotel's new address (`packages/installer/internal/setup`).
- `Load` keeps what it read: `Get()` still returns the values from before the save.
