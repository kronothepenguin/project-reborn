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

## Accepted input

- `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`
- `rgb(r, g, b)` and `rgba(r, g, b, a)` with channels 0-255 and alpha 0-1

Blank lines are ignored. Alpha below 1 is rounded to a whole percentage and
printed as a Tailwind opacity modifier (`black/50`); alpha is ignored when
matching.

## Matching

Colors are converted from sRGB to OKLCH and matched by Euclidean distance in
OKLab, so the result is the perceptually closest swatch. The distance shown by
`-d` is that Euclidean distance (ΔE OKLab, rounded to 4 decimals). Because the
match is purely nearest, grays can land on any of Tailwind's neutral families,
e.g. `#1f1f1f` becomes `olive-900`.

The palette is the Tailwind CSS v4 palette from
https://tailwindcss.com/docs/colors: 26 families with 11 shades each, plus
`black` and `white`.

## Errors and exit codes

| Condition        | Behavior                                          |
| ---------------- | ------------------------------------------------- |
| Invalid color    | warning on stderr, processing continues, exit `1` |
| Unknown option   | usage on stderr, exit `2`                         |
| Stdin unreadable | error on stderr, exit `2`                         |
| All inputs valid | exit `0`                                          |

## Tests

```sh
node --test "tools/tw-color/**/*.test.mjs"
```
