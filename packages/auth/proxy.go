package auth

import (
	"fmt"
	"net/http"
	"net/netip"
	"slices"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/config/proxy"
)

// RealIP sets r.RemoteAddr to the client's address when p is enabled and the
// request comes from a trusted proxy, so throttling, bans and every handler
// after it see the client instead of the proxy. Disabled, it changes nothing.
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
			if client, ok := forwardedClient(r, trusted); ok {
				// WithContext copies the request, which a handler must not modify.
				r = r.WithContext(r.Context())
				r.RemoteAddr = client.String()
			}
			next.ServeHTTP(w, r)
		})
	}, nil
}

// forwardedClient reads X-Forwarded-For from the right and skips trusted
// proxies: every entry further left was written by the client and can be
// forged.
func forwardedClient(r *http.Request, trusted []netip.Prefix) (netip.Addr, bool) {
	peer, err := netip.ParseAddrPort(r.RemoteAddr)
	if err != nil || !isTrusted(peer.Addr().Unmap(), trusted) {
		return netip.Addr{}, false
	}
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
