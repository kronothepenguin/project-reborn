---
type: Go Package
title: Usage
description: How a program loads config.json through Load, Must and Get, and how the installer creates it with Create.
---

# Usage

```go
package main

import "github.com/kronothepenguin/project-reborn/packages/config"

func main() {
	cfg := config.Get() // or config.Load() for the error
	_ = cfg.CMS.Port
}
```

- `Load() (*Config, error)` reads or creates `config.json` once per process and caches the result.
- `Must() *Config` returns the loaded configuration or panics with the load error, like `template.Must`.
- `Get() *Config` is the singleton accessor; the first call goes through `Must()`.
- `Filename` is `config.json`. A program that must not create the file, such as the installer, checks for it before
  calling `Load`.
- `Create(cfg *Config) error` validates `cfg` and writes it as `config.json`, failing with an error that wraps
  `fs.ErrExist` when the file already exists. Only the installer calls it, and it must do so before anything calls
  `Load`, which would create the file with the defaults.

# Loading

Loading is the first thing a program does. An unreadable file, invalid JSON, or a wrong value stops the program before
it runs, with an error naming `config.json` and the full key path, for example
`config: config.json: cms.port: must be between 1 and 65535, got 70000`.
