package router

import (
	"context"
	"slices"
	"time"
)

// onlineTimeout is how long the game has to say which habbos are in the hotel.
const onlineTimeout = time.Second

// online asks the game once which of the habbos a page shows are in the hotel.
// A habbo missing from the answer is offline. An error, or no injected game,
// reads as offline for all, and the error is logged.
func (r *Router) online(ctx context.Context, ids []int64) map[int64]bool {
	if r.deps.Habbos == nil || len(ids) == 0 {
		return nil
	}
	ids = slices.Compact(slices.Sorted(slices.Values(ids)))
	ctx, cancel := context.WithTimeout(ctx, onlineTimeout)
	defer cancel()
	online, err := r.deps.Habbos.AreOnline(ctx, ids)
	if err != nil {
		logError("cms: habbos online", err)
		return nil
	}
	return online
}
