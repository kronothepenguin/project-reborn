// MovieBuilder
// `movie(name)` → `.cast(castLib)`.build()`
// Attaches one or more CastLibraryObject instances to a movie name and applies
// top-level movie options (tempo, width, height, src). `.build()` returns a
// `{ name, casts, options }` description that `defineMovie()` (or the runtime)
// consumes to construct a DirectorContext.
//
// `movie()` is intentionally NOT a DirectorContext factory — context creation
// happens via `defineMovie()` or `createContext()` once casts and assets are
// ready. The builder only assembles the configuration.

export function movie(name = "Movie") {
  return new MovieBuilder(name);
}

class MovieBuilder {
  constructor(name) {
    this._name = name;
    this._casts = [];
    this._tempo = 30;
    this._width = 640;
    this._height = 480;
    this._src = "";
  }

  cast(castLib) {
    if (Array.isArray(castLib)) {
      this._casts.push(...castLib);
    } else {
      this._casts.push(castLib);
    }
    return this;
  }

  tempo(v) { this._tempo = v; return this; }
  width(v) { this._width = v; return this; }
  height(v) { this._height = v; return this; }
  src(v) { this._src = v; return this; }

  build() {
    return {
      name: this._name,
      casts: this._casts,
      tempo: this._tempo,
      width: this._width,
      height: this._height,
      src: this._src,
    };
  }
}