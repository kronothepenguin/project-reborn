package r26

import (
	"bytes"
	"context"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// clubStatus is hh_club's message with the club status (packages/server/knowledge/r26/hh_club.md).
const clubStatus = 7

// clubResponseNone tells the client to open no window with the status, as Holo's login sent it.
const clubResponseNone = 1

// clubHandlers handles hh_club's commands.
var clubHandlers = map[int]handler{
	26: loggedIn(handleGetClubInfo),
}

// handleGetClubInfo sends the club of the habbo's user, which all the user's habbos share (decision
// server/0052).
func handleGetClubInfo(s *session, me habbo.Habbo, _ []byte) {
	club, err := game.ClubStatus(context.Background(), s.db, me.UserID)
	if err != nil {
		s.fail(err)
		return
	}
	var b bytes.Buffer
	if err := encoding.WriteString(&b, "club_habbo"); err != nil {
		s.fail(err)
		return
	}
	for _, v := range []int{club.DaysLeft, club.ElapsedPeriods, club.PrepaidPeriods, clubResponseNone} {
		b.Write(vl64(v))
	}
	s.reply(clubStatus, b.Bytes())
}
