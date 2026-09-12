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

export function nearestColor({ L, a, b }) {
  let best = palette[0];
  let bestDistance = Infinity;

  for (const swatch of palette) {
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
