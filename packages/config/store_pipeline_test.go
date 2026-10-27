package config

import "testing"

func TestStoreKeys(t *testing.T) {
	runKeyCases(t, []keyCase{{
		key:        "store.path",
		value:      func(c *Config) any { return c.Store.Path },
		def:        "habbo.db",
		explicit:   `{"store": {"path": "data/reborn.db"}}`,
		want:       "data/reborn.db",
		wrongType:  `{"store": {"path": 7}}`,
		typeName:   "string",
		outOfRange: `{"store": {"path": "habbo.db?mode=ro"}}`,
	}})
}
