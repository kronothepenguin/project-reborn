package config

import "testing"

func TestCMSKeys(t *testing.T) {
	runKeyCases(t, []keyCase{{
		key:        "cms.host",
		value:      func(c *Config) any { return c.CMS.Host },
		def:        "localhost",
		explicit:   `{"cms": {"host": "0.0.0.0"}}`,
		want:       "0.0.0.0",
		wrongType:  `{"cms": {"host": 1}}`,
		typeName:   "string",
		outOfRange: `{"cms": {"host": "http://localhost"}}`,
	}, {
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
