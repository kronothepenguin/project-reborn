#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { formatMatch, nearestColor, parseColor, toOklab } from "./color.mjs";

const USAGE = `usage: tw-color [-d | --distance] [color ...]

Prints the closest Tailwind CSS v4 color for each input.

  color           #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(r, g, b), rgba(r, g, b, a)
  -d, --distance  append the OKLab distance to the match
  -h, --help      show this help

Without colors, one color per line is read from stdin.`;

function main() {
  let options;
  let positionals;

  try {
    ({ values: options, positionals } = parseArgs({
      options: {
        distance: { type: "boolean", short: "d" },
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

  let failed = false;

  if (positionals.length > 0) {
    for (const text of positionals) {
      failed =
        handleInput(text, `invalid color: ${text}`, options.distance) || failed;
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
          options.distance,
        ) || failed;
    });
  }

  if (failed) process.exitCode = 1;
}

function handleInput(text, problem, showDistance) {
  const color = parseColor(text);
  if (color === null) {
    console.error(`tw-color: ${problem}`);
    return true;
  }

  const { name, distance } = nearestColor(toOklab(color));
  const match = formatMatch(name, color.alpha);
  console.log(showDistance ? `${match} ${Number(distance.toFixed(4))}` : match);
  return false;
}

main();
