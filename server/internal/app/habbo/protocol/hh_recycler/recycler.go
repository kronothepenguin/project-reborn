package hhrecycler

import (
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/app/habbo/protocol"
)

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

func handleGET_FURNI_RECYCLER_CONFIGURATION(packet *protocol.Packet) error {
	serviceEnabled := 0
	quarantineMinutes := 0
	recyclingMinutes := 0
	minutesToTimeout := 0
	numOfRewardItems := 0

	// TODO: reward items

	packet.Context.Logger().Debug(
		"handleGET_FURNI_RECYCLER_CONFIGURATION",
		slog.Int("serviceEnabled", serviceEnabled),
		slog.Int("quarantineMinutes", quarantineMinutes),
		slog.Int("recyclingMinutes", recyclingMinutes),
		slog.Int("minutesToTimeout", minutesToTimeout),
		slog.Int("numOfRewardItems", numOfRewardItems),
	)

	return packet.Context.Send(RECYCLER_CONFIGURATION,
		protocol.Int(serviceEnabled),
		protocol.Int(quarantineMinutes),
		protocol.Int(recyclingMinutes),
		protocol.Int(minutesToTimeout),
		protocol.Int(numOfRewardItems))
}

func handleGET_FURNI_RECYCLER_STATUS(packet *protocol.Packet) error {
	status := 0 // 0 - open, 1 - progress, 2 - ready, 3 - timeout

	packet.Context.Logger().Debug(
		"handleGET_FURNI_RECYCLER_STATUS",
		slog.Int("status", status),
	)

	return packet.Context.Send(RECYCLER_STATUS,
		protocol.Int(status))
}

func handleAPPROVE_RECYCLED_FURNI(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleAPPROVE_RECYCLED_FURNI")
	return nil
}

func handleSTART_FURNI_RECYCLING(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSTART_FURNI_RECYCLING")
	return nil
}

func handleCONFIRM_FURNI_RECYCLING(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleCONFIRM_FURNI_RECYCLING")
	return nil
}
