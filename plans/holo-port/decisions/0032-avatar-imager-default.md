---
type: Decision
title: imaging.avatarUrl defaults to the habbo.com imager
description: The imaging.avatarUrl setting defaults to https://www.habbo.com/habbo-imaging/avatarimage, an external imager that accepts dot-format figures and can be replaced at any time.
status: accepted
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
tags: [settings, components]
---

# Decision

`imaging.avatarUrl` is a setting whose default is `https://www.habbo.com/habbo-imaging/avatarimage`.

# Context

[0008](/decisions/0008-configurable-avatar-imaging.md) starts with an external imager without naming one. On
2026-10-30 this URL answered 200 with a PNG for a dot-format figure. The user chose it over an empty default, which
would show no avatars until an admin set the URL.

# Consequences

- The site depends on Sulake's service until the setting changes, and that service can change or block hotlinking.
