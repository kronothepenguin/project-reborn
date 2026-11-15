---
type: Go Package
title: astro
description: Resolvers that turn a page built by Astro into an html/template with [[ ]] delimiters, and a helper that writes it.
---

# Resolvers

`Resolver` is `func(name string) (*template.Template, error)`. Each resolver parses the page with the delimiters `[[`
and `]]`, after it removes every `<!>`: Svelte's server renderer ends a `<select>` with that marker when its options
come from a snippet, and `html/template` would escape it into text.

- `MakeFSResolver(fsys)` reads the page `name` from a file system, such as the embedded `dist/`.
- `MakeServerResolver(baseURL)` fetches the page from a running Astro dev server on every call. It trims
  `/index.html` and `.html` from the name, and `index` or an empty name becomes `/`.

# Writing

`WriteTemplate(w, resolve, name, data)` resolves the page and executes it with `data`. Either error answers 500 with
the error's text.

# Checks

From `packages/astro`:

```sh
gofmt -l .
go vet ./...
go test ./... -race
```
