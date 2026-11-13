package r26

import (
	"bytes"
	"context"
	"errors"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// The messages of hh_navigator the server sends (packages/server/knowledge/r26/hh_navigator.md).
const (
	ownFlats            = 16
	flatInfo            = 54
	searchResults       = 55
	favouriteRooms      = 61
	noOwnFlats          = 57
	noFlats             = 58
	navNodeInfo         = 220
	userFlatCats        = 221
	spaceNodeUsers      = 223
	parentChain         = 227
	flatCat             = 222
	recommendedRoomList = 351
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
	16:  loggedIn(handleGetOwnFlats),
	17:  loggedIn(handleSearchFlats),
	18:  loggedIn(handleGetFavouriteFlats),
	19:  loggedIn(handleAddFavouriteRoom),
	20:  loggedIn(handleRemoveFavouriteRoom),
	21:  loggedIn(handleGetFlatInfo),
	23:  loggedIn(handleDeleteFlat),
	24:  loggedIn(handleUpdateFlat),
	25:  loggedIn(handleSetFlatInfo),
	152: loggedIn(handleGetFlatCat),
	153: loggedIn(handleSetFlatCat),
	264: loggedIn(handleGetRecommendedRooms),
	150: loggedIn(handleNavigate),
	151: loggedIn(handleGetUserFlatCats),
	154: loggedIn(handleGetSpaceNodeUsers),
	156: loggedIn(handleGetParentChain),
	155: loggedIn(handleRemoveAllRights),
}

// handleRemoveAllRights takes every habbo's rights in the habbo's own room, from the navigator's modify page.
func handleRemoveAllRights(s *session, me habbo.Habbo, body []byte) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(155, body)
		return
	}
	s.ruled(game.RemoveAllRights(context.Background(), s.db, me, int64(id)))
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
		if err := writePublicRoom(&b, p, c.ID); err != nil {
			s.fail(err)
			return
		}
	}
	s.reply(navNodeInfo, b.Bytes())
}

// writePublicRoom writes a public room as a node of type 1 under parent. The port is the room's id, as Holo gave it,
// which #room_directory sends back to enter it; the door is 0 and nobody waits in a queue.
func writePublicRoom(b *bytes.Buffer, p game.PublicListing, parent int64) error {
	if err := writeNode(b, p.ID, nodePublicRoom, p.Name, p.Visitors, int(p.MaxVisitors), parent); err != nil {
		return err
	}
	for _, field := range []any{p.Unit, int(p.ID), 0, p.Casts, 0} {
		if err := writeField(b, field); err != nil {
			return err
		}
	}
	return encoding.WriteBool(b, true)
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

// handleGetSpaceNodeUsers sends the names of the habbos in a public room, by index.
func handleGetSpaceNodeUsers(s *session, _ habbo.Habbo, body []byte) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(154, body)
		return
	}
	names := game.PublicRoomVisitors(int64(id))
	var b bytes.Buffer
	b.Write(vl64(int(id)))
	b.Write(vl64(len(names)))
	for _, name := range names {
		b.Write(str(name))
	}
	s.reply(spaceNodeUsers, b.Bytes())
}

