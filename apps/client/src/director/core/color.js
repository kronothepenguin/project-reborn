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
