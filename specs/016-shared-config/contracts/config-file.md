# Contract: `config.json`

**Feature**: `016-shared-config` | **Consumers**: every Go application and library in the workspace

`config.json` in the process working directory is the project's only configuration source. No environment variable and no other file or location is ever consulted (FR-001, FR-002, FR-014).

## Location and resolution

- Filename: exactly `config.json`, resolved relative to the process working directory at load time (C5).
- No search across parent directories, no path configuration, no override.

## Reading

| Input state | Contract |
|-------------|----------|
| File absent | The layer creates it populated with the declared defaults; consumers receive those defaults (FR-005). |
| File present, key missing | The declared default is returned; the file is not modified (FR-006, FR-011). |
| File present, key with explicit value | The file's value is returned; the default is not substituted (FR-007). |
| File present, value wrong for its setting (wrong type/form/range) | Loading fails before the program runs; the error names `config.json` and the offending key with the expected form; no default is used (FR-008, FR-009). |
| File present, unreadable or invalid JSON (including empty) | Loading fails before the program runs; the error names `config.json` (FR-009). |
| File present, unknown key | Ignored by consumers and left untouched in the file (FR-015). |
| File present, hand-edited formatting/order | Respected as written; never normalized or rewritten (FR-011, edge case). |

## Writing

- The layer writes exactly once per missing file: pretty-printed declared defaults plus a trailing newline, permissions `0644` (R4).
- An existing file is never modified — not to add missing defaults, not to normalize formatting, not to remove unknown keys (FR-011).

## Shape

Keys are lowerCamelCase. Sections are nested objects; shared settings are root properties. With no declared setting the created file is a valid empty object plus a trailing newline, `{}\n` (SC-010):

```json
{}
```

The extension shape, applied by `adding-config-sections`:

```json
{
  "port": 8080,
  "server": {
    "host": "localhost",
    "maxPlayers": 100
  }
}
```

where `port` is a shared root setting and `server`/`maxPlayers` belong to the `server` section.