// handleGetOwnFlats sends the habbo's own rooms, or 57 when it has none. The client sends its habbo's name, and the
// session's habbo is the one whose rooms it gets.
func handleGetOwnFlats(s *session, me habbo.Habbo, _ []byte) {
	flats, err := game.OwnRooms(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	if len(flats) == 0 {
		s.reply(noOwnFlats, nil)
		return
	}
	s.reply(ownFlats, flatLines(flats))
}

// handleSearchFlats sends the rooms whose name holds the query or whose owner it names, or 58 when none does.
func handleSearchFlats(s *session, me habbo.Habbo, body []byte) {
	if len(body) == 0 {
		s.reply(noFlats, nil)
		return
	}
	flats, err := game.SearchRooms(context.Background(), s.db, me, string(body))
	if err != nil {
		s.fail(err)
		return
	}
	if len(flats) == 0 {
		s.reply(noFlats, nil)
		return
	}
	s.reply(searchResults, flatLines(flats))
}

// handleGetRecommendedRooms sends three habbo rooms drawn at random (decision server/0057).
func handleGetRecommendedRooms(s *session, me habbo.Habbo, _ []byte) {
	flats, err := game.RecommendedRooms(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	var b bytes.Buffer
	if err := writeFlats(&b, flats); err != nil {
		s.fail(err)
		return
	}
	s.reply(recommendedRoomList, b.Bytes())
}

// doorCodes are the doors as 54 numbers them.
var doorCodes = map[string]int{"open": 0, "closed": 1, "password": 2}

// handleGetFlatInfo sends a habbo room's settings, with the room's model as its marker. A room that does not exist gets
// no answer. Alert is 0, since no script reads it, and the absolute most visitors is the rules' 25, which caps the
// navigator's modify page.
func handleGetFlatInfo(s *session, me habbo.Habbo, body []byte) {
	id, err := strconv.ParseInt(string(body), 10, 64)
	if err != nil {
		s.malformed(21, body)
		return
	}
	info, ok, err := game.RoomInfo(context.Background(), s.db, me, id)
	if err != nil {
		s.fail(err)
		return
	}
	if !ok {
		return
	}
	var b bytes.Buffer
	for _, field := range []any{
		flag(info.OthersMoveFurni), doorCodes[info.Door], int(info.ID), info.Owner, "model_" + info.Model, info.Name, info.Description,
		flag(info.ShowOwner), flag(info.Trading), 0, info.MaxVisitors, info.AbsoluteMaxVisitors,
	} {
		if err := writeField(&b, field); err != nil {
			s.fail(err)
			return
		}
	}
	s.reply(flatInfo, b.Bytes())
}

// handleGetFlatCat sends the category of the habbo's room; another habbo's room gets no answer.
func handleGetFlatCat(s *session, me habbo.Habbo, body []byte) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(152, body)
		return
	}
	categoryID, owned, err := game.RoomCategoryOf(context.Background(), s.db, me, int64(id))
	if err != nil {
		s.fail(err)
		return
	}
	if !owned {
		return
	}
	var b bytes.Buffer
	b.Write(vl64(int(id)))
	b.Write(vl64(int(categoryID)))
	s.reply(flatCat, b.Bytes())
}

// handleUpdateFlat changes the name, the door and whether to show the owner of the habbo's room:
// <flat id>/<name>/<door>/<show owner name>. What the rules refuse, or another habbo's room, changes nothing.
func handleUpdateFlat(s *session, me habbo.Habbo, body []byte) {
	parts := strings.Split(string(body), "/")
	var id int64
	err := errors.New("malformed")
	if len(parts) == 4 {
		id, err = strconv.ParseInt(parts[0], 10, 64)
	}
	if err != nil || (parts[3] != "0" && parts[3] != "1") {
		s.malformed(24, body)
		return
	}
	err = game.UpdateRoom(context.Background(), s.db, me, id, parts[1], parts[2], parts[3] == "1")
	if err != nil && !errors.Is(err, game.ErrInvalidRoomSettings) && !errors.Is(err, game.ErrNotOwner) {
		s.fail(err)
	}
}

// handleDeleteFlat deletes the habbo's room (decision server/0059); another habbo's room stays.
func handleDeleteFlat(s *session, me habbo.Habbo, body []byte) {
	id, err := strconv.ParseInt(string(body), 10, 64)
	if err != nil {
		s.malformed(23, body)
		return
	}
	if err := game.DeleteRoom(context.Background(), s.db, me, id); err != nil && !errors.Is(err, game.ErrNotOwner) {
		s.fail(err)
	}
}

// handleSetFlatCat puts the habbo's room in a category its level lets it use; anything else changes nothing.
func handleSetFlatCat(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	id, err := encoding.ReadVL64(r)
	if err != nil {
		s.malformed(153, body)
		return
	}
	categoryID, err := encoding.ReadVL64(r)
	if err != nil {
		s.malformed(153, body)
		return
	}
	err = game.SetRoomCategory(context.Background(), s.db, me, int64(id), int64(categoryID))
	if err != nil && !errors.Is(err, game.ErrInvalidRoomSettings) && !errors.Is(err, game.ErrNotOwner) {
		s.fail(err)
	}
}

// handleSetFlatInfo changes the habbo's room by the lines SETFLATINFO carries; settings the rules refuse, or a room
// the habbo does not own, change nothing.
func handleSetFlatInfo(s *session, me habbo.Habbo, body []byte) {
	id, change, ok := parseFlatInfo(string(body))
	if !ok {
		s.malformed(25, body)
		return
	}
	err := game.SetRoomSettings(context.Background(), s.db, me, id, change)
	if err != nil && !errors.Is(err, game.ErrInvalidRoomSettings) && !errors.Is(err, game.ErrNotOwner) {
		s.fail(err)
	}
}

