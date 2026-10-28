---
type: Task
title: Take the client IP from trusted proxies
description: Add the proxy section to packages/config and the auth.RealIP middleware, which reads X-Forwarded-For only from trusted proxies when enabled.
status: done
phase: p0
depends_on: [p0-09]
packages: [packages/config, packages/auth]
holo: []
timestamp: 2026-10-28T01:54:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:49:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:54:31+00:00"}
---

# Goal

Implement [0028](/decisions/0028-trusted-proxies-in-config.md).

# Steps

- [x] `packages/config/proxy`: `enabled` and `trusted` with defaults, validators, unit tests and the pipeline tests;
      `Config` registers the section.
- [x] `auth.RealIP(p proxy.Proxy)`, with tests for spoofed headers, proxy chains and a login throttled per client
      behind one proxy.
- [x] Code that compares whole `config.Config` values uses `reflect.DeepEqual`, since the section holds a slice; the
      installer writes the proxy defaults.
- [x] Docs: `packages/config/README.md` and `packages/auth/README.md`.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./...
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/installer && gofmt -l . && go vet ./... && go test ./... -race
```

Results (2026-10-28T01:54:31+00:00):

- `packages/config`: 51 test results pass. Both new keys run all pipeline checks, `proxy.enabled` without its
  out-of-range check since it is a bool. A separate test covers `enabled` with an empty `trusted`.
- `packages/auth` with `-race`: 41 test results pass, 3 of them new.
  - `TestRealIP` covers nine cases: disabled, a trusted proxy, a header from an untrusted peer, a forged left end of
    the chain, several headers, only proxies, no header, a malformed entry and an IPv6 proxy.
  - A login test shows that two clients behind one proxy are throttled separately and that attempts record the
    client's address.
- `packages/virtual` (26 results) and `packages/installer` (10 results) pass with `-race`.
- `go vet` passes in `packages/store`, `apps/installer` and `tools/create`.
- Mutation checks: each of these, applied on purpose, failed `TestRealIP`:
  - trusting the header from any peer;
  - reading the chain from the left;
  - not skipping trusted proxies.

# Notes

Choices:

- `trusted` takes addresses and CIDR ranges, because a pod's proxy address changes within a network range. The
  default list, `127.0.0.1` and `::1`, is a proxy on the same machine.
- `proxy.ParseTrusted` is exported so that the validator and `auth.RealIP` read entries the same way.
- `RealIP` copies the request before changing `RemoteAddr`, since a handler must not modify its request.
  `RemoteAddr` then holds the bare client address without a port, and `auth`'s `clientIP` accepts both forms.

Changes the slice forced:

- `Config` now holds a slice, so whole-`Config` comparisons in tests use `reflect.DeepEqual`. This touched the config
  pipeline helper, `config_test.go`, `create_test.go` and the installer's setup test.
- In `packages/virtual`, the tests count the config keys from `dump` and compare the values map with
  `reflect.DeepEqual`.
- The installer writes the proxy defaults (disabled) into `config.json`; production enables the proxy by editing that
  file.

Follow-up and findings:

- [p0-11](/tasks/p0-11-cms-wiring.md) step 6 now wraps the CMS handler in `auth.RealIP(cfg.Proxy)`.
- Found, not changed: `apps/cms/cmd/*/main.go`, and the generator's `main.go` templates they came from, end without a
  newline, so `gofmt -l` lists them. p0-11 rewrites the CMS runners.
