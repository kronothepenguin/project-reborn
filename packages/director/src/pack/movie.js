// MovieBuilder
// `movie(name)` → `.cast(castLib)`.build()`
// Attaches one or more CastLibraryObject instances to a movie name and applies
// top-level movie options (tempo, width, height, src, optional score).
// `.build()` returns a frozen definition conforming to the C8 contract:
//   { name, casts: CastDefinition[], options: {tempo,width,height,src},
//     score?: ScoreDefinition }
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
    this._score = undefined;
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
  score(v) { this._score = v; return this; }

  build() {
    return Object.freeze({
      name: this._name,
      casts: Object.freeze(this._casts.map((c) => ({ ...c }))),
      options: Object.freeze({
        tempo: this._tempo,
        width: this._width,
        height: this._height,
        src: this._src,
      }),
      ...(this._score !== undefined ? { score: Object.freeze(this._score) } : {}),
    });
  }
}