// parseFlatInfo reads SETFLATINFO's two forms: the navigator's <flat id>/ and the room-o-matic's /<flat id>/, each
// followed by lines of key=value ended by carriage returns. The room-o-matic always sends password=, empty unless one
// was typed, and no maxvisitors=.
func parseFlatInfo(body string) (int64, game.RoomSettings, bool) {
	head, rest, found := strings.Cut(strings.TrimPrefix(body, "/"), "/")
	id, err := strconv.ParseInt(head, 10, 64)
	if !found || err != nil {
		return 0, game.RoomSettings{}, false
	}
	var change game.RoomSettings
	for line := range strings.SplitSeq(rest, "\r") {
		key, value, _ := strings.Cut(line, "=")
		switch key {
		case "description":
			change.Description = &value
		case "password":
			if value != "" {
				change.Password = &value
			}
		case "allsuperuser":
			others := value == "1"
			change.OthersMoveFurni = &others
		case "maxvisitors":
			if n, err := strconv.Atoi(value); err == nil {
				change.MaxVisitors = &n
			}
		}
	}
	return id, change, true
}

// tooManyFavourites is the text of 33 the client turns into nav_error_toomanyfavrooms, whatever limit it says
// (decision server/0058).
const tooManyFavourites = "Only 10 favorite rooms allowed!"

// handleGetFavouriteFlats sends the habbo's favourites: a header node of type 2 with the habbo rooms as its list of
// flats, then the public rooms as nodes of type 1, each under its category.
func handleGetFavouriteFlats(s *session, me habbo.Habbo, _ []byte) {
	public, flats, err := game.Favourites(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	var b bytes.Buffer
	b.Write(vl64(0))
	if err := writeNode(&b, 0, nodeFlats, "", 0, 0, 0); err != nil {
		s.fail(err)
		return
	}
	if err := writeFlats(&b, flats); err != nil {
		s.fail(err)
		return
	}
	for _, p := range public {
		if err := writePublicRoom(&b, p, p.RoomCategoryID); err != nil {
			s.fail(err)
			return
		}
	}
	s.reply(favouriteRooms, b.Bytes())
}

// handleAddFavouriteRoom keeps a public room, type 1, or a habbo room, type 0, among the habbo's favourites; past the
// limit, it answers 33.
func handleAddFavouriteRoom(s *session, me habbo.Habbo, body []byte) {
	ref, ok := readRoomRef(body)
	if !ok {
		s.malformed(19, body)
		return
	}
	err := game.AddFavourite(context.Background(), s.db, me, ref)
	switch {
	case errors.Is(err, game.ErrTooManyFavourites):
		s.reply(errorText, []byte(tooManyFavourites))
	case err != nil:
		s.fail(err)
	}
}

// handleRemoveFavouriteRoom takes a room out of the habbo's favourites.
func handleRemoveFavouriteRoom(s *session, me habbo.Habbo, body []byte) {
	ref, ok := readRoomRef(body)
	if !ok {
		s.malformed(20, body)
		return
	}
	if err := game.RemoveFavourite(context.Background(), s.db, me, ref); err != nil {
		s.fail(err)
	}
}

// readRoomRef reads a room as the favourites' commands name it: int type, 1 for a public room and 0 for a habbo
// room, then int id.
func readRoomRef(body []byte) (room.Ref, bool) {
	r := bytes.NewReader(body)
	kind, err := encoding.ReadVL64(r)
	if err != nil {
		return room.Ref{}, false
	}
	id, err := encoding.ReadVL64(r)
	if err != nil {
		return room.Ref{}, false
	}
	return room.Ref{Public: kind == 1, ID: int64(id)}, true
}

// flatLines writes habbo rooms as 16 and 55 carry them: a line each, ended by a carriage return, of nine items
// separated by tabs. The port and the filter are x and null, as Holo wrote them: the client keeps both and reads
// neither.
func flatLines(flats []game.FlatListing) []byte {
	var b strings.Builder
	for _, f := range flats {
		items := []string{
			strconv.FormatInt(f.ID, 10), oneLine(f.Name), oneLine(f.Owner), f.Door, "x",
			strconv.Itoa(f.Visitors), strconv.Itoa(f.MaxVisitors), "null", oneLine(f.Description),
		}
		b.WriteString(strings.Join(items, "\t"))
		b.WriteByte('\r')
	}
	return []byte(b.String())
}

// oneLine turns the control characters of a text into spaces, so that a tab or a line break never splits a line of
// 16 or 55.
func oneLine(text string) string {
	return strings.Map(func(r rune) rune {
		if r < ' ' {
			return ' '
		}
		return r
	}, text)
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
