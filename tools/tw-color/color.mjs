import { palette } from "./palette.mjs";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^rgba?\(([^)]*)\)$/i;
const CHANNEL = /^\d{1,3}$/;
const ALPHA = /^(?:\d+(?:\.\d+)?|\.\d+)$/;

export function parseColor(text) {
  const hex = HEX.exec(text);
  if (hex) return parseHex(hex[1]);

  const rgb = RGB.exec(text);
  if (rgb) return parseRgb(rgb[1]);

  return null;
}

function parseHex(digits) {
  const step = digits.length <= 4 ? 1 : 2;
  const channels = [];

  for (let i = 0; i < 3; i += 1) {
    channels.push(hexChannel(digits.slice(i * step, (i + 1) * step)));
  }

  const alpha = digits.slice(step * 3);
  return {
    r: channels[0],
    g: channels[1],
    b: channels[2],
    alpha: alpha === "" ? 1 : hexChannel(alpha) / 255,
  };
}

function hexChannel(part) {
  return parseInt(part.length === 1 ? part + part : part, 16);
}

function parseRgb(args) {
  const parts = args.split(",").map((part) => part.trim());
  if (parts.length !== 3 && parts.length !== 4) return null;

  const channels = [];
  for (const part of parts.slice(0, 3)) {
    if (!CHANNEL.test(part)) return null;
    const value = Number(part);
    if (value > 255) return null;
    channels.push(value);
  }

  let alpha = 1;
  if (parts.length === 4) {
    if (!ALPHA.test(parts[3])) return null;
    alpha = Number(parts[3]);
    if (alpha > 1) return null;
  }

  return { r: channels[0], g: channels[1], b: channels[2], alpha };
}

export function toOklab({ r, g, b }) {
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb,
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb,
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb,
  );

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function linearize(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function nearestColor({ L, a, b }, swatches = palette) {
  let best = swatches[0];
  let bestDistance = Infinity;

  for (const swatch of swatches) {
    const hue = (swatch.h * Math.PI) / 180;
    const distanceA = a - swatch.c * Math.cos(hue);
    const distanceB = b - swatch.c * Math.sin(hue);
    const distanceL = L - swatch.l;
    const distance =
      distanceL * distanceL + distanceA * distanceA + distanceB * distanceB;

    if (distance < bestDistance) {
      best = swatch;
      bestDistance = distance;
    }
  }

  return { name: best.name, distance: Math.sqrt(bestDistance) };
}

export function formatMatch(name, alpha) {
  if (alpha >= 1) return name;
  return `${name}/${Math.round(alpha * 100)}`;
}

export function toOklch({ L, a, b }) {
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { l: L, c: Math.hypot(a, b), h: h < 0 ? h + 360 : h };
}

export function toHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// A colour this saturated is matched to a family by its hue; a greyer one by
// its distance to the family's swatch at the same lightness.
const CHROMATIC = 0.05;

// The default margin: a colour farther than this from every class takes a new
// shade.
export const MARGIN = 0.031;

function family(name) {
  const dash = name.lastIndexOf("-");
  return dash < 0 ? null : name.slice(0, dash);
}

function shadeNumber(name) {
  return Number(name.slice(name.lastIndexOf("-") + 1));
}

// The family's swatches from lightest to darkest.
function families(swatches) {
  const groups = new Map();
  for (const swatch of swatches) {
    const name = family(swatch.name);
    if (name === null) continue;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(swatch);
  }
  for (const group of groups.values()) {
    group.sort((x, y) => shadeNumber(x.name) - shadeNumber(y.name));
  }
  return groups;
}

// The family's colour at lightness l, between its two neighbours.
function between(group, l) {
  const lighter = group.findLast((swatch) => swatch.l >= l);
  const darker = group.find((swatch) => swatch.l < l);
  if (!lighter) return darker;
  if (!darker) return lighter;
  const t = (lighter.l - l) / (lighter.l - darker.l);
  const lab = (s) => ({
    a: s.c * Math.cos((s.h * Math.PI) / 180),
    b: s.c * Math.sin((s.h * Math.PI) / 180),
  });
  const x = lab(lighter);
  const y = lab(darker);
  return toOklch({ L: l, a: x.a + (y.a - x.a) * t, b: x.b + (y.b - x.b) * t });
}

function hueGap(x, y) {
  const gap = Math.abs(x - y) % 360;
  return gap > 180 ? 360 - gap : gap;
}

// The new shade for a colour: the family of its nearest hue, and a number
// between the family's lighter and darker neighbours by lightness.
export function proposeShade(lab, swatches = palette) {
  const colour = toOklch(lab);
  const groups = families(swatches);
  let best = null;
  let bestScore = Infinity;

  for (const [name, group] of groups) {
    const point = between(group, colour.l);
    let score;
    if (colour.c >= CHROMATIC) {
      if (point.c < CHROMATIC) continue;
      score = hueGap(colour.h, point.h);
    } else {
      const ha = (point.h * Math.PI) / 180;
      score = Math.hypot(
        lab.a - point.c * Math.cos(ha),
        lab.b - point.c * Math.sin(ha),
      );
    }
    if (score < bestScore) {
      best = name;
      bestScore = score;
    }
  }

  const group = groups.get(best);
  const lighter = group.findLast((swatch) => swatch.l >= colour.l);
  const darker = group.find((swatch) => swatch.l < colour.l);
  const low = lighter ? shadeNumber(lighter.name) : 0;
  const high = darker ? shadeNumber(darker.name) : 1000;
  const number = Math.round((low + high) / 2);
  if (number === low || number === high) return null;
  return `${best}-${number}`;
}
