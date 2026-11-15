package config

import "testing"

func TestRebornKeys(t *testing.T) {
	runKeyCases(t, []keyCase{{
		key:        "reborn.host",
		value:      func(c *Config) any { return c.Reborn.Host },
		def:        "localhost",
		explicit:   `{"reborn": {"host": "0.0.0.0"}}`,
		want:       "0.0.0.0",
		wrongType:  `{"reborn": {"host": 1}}`,
		typeName:   "string",
		outOfRange: `{"reborn": {"host": "http://localhost"}}`,
	}, {
		key:        "reborn.port",
		value:      func(c *Config) any { return c.Reborn.Port },
		def:        16416,
		explicit:   `{"reborn": {"port": 8080}}`,
		want:       8080,
		wrongType:  `{"reborn": {"port": "8080"}}`,
		typeName:   "int",
		outOfRange: `{"reborn": {"port": 70000}}`,
	}})
}
