// Package services holds the contracts through which a program tells the game
// server of a change it must show live. A call carries ids only: the change is
// already saved, and the game reads the store again.
package services

import "context"

// Habbos tells the game server that a habbo changed outside the game.
type Habbos interface {
	// SendLook shows the habbo's saved figure, gender and motto to it and its room.
	SendLook(ctx context.Context, avatarID int64) error
}
