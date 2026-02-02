package hhig

import (
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

const DIRECTORY_STATUS = "DIRECTORY_STATUS"
const ENTER_ARENA_FAILED = "ENTER_ARENA_FAILED"
const GAME_REJOIN = "GAME_REJOIN"
const PLAYER_EXITED_GAME_ARENA = "PLAYER_EXITED_GAME_ARENA"
const LEVEL_HALL_OF_FAME = "LEVEL_HALL_OF_FAME"
const START_FAILED = "START_FAILED"
const JOIN_FAILED = "JOIN_FAILED"
const IN_ARENA_QUEUE = "IN_ARENA_QUEUE"
const STAGE_STILL_LOADING = "STAGE_STILL_LOADING"
const GAME_NOT_FOUND = "GAME_NOT_FOUND"
const GAME_CHAT = "GAME_CHAT"
const ENTER_ARENA = "ENTER_ARENA"
const ARENA_ENTERED = "ARENA_ENTERED"
const LOAD_STAGE = "LOAD_STAGE"
const STAGE_STARTING = "STAGE_STARTING"
const STAGE_RUNNING = "STAGE_RUNNING"
const STAGE_ENDING = "STAGE_ENDING"
const GAME_ENDING = "GAME_ENDING"
const GAME_CREATED = "GAME_CREATED"
const GAME_LONG_DATA = "GAME_LONG_DATA"
const CREATE_GAME_INFO = "CREATE_GAME_INFO"
const GAME_LIST = "GAME_LIST"
const USER_JOINED_GAME = "USER_JOINED_GAME"
const USER_LEFT_GAME = "USER_LEFT_GAME"
const GAME_OBSERVATION_STARTED_SHORT = "GAME_OBSERVATION_STARTED_SHORT"
const GAME_CANCELLED = "GAME_CANCELLED"
const GAME_LONG_DATA_2 = "GAME_LONG_DATA_2"
const GAME_STARTED = "GAME_STARTED"

func Register(registry protocol.Registry) {
	registry.Commands().Register(DIRECTORY_STATUS, 387)
	registry.Commands().Register(ENTER_ARENA_FAILED, 388)
	registry.Commands().Register(GAME_REJOIN, 389)
	registry.Commands().Register(PLAYER_EXITED_GAME_ARENA, 390)
	registry.Commands().Register(LEVEL_HALL_OF_FAME, 391)
	registry.Commands().Register(START_FAILED, 392)
	registry.Commands().Register(JOIN_FAILED, 393)
	registry.Commands().Register(IN_ARENA_QUEUE, 394)
	registry.Commands().Register(STAGE_STILL_LOADING, 395)
	registry.Commands().Register(GAME_NOT_FOUND, 396)
	registry.Commands().Register(GAME_CHAT, 399)
	registry.Commands().Register(ENTER_ARENA, 400)
	registry.Commands().Register(ARENA_ENTERED, 401)
	registry.Commands().Register(LOAD_STAGE, 402)
	registry.Commands().Register(STAGE_STARTING, 403)
	registry.Commands().Register(STAGE_RUNNING, 404)
	registry.Commands().Register(STAGE_ENDING, 405)
	registry.Commands().Register(GAME_ENDING, 406)
	registry.Commands().Register(GAME_CREATED, 407)
	registry.Commands().Register(GAME_LONG_DATA, 408)
	registry.Commands().Register(CREATE_GAME_INFO, 409)
	registry.Commands().Register(GAME_LIST, 410)
	registry.Commands().Register(USER_JOINED_GAME, 413)
	registry.Commands().Register(USER_LEFT_GAME, 414)
	registry.Commands().Register(GAME_OBSERVATION_STARTED_SHORT, 415)
	registry.Commands().Register(GAME_CANCELLED, 416)
	registry.Commands().Register(GAME_LONG_DATA_2, 417)
	registry.Commands().Register(GAME_STARTED, 418)

	registry.Listeners().Register(288, handleIGCheckDirectoryStatus)
	registry.Listeners().Register(289, handleIGRoomGameStatus)
	registry.Listeners().Register(290, handleIGPlayAgain)
	registry.Listeners().Register(298, handleGameChat)
	registry.Listeners().Register(300, handleIGCreateGame)
	registry.Listeners().Register(301, handleIGGetGameList)
	registry.Listeners().Register(302, handleIGGetCreateGameInfo)
	registry.Listeners().Register(303, handleIGChangeParameters)
	registry.Listeners().Register(304, handleIGListPossibleInvites)
	registry.Listeners().Register(305, handleIGInviteUser)
	registry.Listeners().Register(306, handleIGKickUser)
	registry.Listeners().Register(307, handleIGStartGame)
	registry.Listeners().Register(308, handleIGCancelGame)
	registry.Listeners().Register(309, handleIGJoinGame)
	registry.Listeners().Register(310, handleIGLeaveGame)
	registry.Listeners().Register(311, handleIGStartObservingGame)
	registry.Listeners().Register(312, handleIGStopObservingGame)
	registry.Listeners().Register(291, handleIGGetLevelHallOfFame)
	registry.Listeners().Register(292, handleIGAcceptInviteRequest)
	registry.Listeners().Register(293, handleIGDeclineInviteRequest)
	registry.Listeners().Register(295, handleIGLoadStageReady)
	registry.Listeners().Register(296, handleMSGPlayerInput)
	registry.Listeners().Register(299, handleIGExitGame)
}

func handleIGCheckDirectoryStatus(packet *protocol.Packet) error {
	code := 0

	packet.Context.Logger().Debug(
		"handleIGCheckDirectoryStatus",
		slog.Int("code", code),
	)

	return packet.Context.Send(DIRECTORY_STATUS)
}

func handleIGRoomGameStatus(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGRoomGameStatus")
	return nil
}

func handleIGPlayAgain(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGPlayAgain")
	return nil
}

func handleGameChat(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGameChat")
	return nil
}

func handleIGCreateGame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGCreateGame")
	return nil
}

func handleIGGetGameList(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGGetGameList")
	return nil
}

func handleIGGetCreateGameInfo(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGGetCreateGameInfo")
	return nil
}

func handleIGChangeParameters(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGChangeParameters")
	return nil
}

func handleIGListPossibleInvites(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGListPossibleInvites")
	return nil
}

func handleIGInviteUser(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGInviteUser")
	return nil
}

func handleIGKickUser(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGKickUser")
	return nil
}

func handleIGStartGame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGStartGame")
	return nil
}

func handleIGCancelGame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGCancelGame")
	return nil
}

func handleIGJoinGame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGJoinGame")
	return nil
}

func handleIGLeaveGame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGLeaveGame")
	return nil
}

func handleIGStartObservingGame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGStartObservingGame")
	return nil
}

func handleIGStopObservingGame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGStopObservingGame")
	return nil
}

func handleIGGetLevelHallOfFame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGGetLevelHallOfFame")
	return nil
}

func handleIGAcceptInviteRequest(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGAcceptInviteRequest")
	return nil
}

func handleIGDeclineInviteRequest(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGDeclineInviteRequest")
	return nil
}

func handleIGLoadStageReady(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGLoadStageReady")
	return nil
}

func handleMSGPlayerInput(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleMSGPlayerInput")
	return nil
}

func handleIGExitGame(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGExitGame")
	return nil
}
