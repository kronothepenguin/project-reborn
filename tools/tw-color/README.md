# tw-color

Maps legacy CSS colors to the closest color in the Tailwind CSS v4 palette.

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

```sh
node --test "tools/tw-color/**/*.test.mjs"
```

How it works: `knowledge/index.md`.
