package config

import "testing"

func TestAssetsKeys(t *testing.T) {
	runKeyCases(t, []keyCase{{
		key:        "assets.path",
		value:      func(c *Config) any { return c.Assets.Path },
		def:        "assets",
		explicit:   `{"assets": {"path": "/srv/hotel/assets"}}`,
		want:       "/srv/hotel/assets",
		wrongType:  `{"assets": {"path": 7}}`,
		typeName:   "string",
		outOfRange: `{"assets": {"path": ""}}`,
	}})
}
