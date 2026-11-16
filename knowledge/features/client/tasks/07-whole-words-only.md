---
type: Task
title: Write the hotel's name for the word Habbo only
description: dcr.Texts writes the hotel's short name for "Habbo", "Habbos" and "Habbo's", and leaves a longer word that starts with it as it is.
scope: [packages/assets]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

The texts match the pictures that carry Habbo's coined names ([Plan](/features/client/plan.md)). The behaviour of the
spec:

- The client asks for `/dcr/external_texts.txt`: it gets the stored texts, with the word "Habbo", its plural and its
  possessive written as the hotel's short name; a longer word that starts with it, such as "Habboween", stays.

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `packages/assets/knowledge/dcr.md`: `Texts` replaces every "Habbo" today.
- On the user's real texts (`assets/dcr/external_texts.txt` in the main checkout, read only), the first rule gave
  "Rebornween", "Rebornwood", "Rebornwealth", "Rebornlympic", "Rebornrella", "Rebornvision", "Rebornlus" and
  "Reborn-punk".

# Steps

- [ ] `dcr.Texts` writes the short name for "Habbo" where it stands as a word: alone, as "Habbos" and as "Habbo's",
  and before a hyphen or punctuation. A letter right after it, other than the plural's "s", keeps the word as it is.
- [ ] The test of the behaviour covers both sides. Say in the report how many of the 5,518 real texts change now, and
  list the words that keep "Habbo".
- [ ] Update `packages/assets/knowledge/dcr.md`.

# Checks

```sh
make -C packages/assets check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/assets`.
