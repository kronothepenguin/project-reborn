package hhpoll

import "github.com/kronothepenguin/project-reborn/internal/app/habbo/protocol"

const POLL_OFFER = "POLL_OFFER"
const POLL_CONTENTS = "POLL_CONTENTS"
const POLL_ERROR = "POLL_ERROR"

func Register(registry protocol.Registry) {
	registry.Commands().Register(POLL_OFFER, 316)
	registry.Commands().Register(POLL_CONTENTS, 317)
	registry.Commands().Register(POLL_ERROR, 318)

	registry.Listeners().Register(234, handlePOLL_START)
	registry.Listeners().Register(235, handlePOLL_REJECT)
	registry.Listeners().Register(236, handlePOLL_ANSWER)
}

func handlePOLL_START(*protocol.Packet) error  { return nil }
func handlePOLL_REJECT(*protocol.Packet) error { return nil }
func handlePOLL_ANSWER(*protocol.Packet) error { return nil }
