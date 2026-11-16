---
type: Task
title: Inject the installer's listener, ask host and port only inside reborn, and move before saving
description: The installer takes its Listener through Inject in place of WithListener; with a listener its config step asks one host and one port, moves first and saves them into the reborn section of the existing config.json only when the move worked.
scope: [packages/installer, packages/config]
depends_on: []
skills: [applying-go-patterns, adding-config-sections, templating-astro-pages, testing-behaviours, use-modern-go]
---

# Goal

The installer fits the shape of reborn the user chose ([Plan](/features/platform/plan.md), its last three decisions).
The behaviours of the spec:

- Inside reborn, the config step asks one host and one port, and the database stays the one `config.json` names: a
  new address moves the browser to it.
- Inside reborn, the move to a new address fails: the form shows the error, nothing is saved, and the step takes
  another address.
- Run alone, the installer keeps both forms as they are today.

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- `packages/installer/knowledge/steps.md` and `runners.md`: what task 04 built, with `WithListener` and the
  one-address forms.
- `packages/cms/knowledge/runtime.md`: `Inject` in the CMS, the model.
- Inside reborn `config.json` exists when the installer opens: the runner's `config.Get()` wrote it with its defaults,
  and the database is open.
- "Where the request arrived" is the host and port the browser addressed (`r.Host`). With host `0.0.0.0` or `::` on
  the same port the host differs, so `Move` is called; reborn's `Move` handles a move on the same port
  ([platform 05](/features/platform/tasks/05-reborn-installs-a-new-hotel.md)).
- A successful move redirects the browser to the same path on the new address.

# Steps

- [ ] `installer.Services{Listener Listener}` and `(*Installer).Inject(Services)`, called after `New` and before
  `Mount`. `WithListener` goes. With a listener the installer shows the one-address forms; without one, today's forms.
- [ ] With a listener, the config step asks the host and the port, with the values of `config.json`'s `reborn` section
  as they are. It validates them, calls `Move` when they differ from where the request arrived, and saves them into
  the `reborn` section of the existing `config.json` once the move worked. A failed move saves nothing and shows its
  error in the form, and the step is sent again with another address.
- [ ] `packages/config` gains the smallest function that saves the values of one section into an existing
  `config.json`, written as `Rewrite` writes the file. Name it in the report.
- [ ] One test per behaviour of the goal, through the installer's router, with a fake `Listener`. The tests of task 04
  follow the new way in.
- [ ] Update `packages/installer/knowledge` and `packages/config/knowledge`.

# Checks

```sh
make -C packages/installer check
make -C packages/config check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/installer`,
`packages/config`.
