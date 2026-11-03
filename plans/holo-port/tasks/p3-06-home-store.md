---
type: Task
title: Sell home items
description: The store and the inventory answer as JSON, and a purchase takes credits, writes the ledger and fills the inventory in one transaction.
status: todo
phase: p3
depends_on: [p3-02]
packages: [packages/cms, packages/store]
holo: [source/holo/store.php]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

Habbos buy stickers, backgrounds and notes as in Holo's webstore.

# Steps

- [ ] `GET /home-store`, `GET /home-store/categories/{id}`, `GET /me/inventory`.
- [ ] `POST /home-store/items/{id}/purchase`, guarded at zero, with a `store` ledger row.
- [ ] A background is bought once ([0064](/decisions/0064-backgrounds-are-unlocks.md)).
- [ ] The staff category takes `homes.staffItems`, and disabled items are not sold.
- [ ] Holo's texts for every answer.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
