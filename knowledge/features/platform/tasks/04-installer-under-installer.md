---
type: Task
title: Serve the installer under /installer/, with one form per runner and no done page
description: The installer's pages, routes and redirects move under /installer/, its Mount protects its own routes, the done page goes, and with the option WithListener it asks one host and port and calls the Listener to move; without it, today's form stays.
scope: [packages/installer, apps/installer/README.md, tests/e2e]
depends_on: []
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, testing-behaviours, use-modern-go]
---

# Goal

The installer can share reborn's mux with the hotel, and can move reborn to the address the administrator chooses
([0004](/decisions/reborn/0004-the-installer-inside-reborn.md)). The behaviours of the spec:

- A visitor opens the installer: its pages, forms and files are served under `/installer/`.
- The administrator is created: the browser goes to `/`, and the done page is gone.
- Inside reborn, the config step asks one host and one port: a new address moves the browser to it, and a failed move
  shows in the form.
- Inside reborn, the site step asks no housekeeping address: it saves the site address plus `/housekeeping`.
- Run alone, the installer keeps both forms as they are today.
- A page on another site posts a form to the installer: it is refused with status 403. The spec lists this line as
  built, and the installer has no test of it yet.

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [Inside reborn the installer lives under /installer/, moves the hotel to the address it is given, and goes once
  installed](/decisions/reborn/0004-the-installer-inside-reborn.md)
- Supersedes the done page of [holo-port 0070](/decisions/holo-port/0070-housekeeping-applies-updates.md) and
  [holo-port 0052](/decisions/holo-port/0052-installer-has-no-modes.md), as
  [reborn 0004](/decisions/reborn/0004-the-installer-inside-reborn.md) says.
- `packages/installer/knowledge/steps.md`: the steps as they are today. The config step writes the `reborn` section
  with its defaults already.
- A prefix every route shares is left out of handler file names and page paths (`applying-go-patterns`,
  `templating-astro-pages`): the files keep their names under `/installer/`.
- If the host is `0.0.0.0` or `::`, the browser keeps the host name it used and only the port changes; that is
  reborn's side of `Move`, in [platform 05](/features/platform/tasks/05-reborn-installs-a-new-hotel.md).

# Steps

- [ ] Astro's `base` is `/installer`; every link, form action and redirect of the installer carries the prefix;
  `Mount` registers its routes under `/installer/` and its static files through `http.StripPrefix`.
- [ ] `Mount` wraps its routes with `http.NewCrossOriginProtection()`, as the CMS's does, since a shared mux is not
  wrapped by its runner.
- [ ] The done page goes (`done.astro`, `done.go`, its route): after "Create administrator" the installer redirects to
  `/`. The "already installed" page stays.
- [ ] `installer.Installed(ctx, db) (bool, error)`: someone holds `housekeeping.accessGroups`, the rule of
  `internal/setup`. `(*Installer).Done() <-chan struct{}`, closed once the administrator exists.
- [ ] The interface and its option, documented on the type:

  ```go
  // Listener moves the running hotel to a new address: it opens host:port, redirects
  // the browser to the same path there, and closes the old server right after.
  type Listener interface {
      Move(w http.ResponseWriter, r *http.Request, host string, port int) error
  }
  func WithListener(l Listener) Option
  ```

- [ ] With `WithListener`, the config step shows the database path, host and port, with the `reborn` section's
  defaults; it writes them to `reborn`, with the other sections' defaults, then calls `Move` when host or port differ
  from where the request arrived, and shows `Move`'s error in the form. The site step asks no housekeeping address,
  saves `site.housekeepingUrl` as the site address plus `/housekeeping`, and suggests `http://<host>:<port>` as the
  site address. Without the option, both steps stay as they are.
- [ ] One test per behaviour of the goal, through the installer's router: `Move` is observed through a fake
  `Listener`.
- [ ] Update `packages/installer/knowledge` to the new steps, the prefix and the option.
- [ ] The browser suites' harness (`tests/e2e/lib/hotel.mjs`) and the installer and "together" suites use
  `/installer/`, and the "together" suite no longer expects a done page.
- [ ] The installer's two runners (`apps/installer/cmd/installer/main.go`, `apps/installer/cmd/installer-dev/main.go`)
  are the user's files: write in the report the exact lines that send `GET /` to `/installer/`, and stop for the
  master to ask. `apps/installer/README.md` names `:17306/installer/`.

# Checks

```sh
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/installer`.
