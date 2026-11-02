---
type: Decision
title: The art lives in the repository
description: The home art and user badges are committed under packages/cms/public and embedded in the CMS binary, and P3 Homes returns to the phase order.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [homes, assets]
---

# Decision

- Stickers, backgrounds, user badges and the missing widget skins are committed under `packages/cms/public/c_images/`,
  with Holo's folder names, and the CMS binary embeds them.
- They are fetched once. There is no download step, no `assets.zip` and no setting for their location.
- [P3 Homes](/phases/p3-homes.md) returns to the phase order, after [HK-B](/phases/hk-b-users-moderation.md).

# Context

Supersedes [0045](/decisions/0045-homes-deferred.md). `https://images.habbo.com/c_images/` still serves 419 of the 425
stickers and 101 of the 111 backgrounds. The archives on h4bbo.net hold 5 more, the 12 missing widget skins and 507 user
badges. Six of the 11 names left have no file extension in Holo's own CSS. The user answered: "better get the new art
into the repo, we can do `git rm` later, does that remove the history?" and, told that it does not, "now that we are not
downloading it, the new art becomes embed into go's binary".

# Consequences

- The repository is public, so the art stays in its history for good, as `packages/client-r26` already does.
- The CMS binary grows by under 10 MB.
