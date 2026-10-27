package config

import "testing"

func TestCMSKeys(t *testing.T) {
	runKeyCases(t, []keyCase{{
		key:        "cms.port",
		value:      func(c *Config) any { return c.CMS.Port },
		def:        17387,
		explicit:   `{"cms": {"port": 8080}}`,
		want:       8080,
		wrongType:  `{"cms": {"port": "8080"}}`,
		typeName:   "int",
		outOfRange: `{"cms": {"port": 70000}}`,
	}})
}
