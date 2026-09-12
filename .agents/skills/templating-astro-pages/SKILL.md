---
name: templating-astro-pages
description: Maps Astro page files to Go routes and injects server data with [[ ]] html/template delimiters. Use when adding a page served by a Go handler, naming Astro pages, or passing Go data into the HTML.
---

# Templating Astro pages for Go

Go owns routing; Astro builds the HTML shell, and the Go resolver renders it per request with `html/template`. Page files are template keys, not browser URLs.

## Page to route mapping

Mirror the Go route path. Replace each dynamic `{param}` with its literal name as a folder, using lowercase kebab-case for static segments. Give Go parameters lowercase names (`{id}`, not `{roomID}`) so folders stay lowercase.

| Go route | Astro file | Built template (resolver name) |
| --- | --- | --- |
| `GET /{$}` | `src/pages/index.astro` | `index.html` |
| `GET /me` | `src/pages/me.astro` | `me.html` |
| `GET /rooms` | `src/pages/rooms.astro` | `rooms.html` |
| `GET /rooms/{id}` | `src/pages/rooms/id.astro` | `rooms/id.html` |
| `GET /users/{id}/rooms` | `src/pages/users/id/rooms.astro` | `users/id/rooms.html` |

Pages exist for GET routes. POST/action handlers reuse the GET page's template (see `applying-go-patterns` for handler files and registration).

`build.format` must be `"file"` in `astro.config.mjs` so `.astro` maps 1:1 to `.html`:

```js
export default defineConfig({
  build: { format: "file" },
  // ...
});
```

Without it Astro emits `me/index.html`, and the resolver name changes.

## Injecting server data

Wrap every runtime value in `[[ ]]`. The Go resolver parses the built HTML with `html/template` using `[[` and `]]` delimiters (`template.New(name).Delims("[[", "]]")`).

Handler (in `internal/router/me.go`):

```go
type mePage struct {
	Username string
}

// HandleMeView renders GET /me.
func (r *Router) HandleMeView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "me.html", mePage{Username: "admin"})
}
```

Page (`src/pages/me.astro`), rendered through the signed-in body layout:

```astro
---
import SignedIn from "../layouts/signed-in.astro";
---

<SignedIn title="Me">
  <h1 class="text-2xl font-bold">[[ .Username ]]</h1>
</SignedIn>
```

- `[[ .Field ]]` — runtime data from the Go handler. Works in text and in attributes. `html/template` applies context-aware escaping.
- `{expr}` — Astro build-time expressions (`Astro.props`, imports). Evaluated once at build, not per request.
- `{{ }}` — reserved for scaffolding `.tmpl` files. Never use it in `src/pages`.

## Workflow

1. Name the Astro file from the Go route with the table above.
2. Add the page and keep `build.format` at `"file"`.
3. Add or update the handler: define the page struct in its route file and call `astro.WriteTemplate` with the built template name.
4. Register the route per `applying-go-patterns`.
5. Verify (see below).

## Verification

Run from the frontend package:

```sh
pnpm build
test -f dist/<page>.html && grep -c '\[\[ .Field \]\]' dist/<page>.html
```

The built file must exist and still contain the `[[ ]]` placeholder (unrendered). Replace `<page>` and `.Field` with the page under review. Then run the Go app and request the route to confirm substitution.

## Gotchas

- Do not create Astro dynamic routes (`src/pages/rooms/[id].astro`). A static build cannot emit a page for an unknown id and fails with `GetStaticPathsRequired`. Use the literal folder form `rooms/id.astro`; the Go handler serves every id through the one template.
- Pass the built file path to `astro.WriteTemplate` (`me.html`, `rooms/id.html`). Production resolvers read that exact path; the dev resolver trims `.html`/`/index.html` and fetches the matching URL from the Astro dev server.
- `[[ ]]` is substituted only in built HTML. Svelte scripts and other JS bundles are not processed by `html/template`; put runtime data in the markup, not in component code.
- Passing runtime values into client component props works only for simple scalars. Quotes or backslashes in the value corrupt the serialized props JSON; see `adding-svelte-interactivity`.
- `dist/` is embedded in the Go binary, so build the frontend before `go build`.
