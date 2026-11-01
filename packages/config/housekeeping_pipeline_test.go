package config

import "testing"

func TestHousekeepingKeys(t *testing.T) {
	runKeyCases(t, []keyCase{{
		key:        "housekeeping.host",
		value:      func(c *Config) any { return c.Housekeeping.Host },
		def:        "localhost",
		explicit:   `{"housekeeping": {"host": "0.0.0.0"}}`,
		want:       "0.0.0.0",
		wrongType:  `{"housekeeping": {"host": 1}}`,
		typeName:   "string",
		outOfRange: `{"housekeeping": {"host": "http://localhost"}}`,
	}, {
		key:        "housekeeping.port",
		value:      func(c *Config) any { return c.Housekeeping.Port },
		def:        18465,
		explicit:   `{"housekeeping": {"port": 8080}}`,
		want:       8080,
		wrongType:  `{"housekeeping": {"port": "8080"}}`,
		typeName:   "int",
		outOfRange: `{"housekeeping": {"port": 70000}}`,
	}})
}
