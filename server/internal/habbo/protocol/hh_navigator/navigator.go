package hhnavigator

import (
	"errors"
	"fmt"
	"log/slog"
	"slices"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
	"github.com/kronothepenguin/project-reborn/internal/habbo/virtual"
)

const OWN_FLAT_RESULTS = "OWN_FLAT_RESULTS"
const ERROR = "ERROR"
const FLATINFO = "FLATINFO"
const SRC_FLAT_RESULTS = "SRC_FLAT_RESULTS"
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
	registry.Commands().Register(OWN_FLAT_RESULTS, 16)
	registry.Commands().Register(ERROR, 33)
	registry.Commands().Register(FLATINFO, 54)
	registry.Commands().Register(SRC_FLAT_RESULTS, 55)
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
	registry.Listeners().Register(16, handleGetOwnFlats)
	registry.Listeners().Register(17, handleSearchFlats)
	registry.Listeners().Register(18, handleGetFavoriteFlats)
	registry.Listeners().Register(19, handleAddFavoriteFlat)
	registry.Listeners().Register(20, handleDelFavoriteFlat)
	registry.Listeners().Register(21, handleGetFlatInfo)
	registry.Listeners().Register(23, handleDeleteFlat)
	registry.Listeners().Register(24, handleUpdateFlatInfo)
	registry.Listeners().Register(25, handleSetFlatInfo)
	registry.Listeners().Register(150, handleNavigate)
	registry.Listeners().Register(151, handleGetUserFlatCategories)
	registry.Listeners().Register(152, handleGetFlatCategory)
	registry.Listeners().Register(153, handleSetFlatCategory)
	registry.Listeners().Register(154, handleGetSpaceNodeUsers)
	registry.Listeners().Register(155, handleRemoveAllRights)
	registry.Listeners().Register(156, handleGetParentChain)
	registry.Listeners().Register(264, handleGetRecommendedRooms)
}

func handleSBUSYF(packet *protocol.Packet) error {
	// client doesn't send this command

	packet.Context.Logger().Debug("handleSBUSYF")

	return errors.New("handleSBUSYF this command doesn't exists")
}

// SUSERF
func handleGetOwnFlats(packet *protocol.Packet) error {
	name := packet.Message.ReadRawString()

	packet.Context.Logger().Debug("handleGetOwnFlats", slog.String("name", name))

	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleGetOwnFlats habbo is nil")
	}

	habbo.Mu.RLock()
	defer habbo.Mu.RUnlock()

	if name != habbo.Name {
		return errors.New("handleGetOwnFlats name is not habbo's name")
	}

	if len(habbo.Flats) > 0 {
		var result strings.Builder
		for _, flat := range habbo.Flats {
			line := strings.Join([]string{
				strconv.Itoa(packet.Context.Hotel().Navigator.RootFlatCatId),
				strconv.Itoa(flat.FlatID),
				flat.Name,
				flat.Owner,
				flat.Door,
				"0", // port
				strconv.Itoa(flat.UserCount),
				strconv.Itoa(flat.MaxUsers),
				"", // filter
				flat.Description,
			}, "\t")

			result.WriteString(line)
		}

		return packet.Context.Send(OWN_FLAT_RESULTS, protocol.RawString("$id\t$flatID\t$name\t$owner\t$door\t$port\t$userCount"))
	}

	return packet.Context.Send(NOFLATSFORUSER)

	// var args []protocol.Argument
	// args = append(args, protocol.Int(len(habbo.Flats)))
	// for _, flat := range habbo.Flats {
	// 	args = append(args, protocol.Int(flat.NodeID), protocol.String(flat.Name))
	// }

	// return packet.Context.Send(USERFLATCATS, args...)
}

// SRCHF
func handleSearchFlats(packet *protocol.Packet) error {
	query := packet.Message.ReadRawString()

	packet.Context.Logger().Debug("handleSearchFlats", slog.String("query", query))

	// return packet.Context.Send(SRC_FLAT_RESULTS, protocol.RawString(""))
	return packet.Context.Send(NOFLATS)
}

