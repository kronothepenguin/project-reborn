import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { formatMatch, nearestColor, parseColor, toOklab } from "./color.mjs";
import { palette } from "./palette.mjs";

const SCRIPT = fileURLToPath(new URL("./tw-color.mjs", import.meta.url));

function run(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
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
  const result = spawnSync(process.execPath, [SCRIPT], {
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
