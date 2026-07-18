// MemberRegistry subsystem (FR-004/FR-005/FR-025)
//
// Per `DirectorContext`-instance registry that owns all member lookup for the
// context's movie. No state lives on any class (FR-005); `CastLibraryObject
// .member`, `MovieObject.member`, and the top-level `member()` method all
// delegate to the active context's registry (research.md R4).
//
// Lookup surface (per data-model.md `MemberRegistry`):
//   - `register(castLib, member)`             — add a member under a castLib
//   - `unregisterAll(castLib)`                — drop every member of a castLib
//   - `lookupByNumber(castLib, n)`            — O(1) per-castLib by-number
//   - `lookupByNameInCastLib(castLib, name)` — O(1) per-castLib by-name
//   - `lookupByNameInMovie(movie, name)`      — search castLibs in declaration
//                                              order; first match wins (FR-025)
//
// `castLib` may be either a `CastLibraryObject` instance or its name string.
// Member numbers: when a member is registered with `number === 0` (or
// undefined), the registry assigns the next sequential number for that castLib
// (1-indexed, compacted — FR-017). When a member carries an explicit number
// (e.g., built by the packaging builder), it is preserved and the per-castLib
// counter is bumped past it.

export class MemberRegistry {
  constructor() {
    this.byNumber = new Map();
    this.byNameInCastLib = new Map();
    this.byNameAcrossCastLibs = new Map();
    this.nextNumberByCastLib = new Map();
  }

  _castLibKey(castLib) {
    return typeof castLib === "string" ? castLib : (castLib && castLib.name) || "";
  }

  _ensureCastLibMaps(castLibKey) {
    if (!this.byNumber.has(castLibKey)) this.byNumber.set(castLibKey, new Map());
    if (!this.byNameInCastLib.has(castLibKey)) this.byNameInCastLib.set(castLibKey, new Map());
    if (!this.nextNumberByCastLib.has(castLibKey)) this.nextNumberByCastLib.set(castLibKey, 1);
    return this.byNumber.get(castLibKey);
  }

  register(castLib, member) {
    if (!member) return member;
    const castLibKey = this._castLibKey(castLib);
    const numberMap = this._ensureCastLibMaps(castLibKey);
    const nameMap = this.byNameInCastLib.get(castLibKey);

    let n = Number(member.number);
    if (!Number.isFinite(n) || n <= 0) {
      n = this.nextNumberByCastLib.get(castLibKey);
      member.number = n;
    } else if (n >= this.nextNumberByCastLib.get(castLibKey)) {
      this.nextNumberByCastLib.set(castLibKey, n + 1);
    }
    if (this.nextNumberByCastLib.get(castLibKey) === n) {
      this.nextNumberByCastLib.set(castLibKey, n + 1);
    }

    numberMap.set(n, member);
    if (member.name) {
      nameMap.set(member.name, member);
      const across = this.byNameAcrossCastLibs;
      if (!across.has(member.name)) across.set(member.name, []);
      const list = across.get(member.name);
      if (!list.includes(member)) list.push(member);
    }
    return member;
  }

  unregisterAll(castLib) {
    const castLibKey = this._castLibKey(castLib);
    const numberMap = this.byNumber.get(castLibKey);
    const nameMap = this.byNameInCastLib.get(castLibKey);
    if (numberMap) {
      for (const member of numberMap.values()) {
        if (member.name) {
          const across = this.byNameAcrossCastLibs.get(member.name);
          if (across) {
            const idx = across.indexOf(member);
            if (idx !== -1) across.splice(idx, 1);
            if (across.length === 0) this.byNameAcrossCastLibs.delete(member.name);
          }
        }
      }
    }
    this.byNumber.delete(castLibKey);
    this.byNameInCastLib.delete(castLibKey);
    this.nextNumberByCastLib.delete(castLibKey);
  }

  lookupByNumber(castLib, n) {
    const castLibKey = this._castLibKey(castLib);
    const numberMap = this.byNumber.get(castLibKey);
    if (!numberMap) return null;
    return numberMap.get(Number(n)) ?? null;
  }

  lookupByNameInCastLib(castLib, name) {
    const castLibKey = this._castLibKey(castLib);
    const nameMap = this.byNameInCastLib.get(castLibKey);
    if (!nameMap) return null;
    return nameMap.get(name) ?? null;
  }

  // FR-025: `Movie.member(byName)` searches castLibs in declaration order,
  // returns the first match.
  lookupByNameInMovie(movie, name) {
    if (!movie) return null;
    const castLibs = movie.castLibs ?? [];
    for (const castLib of castLibs) {
      const found = this.lookupByNameInCastLib(castLib, name);
      if (found) return found;
    }
    return null;
  }
}