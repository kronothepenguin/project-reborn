package r26

import (
	"bytes"
	"context"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// The messages of hh_room_utils' Chat Manager (plans/server/reference/r26/hh_room_utils.md): a chat, a whisper and a
// shout, by game.ChatKind.
var chatMessages = [...]int{game.ChatSay: 24, game.ChatWhisper: 25, game.ChatShout: 26}

// roomUtilsHandlers handles the chat, which hh_room_utils' Chat Manager sends.
var roomUtilsHandlers = map[int]handler{
	52: loggedIn(handleChat),
	55: loggedIn(handleShout),
	56: loggedIn(handleWhisper),
}

// handleChat says a line to the room: those near read it, the others see a bubble (plans/server decision 0074).
func handleChat(s *session, me habbo.Habbo, body []byte) {
	text, ok := chatText(s, 52, body)
	if ok {
		s.ruled(game.Say(context.Background(), s.db, me, text))
	}
}

// handleShout shouts a line to everyone in the room.
func handleShout(s *session, me habbo.Habbo, body []byte) {
	text, ok := chatText(s, 55, body)
	if ok {
		s.ruled(game.Shout(context.Background(), s.db, me, text))
	}
}

// handleWhisper whispers a line, `<name> <text>`, to one habbo in the room.
func handleWhisper(s *session, me habbo.Habbo, body []byte) {
	text, ok := chatText(s, 56, body)
	if !ok {
		return
	}
	to, line, _ := strings.Cut(text, " ")
	s.ruled(game.Whisper(context.Background(), s.db, me, to, line))
}

func chatText(s *session, id int, body []byte) (string, bool) {
	text, err := encoding.ReadB64String(bytes.NewReader(body))
	if err != nil {
		s.malformed(id, body)
		return "", false
	}
	return text, true
}

// ruled ends the session on a rule's failure, as a database that fails does.
func (s *session) ruled(err error) {
	if err != nil {
		s.fail(err)
	}
}

// sendChat writes a line as 24, 25 or 26: the speaker's index, and the text, empty for a line too far away to read,
// which the client draws as its unheard bubble.
func (s *session) sendChat(c game.Chat) {
	s.reply(chatMessages[c.Kind], append(vl64(c.Index), str(c.Text)...))
}
