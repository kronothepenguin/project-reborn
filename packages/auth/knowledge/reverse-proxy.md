---
type: Reference
title: Behind a reverse proxy
description: How RealIP takes the client's address, host and scheme from the forwarding headers of trusted proxies.
---

# Behind a reverse proxy

`RealIP(cfg.Proxy)` returns a middleware that an app puts in front of its routes, outside `Sessions`, and an error
for an entry of `proxy.trusted` it cannot parse. With
`proxy.enabled` in `config.json`, a request whose connection comes from an address or range in `proxy.trusted` gets the
client's address as its `RemoteAddr`, taken from `X-Forwarded-For`: read from the right, skipping trusted proxies,
because entries further left come from the client and can be forged. Such a request also gets the host and scheme the
proxy forwards: `r.Host` from `X-Forwarded-Host` and `r.URL.Scheme` from `X-Forwarded-Proto` (`http` or `https`),
each from its right-most entry, the one the trusted proxy wrote. Any other request keeps its own address, host and
scheme, and with `proxy.enabled` false nothing changes.
`RealIP` clones the request, its URL included, before it changes it.

# Gotchas

- `ClientIP(r)` is the connection's address, so it needs `RealIP` in front of it behind a reverse proxy.
- Behind a reverse proxy without `RealIP`, or with `proxy.enabled` false, every request has the proxy's IP, so IP
  throttling and IP bans would hit everyone.