// GETFVRF
func handleGetFavoriteFlats(packet *protocol.Packet) error {
	_, err := packet.Message.ReadBool() // always false
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug("handleGetFavoriteFlats")

	return packet.Context.Send(FAVOURITEROOMRESULTS)
}

// ADD_FAVORITE_ROOM
func handleAddFavoriteFlat(packet *protocol.Packet) error {
	nodeType, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	nodeID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleAddFavoriteFlat",
		slog.Int("nodeType", nodeType),
		slog.Int("nodeID", nodeID),
	)

	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleAddFavoriteFlat habbo is nil")
	}

	habbo.Mu.RLock()
	defer habbo.Mu.RUnlock()

	// TODO: msgID instead of 19, should the messages within a connection be counted?
	return packet.Context.Send(SUCCESS, protocol.Int(19))
}

// DEL_FAVORITE_ROOM
func handleDelFavoriteFlat(packet *protocol.Packet) error {
	nodeType, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	nodeID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleDelFavoriteFlat",
		slog.Int("nodeType", nodeType),
		slog.Int("nodeID", nodeID),
	)

	return nil
}

// GETFLATINFO
func handleGetFlatInfo(packet *protocol.Packet) error {
	flatID := packet.Message.ReadRawString()

	packet.Context.Logger().Debug("handleGetFlatInfo", slog.String("flatID", flatID))

	return packet.Context.Send(FLATINFO)
}

// DELETEFLAT
func handleDeleteFlat(packet *protocol.Packet) error {
	flatID := packet.Message.ReadRawString()

	packet.Context.Logger().Debug("handleDeleteFlat", slog.String("flatID", flatID))

	return packet.Context.Send(SUCCESS, protocol.Int(23))
}

// UPDATEFLAT
func handleUpdateFlatInfo(packet *protocol.Packet) error {
	msg := packet.Message.ReadRawString()
	data := strings.Split(msg, "/")
	if len(data) < 4 {
		return errors.New("handleUpdateFlatInfo invalid flat update")
	}

	flatID := data[0]
	name := data[1]
	door := data[2]
	showOwnerName := data[3]

	packet.Context.Logger().Debug(
		"handleUpdateFlatInfo",
		slog.String("flatID", flatID),
		slog.String("name", name),
		slog.String("door", door),
		slog.String("showOwnerName", showOwnerName),
	)

	return packet.Context.Send(SUCCESS, protocol.Int(24))
}

// SETFLATINFO
func handleSetFlatInfo(packet *protocol.Packet) error {
	msg := packet.Message.ReadRawString()

	packet.Context.Logger().Debug("handleSetFlatInfo", slog.String("msg", msg))

	return packet.Context.Send(SUCCESS, protocol.Int(25))
}

func serializeNavigatorNode(node virtual.NavigatorNode, depth int) []protocol.Argument {
	if depth < 0 {
		return nil
	}

	var args []protocol.Argument

	switch n := node.(type) {
	case *virtual.NavigatorCategoryNode:
		children := n.Children
		for _, child := range children {
			args = append(
				args,
				protocol.Int(child.NodeID),
				protocol.Int(child.NodeType),
				protocol.String(child.Name),
				protocol.Int(child.UserCount),
				protocol.Int(child.MaxUsers),
				protocol.Int(child.ParentId),
			)

			// FIXME: wont work with subcategories
			args = slices.Concat(args, serializeNavigatorNode(child.Node, depth-1))
		}

	case *virtual.NavigatorUnitNode:
		args = append(
			args,
			protocol.String(n.UnitStrID),
			protocol.Int(n.Port),
			protocol.Int(n.Door),
			protocol.String(strings.Join(n.Casts, ",")),
			protocol.Int(n.UsersInQueue),
			protocol.Bool(n.IsVisible),
		)

	case *virtual.NavigatorFlatCategoryNode:
		args = append(args, protocol.Int(len(n.FlatList)))
		for _, flat := range n.FlatList {
			args = append(
				args,
				protocol.Int(flat.FlatID),
				protocol.String(flat.Name),
				protocol.String(flat.Owner),
				protocol.String(flat.Door),
				protocol.Int(flat.UserCount),
				protocol.Int(flat.MaxUsers),
				protocol.String(flat.Description),
			)
		}
	}

	return args
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

	node, ok := packet.Context.Hotel().Navigator.Nodes[nodeId]
	if !ok {
		return fmt.Errorf("handleNavigate node type %d not found", nodeId)
	}

	var args []protocol.Argument
	args = append(
		args,
		protocol.Int(nodeMask),
		protocol.Int(node.NodeID),
		protocol.Int(node.NodeType),
		protocol.String(node.Name),
		protocol.Int(node.UserCount),
		protocol.Int(node.MaxUsers),
		protocol.Int(node.ParentId),
	)

	args = slices.Concat(args, serializeNavigatorNode(node.Node, depth))

	return packet.Context.Send(NAVNODEINFO, args...)
}

