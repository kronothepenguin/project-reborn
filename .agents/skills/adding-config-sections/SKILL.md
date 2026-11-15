---
name: adding-config-sections
description: Adds a startup key to a Go project's config.json through its config package, with a section package, lowerCamelCase json tags, a default and a validator per field, registration on the root Config, and the unit and full-pipeline tests. Use when a program needs a value before the database opens (a path, a port), or when adding or changing a config section. Values that can change at runtime are settings, declared in the settings catalogue instead.
---

# Adding config sections

`config.json` holds the values a program needs before the database opens, such as the database path and the ports. A
value that can change while the program runs (site name, maintenance, limits, toggles) is a setting: declare it in the
settings catalogue. Programs read the values through the config package, and `config.json` in the working directory is
its only source.

The project's knowledge names the folders, the commands and the checks, the file's contract and the settings catalogue.

| Key | Home |
| --- | --- |
| Read before the database opens, by one component | A section package `<section>` |
| Read before the database opens, by the whole project | A field on the root `Config` |
| Can change while the program runs | A setting in the settings catalogue |

## Add a section

```text
New config declaration:
- [ ] 1. Section package
- [ ] 2. Root registration
- [ ] 3. Unit tests
- [ ] 4. Full-pipeline tests
- [ ] 5. The project's checks
```

1. Create `<section>/<section>.go`. Every field has a lowerCamelCase `json` tag, a `Default<Field>()` and a
   `Validate<Field>()`, and `Validate()` prefixes each error with the field's key:

   ```go
   package mail

   type Mail struct {
       Port int `json:"port"`
   }

   func DefaultPort() int { return 25 }

   func ValidatePort(value int) error { ... }

   func (m Mail) Validate() error {
       if err := ValidatePort(m.Port); err != nil {
           return fmt.Errorf("port: %w", err)
       }
       return nil
   }
   ```

   A section may nest a struct. The nested struct has its own defaults and its own `Validate()`, and the section's
   `Validate()` prefixes its key:

   ```go
   type Mail struct {
       Relay Relay `json:"relay"`
   }

   func DefaultRelay() Relay { return Relay{Host: "localhost", Port: 25} }

   func (m Mail) Validate() error {
       if err := m.Relay.Validate(); err != nil {
           return fmt.Errorf("relay.%w", err)
       }
       return nil
   }
   ```

   A section that shares a rule with another section wraps that section's validator under its own name:

   ```go
   func ValidateHost(value string) error { return web.ValidateHost(value) }
   ```

2. Register the section on the root in exactly three places: the `Config` field, the `defaults()` composition and the
   `Config.Validate()` aggregation. The section prefix makes each error name the full key path (`mail.port`), the same
   path the settings use for the value.

   ```go
   type Config struct {
       Mail mail.Mail `json:"mail"`
   }

   func defaults() *Config {
       return &Config{Mail: mail.Mail{Port: mail.DefaultPort()}}
   }

   func (c *Config) Validate() error {
       if err := c.Mail.Validate(); err != nil {
           return fmt.Errorf("mail.%w", err)
       }
       return nil
   }
   ```

3. Add the [unit tests](#tests) in the section package.
4. Add the [full-pipeline tests](#tests) in the root package, beside its load-state reset helper. Every case moves to
   a new temporary directory, resets the load state, and writes or omits `config.json`.
5. Run the project's checks: format, vet and tests.

## Add a shared root key

1. Add the field to the root `Config` with a lowerCamelCase `json` tag, and declare `Default<Field>()` and
   `Validate<Field>()` beside it.
2. Compose the default in `defaults()` and call `Validate<Field>(c.<Field>)` in `Config.Validate()`, prefixing the key
   in the returned error.
3. Add the same unit and full-pipeline tests, and run the project's checks.

## Tests

Full-pipeline tests, in the root package, for every key:

- Create and defaults: with no `config.json`, loading succeeds, the key holds its default, and the created file holds
  that default.
- Missing key: an existing file without the key gives the default, and the file stays byte-identical.
- Explicit value: a value in the file wins over the default.
- Wrong type: a string where a number is declared fails; the error names `config.json` and the key with the expected
  type.
- Out of range: a value `Validate<Field>` rejects fails; the error names the file, the key and the allowed range.

Unit tests, in the section package:

- The default satisfies its validator.
- The validator accepts valid values and rejects invalid ones.
- The struct round-trips its lowerCamelCase `json` tags.

## Rules

- Write `config.json` when it is absent, and rewrite it when an administrator asks for it: the rewrite adds the
  missing keys and removes the unused ones. An existing file otherwise keeps its keys as written.
- Decode with the default decoder, which skips unknown keys.
- Each default satisfies its own validator; the tests catch a bad default as a programming error.
- Keys are lowerCamelCase, for section names and field tags alike.
- One declaration per key: every consumer uses the same `Default<Field>` and `Validate<Field>`.
- Imports go from the root package to its sections. A section imports another section only to wrap its validator.
- A new declaration leaves every existing declaration, default and rule as it is.
- Loading happens once per process through `sync.Once`; only the root package's tests reset that state, with its
  helper.
