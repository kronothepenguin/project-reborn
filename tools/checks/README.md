# checks

The checks of the monorepo's projects.

- `make/check.mk`, at the repository root, is the shared recipe: a project's `Makefile` includes it and gets
  `make check`. Its tests live here, in `check_test.go`.
- `cmd/dependants` prints the projects that use a project, directly or through another.

## Usage

From the repository root:

```sh
make dependants project=packages/store
```

In a project whose `Makefile` includes the recipe:

```sh
make check
```

## Tests

```sh
cd tools/checks && make check
```

How it works: `knowledge/index.md`.
