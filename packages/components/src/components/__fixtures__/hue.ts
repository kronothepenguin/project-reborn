// The OKLCH hue of a computed CSS colour, in degrees, so a test can tell
// whether a colour has a Holo colour's hue. Chromium computes Tailwind's
// colours as oklch(); an rgb() colour is converted.
export function hue(color: string): number {
  const oklch = color.match(/^oklch\(([\d.]+%?) ([\d.]+) ([\d.]+)/);
  if (oklch) return Number(oklch[3]);
  const rgb = color.match(/^rgba?\((\d+), (\d+), (\d+)/);
  if (!rgb) throw new Error(`not a colour: ${color}`);
  return hueOf(Number(rgb[1]), Number(rgb[2]), Number(rgb[3]));
}

// The hue of a #rrggbb colour, such as one of Holo's.
export function hexHue(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return hueOf((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

// The distance between two hues, in degrees.
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function hueOf(r: number, g: number, b: number): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
}
