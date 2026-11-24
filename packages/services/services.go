// Package services holds the contracts through which a program reaches the game
// server: to tell it of a change it must show live, to ask who is in the hotel,
// and to open or close its doors. A call carries ids only: a change is already
// saved, and the game reads the store again.
package services

import "context"

// Hotel opens and closes the game's doors, and tells whether they are open.
type Hotel interface {
	Status(ctx context.Context) (HotelStatus, error)
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
}

// HotelStatus is the game as a program sees it.
type HotelStatus struct {
	Running bool // the doors are open
	Online  int  // habbos in the hotel
}

// Habbos tells the game server that a habbo changed outside the game, and asks
// which habbos are in the hotel.
type Habbos interface {
	// SendLook shows the habbo's saved figure, gender and motto to it and its room.
	SendLook(ctx context.Context, avatarID int64) error
	// AreOnline reports which of ids are in the hotel now.
	AreOnline(ctx context.Context, ids []int64) (map[int64]bool, error)
	// Online lists the habbos in the hotel now.
	Online(ctx context.Context) ([]int64, error)
}

// Economy tells the game server that a user's purse changed outside the game.
type Economy interface {
	// SendPurse tells the game that the user's purse
	// changed: its credits, tickets or film.
	SendPurse(ctx context.Context, userID int64) error
}
