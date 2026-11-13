---
type: Reference
title: The file's behaviour
description: When config.json is created, read and rewritten, and how Differences and Rewrite bring it up to a release's keys.
---

# The file

- Absent `config.json`: created with the declared defaults (pretty-printed JSON plus a trailing newline, mode `0644`).
- Key missing from an existing file: the declared default is returned; the file is not modified.
- Key present: the file's value wins over the default.
- Existing files are rewritten only by `Rewrite`, when an administrator saves a release's new keys from housekeeping;
  that rewrite drops the keys nothing reads. Otherwise formatting, ordering, and unrecognized keys stay as written, and
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
