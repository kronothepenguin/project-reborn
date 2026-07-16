// defineMovie(name, optionsOrDesc)
// Convenience: build a `movie()` description (or accept an existing one) and
// construct + activate a `DirectorContext` for it. Returns the activated
// context. Casts that are attached to the description were already registered
// via `CastLibraryObject._register` at `cast().build()` time, so the context
// just needs activation to become the active singleton source.
//
// Pass either:
//   - a builder description from `movie(name)....build()` (must include `name`),
//     or
//   - an options object `{ tempo, width, height, src, casts }` — the first
//     argument is the movie name.

import { DirectorContext } from "../context.js";
import { CastLibraryObject } from "../objects/cast-library.js";
import { movie } from "./movie.js";

export function defineMovie(name, options = {}) {
  const isDesc = options && typeof options.name === "string" && Array.isArray(options.casts);
  const desc = isDesc
    ? options
    : movie(name)
        .tempo(options.tempo ?? 30)
        .width(options.width ?? 640)
        .height(options.height ?? 480)
        .src(options.src ?? "")
        .cast(options.casts ?? [])
        .build();

  if (isDesc && name !== undefined && desc.name !== name) {
    // Caller passed a different name than the one baked into the desc —
    // prefer the explicit first-arg name.
    desc.name = name;
  }

  const ctx = new DirectorContext({
    name: desc.name,
    src: desc.src ?? "",
    tempo: desc.tempo,
    width: desc.width,
    height: desc.height,
  });
  ctx.activate();

  // `activate()` clears the castLib registry (clean slate per context), so
  // any casts that were attached to the movie description need to be
  // re-registered against the freshly-activated context.
  for (const castLib of desc.casts ?? []) {
    CastLibraryObject._register(castLib);
  }

  return ctx;
}