// GETUSERFLATCATS
func handleGetUserFlatCategories(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGetUserFlatCategories")

	navigator := &packet.Context.Hotel().Navigator
	// TODO: reliable source of flat categories
	flatCats := navigator.Nodes[navigator.RootFlatCatId]
	cats := flatCats.Node.(*virtual.NavigatorCategoryNode).Children

	var args []protocol.Argument
	args = append(args, protocol.Int(len(cats)))
	for _, flatCat := range cats {
		args = append(
			args,
			protocol.Int(flatCat.NodeID),
			protocol.String(flatCat.Name),
		)
	}

	return packet.Context.Send(USERFLATCATS, args...)
}

// GETFLATCAT
func handleGetFlatCategory(packet *protocol.Packet) error {
	flatID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug("handleGetFlatCategory", slog.Int("flatID", flatID))

	// TODO: fetch flat's category
	return packet.Context.Send(FLATCAT, protocol.Int(flatID), protocol.Int(packet.Context.Hotel().Navigator.RootFlatCatId))
}

// SETFLATCAT
func handleSetFlatCategory(packet *protocol.Packet) error {
	flatID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	categoryID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleSetFlatCategory",
		slog.Int("flatID", flatID),
		slog.Int("categoryID", categoryID),
	)

	return nil
}

// GETSPACENODEUSERS
func handleGetSpaceNodeUsers(packet *protocol.Packet) error {
	nodeID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug("handleGetSpaceNodeUsers", slog.Int("nodeID", nodeID))

	return packet.Context.Send(SPACENODEUSERS, protocol.Int(nodeID), protocol.Int(1), protocol.String("$name"))
}

// REMOVEALLRIGHTS
func handleRemoveAllRights(packet *protocol.Packet) error {
	flatID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug("handleRemoveAllRights", slog.Int("flatID", flatID))

	return packet.Context.Send(SUCCESS, protocol.Int(155))
}

// GETPARENTCHAIN
func handleGetParentChain(packet *protocol.Packet) error {
	flatID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug("handleGetParentChain", slog.Int("flatID", flatID))

	// return packet.Context.Send(PARENTCHAIN)
	return nil
}

// GET_RECOMMENDED_ROOMS
func handleGetRecommendedRooms(packet *protocol.Packet) error {
	navigator := &packet.Context.Hotel().Navigator

	navigator.Mu.RLock()
	defer navigator.Mu.RUnlock()

	recommended := navigator.Recommended()

	packet.Context.Logger().Debug(
		"handleGetRecommendedRooms",
		slog.String("recommended", fmt.Sprintf("%+v", recommended)),
	)

	var args []protocol.Argument
	args = append(args, protocol.Int(len(recommended)))
	for _, room := range recommended {
		args = append(
			args,
			protocol.Int(room.FlatID),
			protocol.String(room.Name),
			protocol.String(room.Owner),
			protocol.String(room.Door),
			protocol.Int(room.UserCount),
			protocol.Int(room.MaxUsers),
			protocol.String(room.Description),
		)
	}

	return packet.Context.Send(RECOMMENDED_ROOM_LIST, args...)
}
