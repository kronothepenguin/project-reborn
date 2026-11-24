# tw-color

Maps legacy CSS colors to the closest color in the Tailwind CSS v4 palette. A color beyond a margin of distance gets a
new shade of the palette instead, kept in `packages/components/src/styles/shades.css`.

## Usage

Pass colors as arguments:

```sh
node tools/tw-color/tw-color.mjs "#ffb86a" "#c10007"
```

```text
orange-300
red-700
```

Add `-d` (or `--distance`) to show the OKLab distance to the match:

```sh
node tools/tw-color/tw-color.mjs -d "#ffb86a"
```

```text
orange-300 0.0046
```

A color farther than the margin, an OKLab distance of 0.031, from every Tailwind class takes the closest new shade of
the stylesheet. Farther than the margin from those too, it gets a proposed shade: the family of its nearest hue, a
number between that family's lighter and darker neighbours, and its own hex. With `-d`, the closest class and its
distance follow in brackets:

```sh
node tools/tw-color/tw-color.mjs -d "#d64242" "#c73c3c"
```

```text
red-550 0
red-650 0
```

```sh
node tools/tw-color/tw-color.mjs -d "#e69f06"
```

```text
new yellow-525 #e69f06 (amber-550 0.0312)
```

`-m` (or `--margin`) sets another margin:

```sh
node tools/tw-color/tw-color.mjs -m 0.05 "#e69f06"
```

```text
amber-500
```

`-w` (or `--write`) writes each proposed shade into the stylesheet, under a comment that names its use. From then on
the color is found by its class, `bg-yellow-525` in every app:

```sh
node tools/tw-color/tw-color.mjs -w "Holo's menu link hover" "#e69f06"
```

```text
new yellow-525 #e69f06
```

`-s` (or `--shades`) reads and writes another stylesheet.

Without colors, one color per line is read from stdin:

```sh
printf '#c10007\nrgba(0, 0, 0, 0.5)\n' | node tools/tw-color/tw-color.mjs
```

```text
red-700
black/50
```

Quote colors that start with `#`, otherwise the shell may treat them as a
comment. The make target only supports stdin:

```sh
printf '#c10007\n' | make tw-color
```

## Tests

From `tools/tw-color`; it runs the `test` script of `package.json`, `node --test`:

```sh
make check
```

How it works: `knowledge/index.md`.
