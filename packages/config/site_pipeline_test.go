package config

import "testing"

func TestSiteKeys(t *testing.T) {
	runKeyCases(t, []keyCase{
		{
			key:        "site.name",
			value:      func(c *Config) any { return c.Site.Name },
			def:        "Holo Hotel",
			explicit:   `{"site": {"name": "Reborn Hotel"}}`,
			want:       "Reborn Hotel",
			wrongType:  `{"site": {"name": 1}}`,
			typeName:   "string",
			outOfRange: `{"site": {"name": ""}}`,
		},
		{
			key:        "site.shortName",
			value:      func(c *Config) any { return c.Site.ShortName },
			def:        "Holo",
			explicit:   `{"site": {"shortName": "Reborn"}}`,
			want:       "Reborn",
			wrongType:  `{"site": {"shortName": false}}`,
			typeName:   "string",
			outOfRange: `{"site": {"shortName": "a name that is far longer than thirty characters"}}`,
		},
		{
			key:        "site.url",
			value:      func(c *Config) any { return c.Site.URL },
			def:        "http://localhost:17387",
			explicit:   `{"site": {"url": "https://hotel.example.com"}}`,
			want:       "https://hotel.example.com",
			wrongType:  `{"site": {"url": 17387}}`,
			typeName:   "string",
			outOfRange: `{"site": {"url": "https://hotel.example.com/"}}`,
		},
		{
			key:       "site.maintenance",
			value:     func(c *Config) any { return c.Site.Maintenance },
			def:       false,
			explicit:  `{"site": {"maintenance": true}}`,
			want:      true,
			wrongType: `{"site": {"maintenance": 1}}`,
			typeName:  "bool",
		},
	})
}
