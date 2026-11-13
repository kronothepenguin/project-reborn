---
name: templating-astro-pages
description: Names Astro page files after the Go routes that serve them and injects server data with [[ ]] html/template delimiters. Use when adding a page served by a Go handler, naming or moving an Astro page, or passing Go data into a page or an island.
---

# Templating Astro pages for Go

Go owns the routes. Astro builds each page once into an HTML file, and a Go handler executes that file per request as
an `html/template` with the delimiters `[[` and `]]`. A page file is a template name.

The project's knowledge names the folders, the commands and the checks.

## Name the page after the route

Mirror the Go route path. Static segments are lowercase kebab-case folders. Each `{param}` becomes a folder named
after the parameter. Give parameters lowercase names (`{id}`, in place of `{roomID}`).

| Go route | Astro page | Template name |
| --- | --- | --- |
| `GET /{$}` | `src/pages/index.astro` | `index.html` |
| `GET /rooms` | `src/pages/rooms.astro` | `rooms.html` |
| `GET /rooms/{id}` | `src/pages/rooms/id.astro` | `rooms/id.html` |
| `GET /users/{id}/rooms` | `src/pages/users/id/rooms.astro` | `users/id/rooms.html` |

- A page exists for each GET route. A POST handler answers with its GET page's template; `applying-go-patterns` owns
  the handler files and their registration.
- Set `build: { format: "file" }` in `astro.config.mjs`, so `rooms.astro` builds to `rooms.html`.

## Inject server data

```astro
---
import App from "../layouts/app.astro";
---

<App title="Profile">
  <h1 class="text-2xl font-bold">[[ .Username ]]</h1>
</App>
```

The handler executes `profile.html` with a page struct that has a `Username` field.

- `[[ .Field ]]` is runtime data from the Go handler, in text and in attributes. `html/template` escapes it by context.
- `{expr}` is an Astro expression, evaluated once at build time.
- `{{ }}` belongs to scaffolding `.tmpl` files. Pages use `[[ ]]`.

## Workflow

1. Name the page from the route with the table above.
2. Write the page, with `[[ ]]` for every runtime value.
3. Write the handler: a page struct in its route file, executed with the built template name.
4. Register the route as `applying-go-patterns` says.
5. Verify.

## Verify

1. Build the frontend.
2. Check that the built page exists and still holds its `[[ ]]` placeholders.
3. Run the Go program and request the route to see the values filled in.

## Gotchas

- Write each `{param}` as a literal folder (`rooms/id.astro`). A static build rejects Astro's `rooms/[id].astro` with
  `GetStaticPathsRequired`; one template serves every id.
- Pass the built file path as the template name: `rooms.html`, `rooms/id.html`.
- `[[ ]]` is filled in the built HTML only. Islands and other JavaScript read runtime data from the page's markup or
  fetch it.
- A runtime value reaches an island prop only as a simple scalar: quotes or backslashes corrupt the serialized props
  JSON. The island fetches richer data.
- Text that may hold quotes, such as a description, reaches an island through a hidden element's `data-` attributes,
  which the browser decodes.
- Astro writes the script that wakes every island just before a page's first island. On a page with several islands,
  keep the first one outside `[[ if ]]` and `[[ range ]]` and let it decide in the browser whether to show itself, so
  every visitor gets the script.
- The Go binary embeds the built pages: build the frontend before the Go build.
