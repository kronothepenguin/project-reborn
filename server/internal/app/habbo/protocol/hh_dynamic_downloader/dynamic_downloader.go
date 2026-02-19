package hhdynamicdownloader

import "github.com/kronothepenguin/project-reborn/internal/app/habbo/protocol"

const FURNI_REVISIONS = "FURNI_REVISIONS"
const ALIAS_LIST = "ALIAS_LIST"

func Register(registry protocol.Registry) {
	registry.Commands().Register(FURNI_REVISIONS, 295)
	registry.Commands().Register(ALIAS_LIST, 297)

	registry.Listeners().Register(213, handleGET_FURNI_REVISIONS)
	registry.Listeners().Register(215, handleGET_ALIAS_LIST)
}

func handleGET_FURNI_REVISIONS(*protocol.Packet) error { return nil }
func handleGET_ALIAS_LIST(*protocol.Packet) error      { return nil }
