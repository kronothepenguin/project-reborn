package r26

import (
	"bytes"
	"context"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// The messages of hh_navigator the server sends (plans/server/reference/r26/hh_navigator.md).
const (
	navNodeInfo    = 220
	userFlatCats   = 221
	spaceNodeUsers = 223
	parentChain    = 227
)

// The types of the navigator's nodes.
const (
	nodeCategory   = 0
	nodePublicRoom = 1
	nodeFlats      = 2
)

// navigatorCommands names the commands of hh_navigator by id, as its Navigator Handler registers them.
var navigatorCommands = map[int]string{
	13:  "SBUSYF",
	16:  "SUSERF",
	17:  "SRCHF",
	18:  "GETFVRF",
	19:  "ADD_FAVORITE_ROOM",
	20:  "DEL_FAVORITE_ROOM",
	21:  "GETFLATINFO",
	23:  "DELETEFLAT",
	24:  "UPDATEFLAT",
	25:  "SETFLATINFO",
	150: "NAVIGATE",
	151: "GETUSERFLATCATS",
	152: "GETFLATCAT",
	153: "SETFLATCAT",
	154: "GETSPACENODEUSERS",
	155: "REMOVEALLRIGHTS",
	156: "GETPARENTCHAIN",
	264: "GET_RECOMMENDED_ROOMS",
}

// navigatorHandlers handles hh_navigator's commands, which the client sends once its habbo is logged in.
var navigatorHandlers = map[int]handler{
	150: loggedIn(handleNavigate),
	151: loggedIn(handleGetUserFlatCats),
	154: loggedIn(handleGetSpaceNodeUsers),
	156: loggedIn(handleGetParentChain),
}

// handleNavigate sends a category: itself, the categories right under it, and its public rooms or its habbo rooms.
// Node mask 1 leaves the full rooms out. A category that does not exist or hides itself from the habbo gets no answer.
func handleNavigate(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	mask, err := encoding.ReadVL64(r)
	if err != nil {
		s.malformed(150, body)
		return
	}
	id, err := encoding.ReadVL64(r)
	if err != nil {
		s.malformed(150, body)
		return
	}
	browsed, ok, err := game.Browse(context.Background(), s.db, me, int64(id), mask == 1)
	if err != nil {
		s.fail(err)
		return
	}
	if !ok {
		return
	}
	var b bytes.Buffer
	b.Write(vl64(int(mask)))
	c := browsed.Category
	nodeType := nodeCategory
	if c.Kind == "rooms" {
		nodeType = nodeFlats
	}
	if err := writeNode(&b, c.ID, nodeType, c.Name, c.Visitors, c.MaxVisitors, c.ParentID.Int64); err != nil {
		s.fail(err)
		return
	}
	if nodeType == nodeFlats {
		if err := writeFlats(&b, browsed.Rooms); err != nil {
			s.fail(err)
			return
		}
	}
	for _, child := range browsed.Children {
		if err := writeNode(&b, child.ID, nodeCategory, child.Name, child.Visitors, child.MaxVisitors, c.ID); err != nil {
			s.fail(err)
			return
		}
	}
	for _, p := range browsed.PublicRooms {
		if err := writeNode(&b, p.ID, nodePublicRoom, p.Name, p.Visitors, int(p.MaxVisitors), c.ID); err != nil {
			s.fail(err)
			return
		}
		// The port is the public room's id, as Holo gave it, which #room_directory sends back to enter it; the door is
		// 0 and nobody waits in a queue.
		for _, field := range []any{p.Unit, int(p.ID), 0, p.Casts, 0} {
			if err := writeField(&b, field); err != nil {
				s.fail(err)
				return
			}
		}
		if err := encoding.WriteBool(&b, true); err != nil {
			s.fail(err)
			return
		}
	}
	s.reply(navNodeInfo, b.Bytes())
}

// handleGetUserFlatCats sends the categories the habbo may put a room in.
func handleGetUserFlatCats(s *session, me habbo.Habbo, _ []byte) {
	categories, err := game.RoomCategories(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	var b bytes.Buffer
	b.Write(vl64(len(categories)))
	for _, c := range categories {
		b.Write(vl64(int(c.ID)))
		if err := encoding.WriteString(&b, c.Name); err != nil {
			s.fail(err)
			return
		}
	}
	s.reply(userFlatCats, b.Bytes())
}

// handleGetParentChain sends a category and the categories above it, nearest first.
func handleGetParentChain(s *session, _ habbo.Habbo, body []byte) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(156, body)
		return
	}
	c, ok := category.Get(int64(id))
	if !ok {
		return
	}
	var b bytes.Buffer
	for _, n := range append([]store.RoomCategory{c}, category.Parents(c.ID)...) {
		b.Write(vl64(int(n.ID)))
		if err := encoding.WriteString(&b, n.Name); err != nil {
			s.fail(err)
			return
		}
	}
	s.reply(parentChain, b.Bytes())
}

// handleGetSpaceNodeUsers sends the names of the habbos in a public room: none until S4 lets habbos enter.
func handleGetSpaceNodeUsers(s *session, _ habbo.Habbo, body []byte) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(154, body)
		return
	}
	var b bytes.Buffer
	b.Write(vl64(int(id)))
	b.Write(vl64(0))
	s.reply(spaceNodeUsers, b.Bytes())
}

// writeNode writes the fields every node starts with.
func writeNode(b *bytes.Buffer, id int64, nodeType int, name string, visitors, maxVisitors int, parent int64) error {
	for _, field := range []any{int(id), nodeType, name, visitors, maxVisitors, int(parent)} {
		if err := writeField(b, field); err != nil {
			return err
		}
	}
	return nil
}

// writeFlats writes a list of habbo rooms as a node of type 2 and 61 carry it.
func writeFlats(b *bytes.Buffer, flats []game.FlatListing) error {
	b.Write(vl64(len(flats)))
	for _, f := range flats {
		for _, field := range []any{int(f.ID), f.Name, f.Owner, f.Door, f.Visitors, f.MaxVisitors, f.Description} {
			if err := writeField(b, field); err != nil {
				return err
			}
		}
	}
	return nil
}
