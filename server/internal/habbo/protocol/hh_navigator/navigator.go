package hhnavigator

import (
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

const FLAT_RESULTS = "FLAT_RESULTS"
const ERROR = "ERROR"
const FLATINFO = "FLATINFO"
const FLAT_RESULTS_2 = "FLAT_RESULTS_2"
const NOFLATSFORUSER = "NOFLATSFORUSER"
const NOFLATS = "NOFLATS"
const FAVOURITEROOMRESULTS = "FAVOURITEROOMRESULTS"
const FLATPASSWORD_OK = "FLATPASSWORD_OK"
const NAVNODEINFO = "NAVNODEINFO"
const USERFLATCATS = "USERFLATCATS"
const FLATCAT = "FLATCAT"
const SPACENODEUSERS = "SPACENODEUSERS"
const CANTCONNECT = "CANTCONNECT"
const SUCCESS = "SUCCESS"
const FAILURE = "FAILURE"
const PARENTCHAIN = "PARENTCHAIN"
const ROOMFORWARD = "ROOMFORWARD"
const RECOMMENDED_ROOM_LIST = "RECOMMENDED_ROOM_LIST"

func Register(registry protocol.Registry) {
	registry.Commands().Register(FLAT_RESULTS, 16)
	registry.Commands().Register(ERROR, 33)
	registry.Commands().Register(FLATINFO, 54)
	registry.Commands().Register(FLAT_RESULTS_2, 55)
	registry.Commands().Register(NOFLATSFORUSER, 57)
	registry.Commands().Register(NOFLATS, 58)
	registry.Commands().Register(FAVOURITEROOMRESULTS, 61)
	registry.Commands().Register(FLATPASSWORD_OK, 130)
	registry.Commands().Register(NAVNODEINFO, 220)
	registry.Commands().Register(USERFLATCATS, 221)
	registry.Commands().Register(FLATCAT, 222)
	registry.Commands().Register(SPACENODEUSERS, 223)
	registry.Commands().Register(CANTCONNECT, 224)
	registry.Commands().Register(SUCCESS, 225)
	registry.Commands().Register(FAILURE, 226)
	registry.Commands().Register(PARENTCHAIN, 227)
	registry.Commands().Register(ROOMFORWARD, 286)
	registry.Commands().Register(RECOMMENDED_ROOM_LIST, 351)

	registry.Listeners().Register(13, handleSBUSYF)
	registry.Listeners().Register(16, handleSUSERF)
	registry.Listeners().Register(17, handleSRCHF)
	registry.Listeners().Register(18, handleGETFVRF)
	registry.Listeners().Register(19, handleADD_FAVORITE_ROOM)
	registry.Listeners().Register(20, handleDEL_FAVORITE_ROOM)
	registry.Listeners().Register(21, handleGETFLATINFO)
	registry.Listeners().Register(23, handleDELETEFLAT)
	registry.Listeners().Register(24, handleUPDATEFLAT)
	registry.Listeners().Register(25, handleSETFLATINFO)
	registry.Listeners().Register(150, handleNavigate)
	registry.Listeners().Register(151, handleGETUSERFLATCATS)
	registry.Listeners().Register(152, handleGETFLATCAT)
	registry.Listeners().Register(153, handleSETFLATCAT)
	registry.Listeners().Register(154, handleGETSPACENODEUSERS)
	registry.Listeners().Register(155, handleREMOVEALLRIGHTS)
	registry.Listeners().Register(156, handleGETPARENTCHAIN)
	registry.Listeners().Register(264, handleGET_RECOMMENDED_ROOMS)
}

func handleSBUSYF(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSBUSYF")
	return nil
}

func handleSUSERF(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSUSERF")
	return nil
}

func handleSRCHF(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSRCHF")
	return nil
}

func handleGETFVRF(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETFVRF")
	return nil
}

func handleADD_FAVORITE_ROOM(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleADD_FAVORITE_ROOM")
	return nil
}

func handleDEL_FAVORITE_ROOM(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleDEL_FAVORITE_ROOM")
	return nil
}

func handleGETFLATINFO(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETFLATINFO")
	return nil
}

func handleDELETEFLAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleDELETEFLAT")
	return nil
}

func handleUPDATEFLAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleUPDATEFLAT")
	return nil
}

func handleSETFLATINFO(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSETFLATINFO")
	return nil
}

