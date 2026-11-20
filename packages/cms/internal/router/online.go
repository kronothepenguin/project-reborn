package router

import (
	"context"
	"slices"
	"time"
)

// onlineTimeout is how long the game has to say which habbos are in the hotel.
const onlineTimeout = 300 * time.Millisecond

// online asks the game once which of the habbos a page shows are in the hotel.
// A habbo missing from the answer is offline. An error, or no injected game,
// reads as offline for all; the result goes to gameAnswered. While the game's
// last answer failed, every habbo is offline without a question: the status
// question of each page finds the game again.
func (r *Router) online(ctx context.Context, ids []int64) map[int64]bool {
	if r.deps.Habbos == nil || len(ids) == 0 || r.gameFailed.Load() {
		return nil
	}
	ids = slices.Compact(slices.Sorted(slices.Values(ids)))
	ctx, cancel := context.WithTimeout(ctx, onlineTimeout)
	defer cancel()
	online, err := r.deps.Habbos.AreOnline(ctx, ids)
	r.gameAnswered("habbos online", err)
	if err != nil {
		return nil
	}
	return online
}
