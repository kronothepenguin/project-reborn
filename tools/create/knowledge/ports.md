---
type: Reference
title: Ports
description: How tools/create derives the ports of a new project's servers from its name.
resource: tools/create/cmd/create/ports.go
---

# Derivation

Each port is a range base plus the 32-bit FNV-1a hash of a prefixed name, modulo 10000 (decision server/0017).

| Port | Kind | Range | Derived as |
| --- | --- | --- | --- |
| App | `fullstack`, `backend` | 10000 to 19999 | `10000 + fnv32a("app:" + name) % 10000` |
| Astro | `fullstack` | 20000 to 29999 | `20000 + fnv32a("astro:" + name) % 10000` |
| Vite | `client` | 30000 to 39999 | `30000 + fnv32a("vite:" + name) % 10000` |

`-app-port` and `-astro-port` replace the derived app and Astro ports. A client named `client-r18` gets the Vite port
30050.
