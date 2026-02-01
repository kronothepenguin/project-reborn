package hhrecycler

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

const RECYCLER_CONFIGURATION = "RECYCLER_CONFIGURATION"
const RECYCLER_STATUS = "RECYCLER_STATUS"
const APPROVE_RECYCLING_RESULT = "APPROVE_RECYCLING_RESULT"
const START_RECYCLING_RESULT = "START_RECYCLING_RESULT"
const CONFIRM_RECYCLING_RESULT = "CONFIRM_RECYCLING_RESULT"

func Register(registry protocol.Registry) {
	registry.Commands().Register(RECYCLER_CONFIGURATION, 303)
	registry.Commands().Register(RECYCLER_STATUS, 304)
	registry.Commands().Register(APPROVE_RECYCLING_RESULT, 305)
	registry.Commands().Register(START_RECYCLING_RESULT, 306)
	registry.Commands().Register(CONFIRM_RECYCLING_RESULT, 307)

	registry.Listeners().Register(222, handleGET_FURNI_RECYCLER_CONFIGURATION)
	registry.Listeners().Register(223, handleGET_FURNI_RECYCLER_STATUS)
	registry.Listeners().Register(224, handleAPPROVE_RECYCLED_FURNI)
	registry.Listeners().Register(225, handleSTART_FURNI_RECYCLING)
	registry.Listeners().Register(226, handleCONFIRM_FURNI_RECYCLING)
}

func handleGET_FURNI_RECYCLER_CONFIGURATION(*protocol.Packet) error { return nil }
func handleGET_FURNI_RECYCLER_STATUS(*protocol.Packet) error        { return nil }
func handleAPPROVE_RECYCLED_FURNI(*protocol.Packet) error           { return nil }
func handleSTART_FURNI_RECYCLING(*protocol.Packet) error            { return nil }
func handleCONFIRM_FURNI_RECYCLING(*protocol.Packet) error          { return nil }
