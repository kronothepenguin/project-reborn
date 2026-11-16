---
type: Go Package
title: Options
description: The Site type and the options that hand reborn each program's resolver and static files.
---

# Options

What differs between production and development is how each program's pages are served, so that is all `New` takes:

```go
reborn.New(
    reborn.WithCMS(reborn.Site{Resolver: resolver, Static: files}),
    reborn.WithHousekeeping(reborn.Site{...}),
    reborn.WithInstaller(reborn.Site{...}),
)
```

- A `Site` holds an `astro.Resolver` and an `http.Handler` for the static files. The production runner builds both
  from the package's embedded `dist/`, with `astro.MakeFSResolver` and `http.FileServerFS`.
- `WithInstaller` holds the installer's site for a hotel that is not installed yet; `Run` serves it from platform 05.