func handleNavigate(packet *protocol.Packet) error {
	nodeMask, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	// 4 - private, 3 - public
	nodeId, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	depth, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleNavigate",
		slog.Int("nodeMask", nodeMask),
		slog.Int("nodeId", nodeId),
		slog.Int("depth", depth),
	)

	var nodeType int // 0 - category, 1 - public?, 2 - private
	var name string
	var userCount int
	var maxUsers int
	var parentId int
	var extra []protocol.Argument

	switch nodeId {
	case 3:
		//TODO: public
		nodeType = 0
		name = "$public_title"
		userCount = 0
		maxUsers = 25
		parentId = 0

		extra = append(extra,
			protocol.Int(100),           // nodeId
			protocol.Int(1),             // nodeType
			protocol.String("$public1"), // name
			protocol.Int(0),             // userCount
			protocol.Int(25),            // maxUsers
			protocol.Int(nodeId),        // parentId

			// nodeType == 1
			protocol.String("$unitStrId"),  // unitStrId
			protocol.Int(0),                // port
			protocol.Int(0),                // door
			protocol.String("hh_room_bar"), // casts
			protocol.Int(0),                // usersInQueue
			protocol.Bool(true),            // isVisible
		)

		extra = append(extra,
			protocol.Int(101),           // nodeId
			protocol.Int(2),             // nodeType
			protocol.String("$public2"), // name
			protocol.Int(0),             // userCount
			protocol.Int(25),            // maxUsers
			protocol.Int(nodeId),        // parentId

			// nodeType == 2
			protocol.Int(1),                 // flatCount
			protocol.Int(102),               // flatID
			protocol.String("$public2_102"), // name
			protocol.String("$owner"),       // owner
			protocol.String("$door"),        // door
			protocol.Int(0),                 // userCount
			protocol.Int(25),                // maxUsers
			protocol.String("$description"), // description
		)

		extra = append(extra,
			protocol.Int(103),           // nodeId
			protocol.Int(1),             // nodeType
			protocol.String("$public3"), // name
			protocol.Int(0),             // userCount
			protocol.Int(25),            // maxUsers
			protocol.Int(101),           // parentId

			// nodeType == 1
			protocol.String("$public3_unitStrId"),
			protocol.Int(0),                 // port
			protocol.Int(0),                 // door
			protocol.String("hh_room_pool"), // casts
			protocol.Int(0),                 // usersInQueue
			protocol.Bool(true),             // isVisible
		)

	case 4:
		//TODO: private
		nodeType = 0
		name = "$private_title"
		userCount = 0
		maxUsers = 25
		parentId = 0

		extra = append(extra,
			protocol.Int(200),            // nodeId
			protocol.Int(1),              // nodeType
			protocol.String("$private1"), // name
			protocol.Int(0),              // userCount
			protocol.Int(25),             // maxUsers
			protocol.Int(nodeId),         // parentId

			// nodeType == 1
			protocol.String("$unitStrId"),
			protocol.Int(0),                    // port
			protocol.Int(0),                    // door
			protocol.String("hh_room_rooftop"), // casts
			protocol.Int(0),                    // usersInQueue
			protocol.Bool(true),                // isVisible
		)

		extra = append(extra,
			protocol.Int(201),            // nodeId
			protocol.Int(2),              // nodeType
			protocol.String("$private2"), // name
			protocol.Int(0),              // userCount
			protocol.Int(25),             // maxUsers
			protocol.Int(nodeId),         // parentId

			// nodeType == 2
			protocol.Int(1),                  // flatCount
			protocol.Int(202),                // flatID
			protocol.String("$private2_102"), // name
			protocol.String("$owner"),        // owner
			protocol.String("$door"),         // door
			protocol.Int(0),                  // userCount
			protocol.Int(25),                 // maxUsers
			protocol.String("$description"),  // description
		)
	}

	var args []protocol.Argument
	args = append(args, protocol.Int(nodeMask))
	args = append(args, protocol.Int(nodeId))
	args = append(args, protocol.Int(nodeType))
	args = append(args, protocol.String(name))
	args = append(args, protocol.Int(userCount))
	args = append(args, protocol.Int(maxUsers))
	args = append(args, protocol.Int(parentId))
	args = append(args, extra...)

	// return packet.Context.Send(NAVNODEINFO, args...)
	return nil
}

func handleGETUSERFLATCATS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETUSERFLATCATS")
	return nil
}

func handleGETFLATCAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETFLATCAT")
	return nil
}

func handleSETFLATCAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSETFLATCAT")
	return nil
}

func handleGETSPACENODEUSERS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETSPACENODEUSERS")
	return nil
}

func handleREMOVEALLRIGHTS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleREMOVEALLRIGHTS")
	return nil
}

func handleGETPARENTCHAIN(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETPARENTCHAIN")
	return nil
}

func handleGET_RECOMMENDED_ROOMS(packet *protocol.Packet) error {
	numOfRooms := 0

	packet.Context.Logger().Debug(
		"handleGET_RECOMMENDED_ROOMS",
		slog.Int("numOfRooms", numOfRooms),
	)

	return packet.Context.Send(RECOMMENDED_ROOM_LIST, protocol.Int(numOfRooms))
}
