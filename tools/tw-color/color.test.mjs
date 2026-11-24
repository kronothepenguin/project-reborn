import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { formatMatch, nearestColor, parseColor, toOklab } from "./color.mjs";
import { palette } from "./palette.mjs";
import { parseShades } from "./shades.mjs";

const SCRIPT = fileURLToPath(new URL("./tw-color.mjs", import.meta.url));
const NO_SHADES = join(mkdtempSync(join(tmpdir(), "tw-color-")), "none.css");

// Runs the tool against a stylesheet of new shades that does not exist, unless
// the arguments name one.
function run(...args) {
  return spawnSync(process.execPath, [SCRIPT, "-s", NO_SHADES, ...args], {
    encoding: "utf8",
  });
}

function stylesheet(text) {
  const path = join(mkdtempSync(join(tmpdir(), "tw-color-")), "shades.css");
  if (text !== undefined) writeFileSync(path, text);
  return path;
}

function best(text) {
  const color = parseColor(text);
  const { name, distance } = nearestColor(toOklab(color));
  return { match: formatMatch(name, color.alpha), distance };
}

function closeTo(actual, expected, epsilon = 1e-6) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${actual} is not within ${epsilon} of ${expected}`,
  );
}

test("parses hex colors", () => {
  assert.deepEqual(parseColor("#1f1f1f"), { r: 31, g: 31, b: 31, alpha: 1 });
  assert.deepEqual(parseColor("#FFF"), { r: 255, g: 255, b: 255, alpha: 1 });
  assert.deepEqual(parseColor("#0000"), { r: 0, g: 0, b: 0, alpha: 0 });
  assert.deepEqual(parseColor("#FFB86A80"), {
    r: 255,
    g: 184,
    b: 106,
    alpha: 128 / 255,
  });
});

test("parses rgb and rgba colors", () => {
  assert.deepEqual(parseColor("rgb(0, 0, 0)"), { r: 0, g: 0, b: 0, alpha: 1 });
  assert.deepEqual(parseColor("rgb(1,2,3)"), { r: 1, g: 2, b: 3, alpha: 1 });
  assert.deepEqual(parseColor("rgba(255, 184, 106, 0.5)"), {
    r: 255,
    g: 184,
    b: 106,
    alpha: 0.5,
  });
});

test("rejects invalid colors", () => {
  const invalid = [
    "",
    "#",
    "#12",
    "#12345",
    "#gggggg",
    "#1f1f1f;",
    "rgb(0,0)",
    "rgb(0,0,0,0,0)",
    "rgb(256,0,0)",
    "rgba(0,0,0,1.5)",
    "rgba(0,0,0,-0.5)",
    "hsl(0, 0%, 0%)",
    "black",
  ];

  for (const text of invalid) {
    assert.equal(
      parseColor(text),
      null,
      `${JSON.stringify(text)} should be invalid`,
    );
  }
});

test("converts sRGB to OKLab", () => {
  const black = toOklab(parseColor("#000000"));
  closeTo(black.L, 0);
  closeTo(black.a, 0);
  closeTo(black.b, 0);

  const white = toOklab(parseColor("#ffffff"));
  closeTo(white.L, 1);
  closeTo(white.a, 0, 1e-4);
  closeTo(white.b, 0, 1e-4);

  const red = toOklab(parseColor("#ff0000"));
  closeTo(red.L, 0.6279553606, 1e-6);
  closeTo(red.a, 0.2248630611, 1e-6);
  closeTo(red.b, 0.1258462985, 1e-6);
});

test("matches the closest palette color", () => {
  const cases = new Map([
    ["#c10007", "red-700"],
    ["#ffb86a", "orange-300"],
    ["#4ab501", "lime-600"],
    ["#ffffff", "white"],
    ["#000000", "black"],
    ["#1f1f1f", "olive-900"],
  ]);

  for (const [input, expected] of cases) {
    assert.equal(best(input).match, expected, input);
  }
});

test("reports the OKLab distance", () => {
  closeTo(best("#ffb86a").distance, 0.00457, 1e-5);
  closeTo(best("#c10007").distance, 0.007287, 1e-6);
  closeTo(best("#000000").distance, 0);
});

test("appends alpha as an opacity modifier", () => {
  assert.equal(best("rgba(0, 0, 0, 0.5)").match, "black/50");
  assert.equal(best("#00000080").match, "black/50");
  assert.equal(best("rgba(0, 0, 0, 0)").match, "black/0");
  assert.equal(best("rgba(0, 0, 0, 1)").match, "black");
  assert.equal(best("#000000ff").match, "black");
});

test("palette is complete and unique", () => {
  assert.equal(palette.length, 288);
  assert.equal(new Set(palette.map((swatch) => swatch.name)).size, 288);
  assert.equal(palette[0].name, "red-50");
  assert.equal(palette.at(-1).name, "white");
});

test("cli accepts colors as arguments", () => {
  const result = run("#ffb86a", "#c10007");

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "orange-300\nred-700\n");
  assert.equal(result.stderr, "");
});

test("cli reads stdin when there are no colors", () => {
  const result = spawnSync(process.execPath, [SCRIPT, "-s", NO_SHADES], {
    input: "#c10007\n\nnope\n#ffb86a\n",
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "red-700\norange-300\n");
  assert.match(result.stderr, /line 3: invalid color: nope/);
});

test("cli reports bad arguments and keeps going", () => {
  const result = run("#c10007", "nope");

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "red-700\n");
  assert.match(result.stderr, /invalid color: nope/);
});

test("cli prints distances with -d or --distance", () => {
  assert.equal(run("-d", "#ffb86a").stdout, "orange-300 0.0046\n");
  assert.equal(
    run("--distance", "#ffb86a", "#c10007").stdout,
    "orange-300 0.0046\nred-700 0.0073\n",
  );
  assert.equal(run("#000000", "--distance").stdout, "black 0\n");
  assert.equal(run("-d", "rgba(0, 0, 0, 0.5)").stdout, "black/50 0\n");
});

test("cli prints usage for -h and rejects unknown flags", () => {
  const help = run("-h");
  assert.equal(help.status, 0);
  assert.match(help.stdout, /usage: tw-color/);

  const unknown = run("--wat");
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /usage: tw-color/);
});

test("cli exits cleanly for valid input", () => {
  const result = run("rgba(0, 0, 0, 0.5)");

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "black/50\n");
  assert.equal(result.stderr, "");
});

test("a color within the margin gets its Tailwind class", () => {
  const result = run("-d", "#fc6204");

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "orange-500 0.0279\n");
});

test("a color beyond the margin gets a proposed shade of its nearest hue's family", () => {
  const result = run("-d", "#d64242", "#a67a3e");

  assert.equal(result.status, 0);
  assert.equal(
    result.stdout,
    "new red-550 #d64242 (orange-700 0.061)\nnew yellow-650 #a67a3e (yellow-700 0.071)\n",
  );
});

test("the margin decides between a class and a new shade", () => {
  assert.equal(run("-m", "0.07", "#d64242").stdout, "orange-700\n");
  assert.equal(run("--margin", "0.01", "#fc6204").stdout, "new orange-550 #fc6204\n");

  const invalid = run("-m", "far", "#d64242");
  assert.equal(invalid.status, 2);
  assert.match(invalid.stderr, /invalid margin: far/);
});

test("a grey beyond the margin gets a shade of the neutral family", () => {
  assert.equal(run("#333").stdout, "new neutral-750 #333333\n");
});

test("a shade added once is found again by its class", () => {
  const path = stylesheet(`@theme {
  /* Holo's red title bar */
  --color-red-550: #d64242;
}
`);

  assert.equal(run("-s", path, "-d", "#d64242").stdout, "red-550 0\n");
  assert.equal(run("-s", path, "-d", "#d44040").stdout, "red-550 0.0057\n");
});

test("a colour within the margin of Tailwind's palette keeps its class beside a nearer new shade", () => {
  const path = stylesheet(`@theme {
  --color-orange-550: #f66200;
}
`);

  assert.equal(run("-s", path, "#fc6204").stdout, "orange-500\n");
});

test("a number between two shades is free when the middle one is taken", () => {
  const path = stylesheet(`@theme {
  --color-red-550: #d64242;
}
`);

  assert.equal(run("-s", path, "#c73c3c").stdout, "new red-650 #c73c3c\n");
  assert.equal(run("-s", path, "#e84a4a").stdout, "new red-525 #e84a4a\n");
});

test("-w writes the proposed shade into the stylesheet under its note", () => {
  const path = stylesheet();

  const first = run("-s", path, "-w", "Holo's red title bar", "#d64242");
  assert.equal(first.status, 0);
  assert.equal(first.stdout, "new red-550 #d64242\n");
  assert.equal(
    readFileSync(path, "utf8"),
    `/* Holo's colours that Tailwind's palette lacks, as new shades of its families.
   tools/tw-color proposes and writes them. */
@theme {
  /* Holo's red title bar */
  --color-red-550: #d64242;
}
`,
  );

  run("-s", path, "--write", "Holo's darkred title bar", "#c73c3c");
  assert.deepEqual(
    parseShades(readFileSync(path, "utf8")).map((shade) => shade.name),
    ["red-550", "red-650"],
  );
  assert.equal(run("-s", path, "#c73c3c").stdout, "red-650\n");
});

test("the stylesheet of the apps holds no shade within the margin of Tailwind's palette", () => {
  const shades = parseShades(
    readFileSync(
      fileURLToPath(
        new URL("../../packages/components/src/styles/shades.css", import.meta.url),
      ),
      "utf8",
    ),
  );

  assert.ok(shades.length > 0);
  for (const shade of shades) {
    const hue = (shade.h * Math.PI) / 180;
    const lab = { L: shade.l, a: shade.c * Math.cos(hue), b: shade.c * Math.sin(hue) };
    assert.ok(nearestColor(lab).distance > 0.031, shade.name);
  }
});
