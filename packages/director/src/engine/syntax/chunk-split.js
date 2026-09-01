export function splitChars(str) {
  return str.split("");
}

export function splitItems(str, delim) {
  return str.split(delim);
}

export function splitLines(str) {
  return str.split("\r");
}

export function splitWords(str) {
  return str.split(/[ \t\r\n]/);
}

export const META = Symbol("chunkBoundMeta");

export class ChunkBound extends String {
  constructor(text, kind, container, charStart, charEnd) {
    super(text);
    Object.defineProperty(this, META, {
      value: { kind, container, charStart, charEnd },
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }
  get meta() {
    return this[META];
  }
}

export function normalizeContainer(container) {
  return typeof container === "string" ? container : "";
}

export function stringifyChunkValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

// A put target is a plain string (whole container), a ChunkBound (exact char
// span), or a nonexistent target (charStart < 0) → append at the end.
export function resolveChunkTarget(target) {
  if (target instanceof ChunkBound) {
    return { str: target.meta.container, start: target.meta.charStart, end: target.meta.charEnd };
  }
  const str = normalizeContainer(target);
  return { str, start: 0, end: str.length };
}

// Per-part char offsets for a split container (delimiter length between parts).
function measureParts(str, parts, delimLen) {
  const offsets = new Array(parts.length);
  let pos = 0;
  for (let i = 0; i < parts.length; i++) {
    offsets[i] = pos;
    pos += parts[i].length + (i < parts.length - 1 ? delimLen : 0);
  }
  return offsets;
}

export function createChunkSelector(splitFn, kind, delimFn) {
  return function selector(n) {
    const single = {
      of(container) {
        const str = normalizeContainer(container);
        const delim = delimFn ? delimFn() : "";
        const parts = splitFn(str, delim);
        if (n < 1 || n > parts.length) {
          return new ChunkBound("", kind, str, -1, -1);
        }
        const offsets = measureParts(str, parts, delim.length);
        const start = offsets[n - 1];
        return new ChunkBound(parts[n - 1], kind, str, start, start + parts[n - 1].length);
      },
    };
    single.to = (m) => ({
      of(container) {
        const str = normalizeContainer(container);
        const delim = delimFn ? delimFn() : "";
        const parts = splitFn(str, delim);
        if (n < 1 || m < 1) return new ChunkBound("", kind, str, -1, -1);
        const last = Math.min(m, parts.length);
        if (n > last) return new ChunkBound("", kind, str, -1, -1);
        const offsets = measureParts(str, parts, delim.length);
        const start = offsets[n - 1];
        const end = offsets[last - 1] + parts[last - 1].length;
        const text =
          kind === "item"
            ? parts.slice(n - 1, last).join(delim + " ")
            : str.substring(start, end);
        return new ChunkBound(text, kind, str, start, end);
      },
    });
    return single;
  };
}