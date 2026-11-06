package config

import (
	"strings"
	"testing"
)

func TestServerKeys(t *testing.T) {
	runKeyCases(t, []keyCase{{
		key:        "server.info.host",
		value:      func(c *Config) any { return c.Server.Info.Host },
		def:        "localhost",
		explicit:   `{"server": {"info": {"host": "0.0.0.0"}}}`,
		want:       "0.0.0.0",
		wrongType:  `{"server": {"info": {"host": 1}}}`,
		typeName:   "string",
		outOfRange: `{"server": {"info": {"host": "ws://localhost"}}}`,
	}, {
		key:        "server.info.port",
		value:      func(c *Config) any { return c.Server.Info.Port },
		def:        30000,
		explicit:   `{"server": {"info": {"port": 31000}}}`,
		want:       31000,
		wrongType:  `{"server": {"info": {"port": "31000"}}}`,
		typeName:   "int",
		outOfRange: `{"server": {"info": {"port": 70000}}}`,
	}, {
		key:        "server.mus.host",
		value:      func(c *Config) any { return c.Server.MUS.Host },
		def:        "localhost",
		explicit:   `{"server": {"mus": {"host": "game.example.com"}}}`,
		want:       "game.example.com",
		wrongType:  `{"server": {"mus": {"host": true}}}`,
		typeName:   "string",
		outOfRange: `{"server": {"mus": {"host": "localhost:30001"}}}`,
	}, {
		key:        "server.mus.port",
		value:      func(c *Config) any { return c.Server.MUS.Port },
		def:        30001,
		explicit:   `{"server": {"mus": {"port": 31001}}}`,
		want:       31001,
		wrongType:  `{"server": {"mus": {"port": [30001]}}}`,
		typeName:   "int",
		outOfRange: `{"server": {"mus": {"port": 0}}}`,
	}})
}

func TestServerRefusesInfoAndMUSOnOnePort(t *testing.T) {
	for _, content := range []string{
		`{"server": {"mus": {"port": 30000}}}`,
		`{"server": {"info": {"host": "127.0.0.1", "port": 31000}, "mus": {"host": "0.0.0.0", "port": 31000}}}`,
	} {
		_, err := loadWithFile(t, content)
		if err == nil {
			t.Fatalf("Load(%s) error = nil, want the ports refused", content)
		}
		for _, want := range []string{Filename, "server.mus.port: must differ from info.port"} {
			if !strings.Contains(err.Error(), want) {
				t.Errorf("Load(%s) error = %q, want it to contain %q", content, err, want)
			}
		}
	}
}
