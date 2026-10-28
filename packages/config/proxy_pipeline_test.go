package config

import (
	"strings"
	"testing"
)

func TestProxyKeys(t *testing.T) {
	runKeyCases(t, []keyCase{
		{
			key:       "proxy.enabled",
			value:     func(c *Config) any { return c.Proxy.Enabled },
			def:       false,
			explicit:  `{"proxy": {"enabled": true}}`,
			want:      true,
			wrongType: `{"proxy": {"enabled": "yes"}}`,
			typeName:  "bool",
		},
		{
			key:        "proxy.trusted",
			value:      func(c *Config) any { return c.Proxy.Trusted },
			def:        []string{"127.0.0.1", "::1"},
			explicit:   `{"proxy": {"trusted": ["10.0.0.0/8"]}}`,
			want:       []string{"10.0.0.0/8"},
			wrongType:  `{"proxy": {"trusted": "10.0.0.0/8"}}`,
			typeName:   "[]string",
			outOfRange: `{"proxy": {"trusted": ["localhost"]}}`,
		},
	})
}

func TestProxyEnabledNeedsATrustedProxy(t *testing.T) {
	_, err := loadWithFile(t, `{"proxy": {"enabled": true, "trusted": []}}`)
	if err == nil {
		t.Fatal("Load() accepted proxy.enabled without trusted proxies")
	}
	for _, want := range []string{configFilename, "proxy.trusted: must list at least one proxy"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("Load() error = %q, want it to contain %q", err, want)
		}
	}
}
