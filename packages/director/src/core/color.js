export class Color {
  #red;
  #green;
  #blue;

  constructor(red = 0, green = 0, blue = 0) {
    this.#red = clamp(red);
    this.#green = clamp(green);
    this.#blue = clamp(blue);
  }

  get red() {
    return this.#red;
  }

  set red(value) {
    this.#red = clamp(value);
  }

  get green() {
    return this.#green;
  }

  set green(value) {
    this.#green = clamp(value);
  }

  get blue() {
    return this.#blue;
  }

  set blue(value) {
    this.#blue = clamp(value);
  }

  get hex() {
    return "#" + toHex2(this.#red) + toHex2(this.#green) + toHex2(this.#blue);
  }

  get rgb() {
    return `rgb(${this.#red}, ${this.#green}, ${this.#blue})`;
  }

  equals(other) {
    if (other == null) return false;
    if (other instanceof Color) {
      return this.#red === other.#red
        && this.#green === other.#green
        && this.#blue === other.#blue;
    }
    if (typeof other === "object") {
      const r = other.red ?? other.r;
      const g = other.green ?? other.g;
      const b = other.blue ?? other.b;
      if (typeof r === "number" && typeof g === "number" && typeof b === "number") {
        return this.#red === r && this.#green === g && this.#blue === b;
      }
    }
    return false;
  }
}

export function color(r, g, b) {
  return new Color(r, g, b);
}

function clamp(value) {
  const n = Math.trunc(value);
  if (n < 0) return 0;
  if (n > 255) return 255;
  return n;
}

function toHex2(n) {
  const s = n.toString(16);
  return s.length === 1 ? "0" + s : s;
}
