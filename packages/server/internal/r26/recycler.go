package r26

import (
	"bytes"
	"context"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// The messages of hh_recycler the server sends (packages/server/knowledge/r26/hh_recycler.md).
const (
	recyclerConfiguration  = 303
	recyclerStatus         = 304
	startRecyclingResult   = 306
	confirmRecyclingResult = 307
)

// The reward types of 303: a floor furni and a wall item.
const (
	rewardFloor = 0
	rewardWall  = 1
)

// mostRecycled is more furni than any reward takes: a longer list is malformed.
const mostRecycled = 1000

// recyclerCommands names the commands of hh_recycler by id, as its Recycler Handler registers them.
var recyclerCommands = map[int]string{
	222: "GET_FURNI_RECYCLER_CONFIGURATION",
	223: "GET_FURNI_RECYCLER_STATUS",
	224: "APPROVE_RECYCLED_FURNI",
	225: "START_FURNI_RECYCLING",
	226: "CONFIRM_FURNI_RECYCLING",
}

// recyclerHandlers handles hh_recycler's commands. APPROVE_RECYCLED_FURNI is one the client never sends.
var recyclerHandlers = map[int]handler{
	222: loggedIn(handleRecyclerConfiguration),
	223: loggedIn(handleRecyclerStatus),
	225: loggedIn(handleStartRecycling),
	226: loggedIn(handleConfirmRecycling),
}

// rewardType numbers a reward's furni as 303 and 304 do.
func rewardType(d store.FurniDefinition) int {
	if d.Kind == "wall" {
		return rewardWall
	}
	return rewardFloor
}

// handleRecyclerConfiguration answers 303: whether the recycler runs, how many minutes a furni must be old, a
// recycling takes and its reward waits, then each reward: how many furni it takes, its type, its class and, for a
// floor furni, its direction, its length, its width and its colours. A recycler that is off sends only that.
func handleRecyclerConfiguration(s *session, _ habbo.Habbo, _ []byte) {
	setup, err := game.Recycler(context.Background(), s.db)
	if err != nil {
		s.fail(err)
		return
	}
	if !setup.Enabled {
		s.reply(recyclerConfiguration, vl64(0))
		return
	}
	var b bytes.Buffer
	for _, v := range []int{1, setup.MinOwnedMinutes, setup.Minutes, setup.TimeoutMinutes, len(setup.Rewards)} {
		b.Write(vl64(v))
	}
	for _, reward := range setup.Rewards {
		d := reward.Definition
		b.Write(vl64(reward.Count))
		b.Write(vl64(rewardType(d)))
		b.Write(str(d.Sprite))
		if d.Kind != "wall" {
			b.Write(vl64(0))
			b.Write(vl64(int(d.Length)))
			b.Write(vl64(int(d.Width)))
			b.Write(str(d.Colours))
		}
	}
	s.reply(recyclerConfiguration, b.Bytes())
}

// handleRecyclerStatus answers 304 with the habbo's recycling: 0 for none; 1, the reward's type and class and the
// minutes left while it runs; 2 with the reward once it may be taken; and 3 when it waited too long.
func handleRecyclerStatus(s *session, me habbo.Habbo, _ []byte) {
	status, err := game.Recycling(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	var b bytes.Buffer
	b.Write(vl64(int(status.State)))
	if status.State == game.RecyclerInProgress || status.State == game.RecyclerReady {
		b.Write(vl64(rewardType(status.Reward)))
		b.Write(str(status.Reward.Sprite))
	}
	if status.State == game.RecyclerInProgress {
		b.Write(vl64(status.MinutesLeft))
	}
	s.reply(recyclerStatus, b.Bytes())
}

// handleStartRecycling gives the recycler furni of the hand: a count and that many floor furni ids, then a count and
// that many wall item ids. 306 answers 1 when the recycling started, on which the client asks for its status, and 0
// when it did not. A habbo in a room gets 101 first, for its hand, here and when its recycling ends.
func handleStartRecycling(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	var ids []int64
	for range 2 {
		n, err := encoding.ReadVL64(r)
		if err != nil || n < 0 || int(n) > mostRecycled {
			s.malformed(225, body)
			return
		}
		for range int(n) {
			id, err := encoding.ReadVL64(r)
			if err != nil {
				s.malformed(225, body)
				return
			}
			ids = append(ids, int64(id))
		}
	}
	started, err := game.StartRecycling(context.Background(), s.db, me, ids)
	if err != nil {
		s.fail(err)
		return
	}
	s.reply(startRecyclingResult, vl64(flag(started)))
}

// handleConfirmRecycling takes the reward, 1, or refuses it and takes the furni back, 0. 307 answers 1 when the
// recycling ended, on which the recycler opens empty again, and 0 when nothing changed.
func handleConfirmRecycling(s *session, me habbo.Habbo, body []byte) {
	take, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(226, body)
		return
	}
	ended, err := game.EndRecycling(context.Background(), s.db, me, take == 1)
	if err != nil {
		s.fail(err)
		return
	}
	s.reply(confirmRecyclingResult, vl64(flag(ended)))
}
