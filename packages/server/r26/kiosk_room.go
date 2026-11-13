package r26

import (
	"context"
	"errors"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// flatCreated is hh_kiosk_room's answer to CREATEFLAT: the new room's id and name, on two lines of text
// (packages/server/knowledge/r26/hh_kiosk_room.md).
const flatCreated = 59

// cannotCreateRoom is the text of 33 on which the room-o-matic shows roomatic_create_error and closes.
const cannotCreateRoom = "Error creating a private room"

// kioskRoomCommands names the command hh_kiosk_room registers.
var kioskRoomCommands = map[int]string{
	29: "CREATEFLAT",
}

// kioskRoomHandlers handles hh_kiosk_room's command.
var kioskRoomHandlers = map[int]handler{
	29: loggedIn(handleCreateFlat),
}

// handleCreateFlat creates the room the room-o-matic describes: /first floor/<name>/model_<model>/<door>/<show owner
// name>, by the rules of decision server/0056.
func handleCreateFlat(s *session, me habbo.Habbo, body []byte) {
	parts := strings.Split(string(body), "/")
	modelName, prefixed := "", false
	if len(parts) == 6 {
		modelName, prefixed = strings.CutPrefix(parts[3], "model_")
	}
	if len(parts) != 6 || parts[0] != "" || !prefixed || (parts[5] != "0" && parts[5] != "1") {
		s.malformed(29, body)
		s.reply(errorText, []byte(cannotCreateRoom))
		return
	}
	created, err := game.CreateRoom(context.Background(), s.db, me, game.NewRoom{Name: parts[2], Model: modelName, Door: parts[4], ShowOwner: parts[5] == "1"})
	switch {
	case errors.Is(err, game.ErrCannotCreateRoom):
		s.reply(errorText, []byte(cannotCreateRoom))
	case err != nil:
		s.fail(err)
	default:
		s.reply(flatCreated, []byte(strconv.FormatInt(created.ID, 10)+"\r"+created.Name))
	}
}
