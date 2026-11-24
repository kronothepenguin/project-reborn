#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import {
  MARGIN,
  formatMatch,
  nearestColor,
  parseColor,
  proposeShade,
  toHex,
  toOklab,
} from "./color.mjs";
import { palette } from "./palette.mjs";
import { SHADES, readShades, writeShade } from "./shades.mjs";

const USAGE = `usage: tw-color [-d] [-m margin] [-w note] [-s file] [color ...]

Prints the closest Tailwind CSS v4 color for each input. A color farther than
the margin from Tailwind's own classes takes the closest new shade of the
stylesheet; farther than the margin from those too, it gets a proposed new
shade: "new <family>-<number> <hex>".

  color              #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(r, g, b), rgba(r, g, b, a)
  -d, --distance     append the OKLab distance to the match
  -m, --margin <n>   the OKLab distance beyond which a new shade is proposed (default ${MARGIN})
  -w, --write <note> write each proposed shade into the stylesheet, under a
                     comment holding the note
  -s, --shades <css> the stylesheet of new shades
                     (packages/components/src/styles/shades.css)
  -h, --help         show this help

Without colors, one color per line is read from stdin.`;

function main() {
  let options;
  let positionals;

  try {
    ({ values: options, positionals } = parseArgs({
      options: {
        distance: { type: "boolean", short: "d" },
        margin: { type: "string", short: "m" },
        write: { type: "string", short: "w" },
        shades: { type: "string", short: "s" },
        help: { type: "boolean", short: "h" },
      },
      allowPositionals: true,
    }));
  } catch (error) {
    console.error(`tw-color: ${error.message}`);
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(USAGE);
    return;
  }

  const margin = options.margin === undefined ? MARGIN : Number(options.margin);
  if (!(margin >= 0)) {
    console.error(`tw-color: invalid margin: ${options.margin}`);
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }
  const settings = {
    distance: options.distance,
    margin,
    note: options.write,
    shades: options.shades ?? SHADES,
  };

  let failed = false;

  if (positionals.length > 0) {
    for (const text of positionals) {
      failed =
        handleInput(text, `invalid color: ${text}`, settings) || failed;
    }
  } else {
    let input;
    try {
      input = readFileSync(0, "utf8");
    } catch (error) {
      console.error(`tw-color: cannot read stdin: ${error.message}`);
      process.exitCode = 2;
      return;
    }

    input.split(/\r?\n/).forEach((line, index) => {
      const text = line.trim();
      if (text === "") return;
      failed =
        handleInput(
          text,
          `line ${index + 1}: invalid color: ${text}`,
          settings,
        ) || failed;
    });
  }

  if (failed) process.exitCode = 1;
}

function handleInput(text, problem, settings) {
  const color = parseColor(text);
  if (color === null) {
    console.error(`tw-color: ${problem}`);
    return true;
  }

  // Tailwind's own class first; the new shades only for a colour beyond it.
  const lab = toOklab(color);
  const swatches = [...palette, ...readShades(settings.shades)];
  let nearest = nearestColor(lab, palette);
  if (nearest.distance > settings.margin) nearest = nearestColor(lab, swatches);
  const { name, distance } = nearest;
  const rounded = Number(distance.toFixed(4));
  const match = formatMatch(name, color.alpha);

  if (distance <= settings.margin) {
    console.log(settings.distance ? `${match} ${rounded}` : match);
    return false;
  }

  const shade = proposeShade(lab, swatches);
  if (shade === null) {
    console.error(`tw-color: no free shade number for ${text}`);
    return true;
  }
  const hex = toHex(color);
  const proposal = `new ${formatMatch(shade, color.alpha)} ${hex}`;
  console.log(
    settings.distance ? `${proposal} (${match} ${rounded})` : proposal,
  );
  if (settings.note !== undefined) {
    writeShade(settings.shades, shade, hex, settings.note);
  }
  return false;
}

main();
