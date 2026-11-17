package auth

import (
	"fmt"
	"net/http"
	"net/netip"
	"slices"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/config/proxy"
)

// RealIP fixes the request when p is enabled and the request comes from a
// trusted proxy: r.RemoteAddr becomes the client's address, from
// X-Forwarded-For, and r.Host and r.URL.Scheme become the host and scheme the
// proxy forwards in X-Forwarded-Host and X-Forwarded-Proto. Throttling, bans
// and every handler after it see the client instead of the proxy. A request
// from another address, or with p disabled, keeps its own.
func RealIP(p proxy.Proxy) (func(http.Handler) http.Handler, error) {
	if !p.Enabled {
		return func(next http.Handler) http.Handler { return next }, nil
	}
	trusted := make([]netip.Prefix, 0, len(p.Trusted))
	for _, value := range p.Trusted {
		prefix, err := proxy.ParseTrusted(value)
		if err != nil {
			return nil, fmt.Errorf("auth: proxy.trusted: %w", err)
		}
		trusted = append(trusted, prefix)
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if fromTrusted(r, trusted) {
				// Clone copies the request and its URL, which a handler must not modify.
				r = r.Clone(r.Context())
				if client, ok := forwardedClient(r, trusted); ok {
					r.RemoteAddr = client.String()
				}
				if host := lastForwarded(r, "X-Forwarded-Host"); host != "" {
					r.Host = host
				}
				if scheme := lastForwarded(r, "X-Forwarded-Proto"); scheme == "http" || scheme == "https" {
					r.URL.Scheme = scheme
				}
			}
			next.ServeHTTP(w, r)
		})
	}, nil
}

// fromTrusted reports whether the connection's peer is a trusted proxy.
func fromTrusted(r *http.Request, trusted []netip.Prefix) bool {
	peer, err := netip.ParseAddrPort(r.RemoteAddr)
	return err == nil && isTrusted(peer.Addr().Unmap(), trusted)
}

// lastForwarded is the right-most entry of a forwarding header: the value the
// trusted proxy itself wrote.
func lastForwarded(r *http.Request, name string) string {
	values := strings.Split(strings.Join(r.Header.Values(name), ","), ",")
	return strings.TrimSpace(values[len(values)-1])
}

// forwardedClient reads X-Forwarded-For from the right and skips trusted
// proxies: every entry further left was written by the client and can be
// forged. The peer is a trusted proxy.
func forwardedClient(r *http.Request, trusted []netip.Prefix) (netip.Addr, bool) {
	hops := strings.Split(strings.Join(r.Header.Values("X-Forwarded-For"), ","), ",")
	for i := len(hops) - 1; i >= 0; i-- {
		addr, err := netip.ParseAddr(strings.TrimSpace(hops[i]))
		if err != nil {
			return netip.Addr{}, false
		}
		if addr = addr.Unmap(); !isTrusted(addr, trusted) {
			return addr, true
		}
	}
	return netip.Addr{}, false
}

func isTrusted(addr netip.Addr, trusted []netip.Prefix) bool {
	return slices.ContainsFunc(trusted, func(prefix netip.Prefix) bool { return prefix.Contains(addr) })
}
