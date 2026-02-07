package virtual

import "sync"

type Habbo struct {
	Connection

	Mu sync.RWMutex

	ID         string
	Name       string
	Figure     string
	Sex        string
	CustomData string

	Credits int

	PHTickets int
	PHFigure  string

	PhotoFilm int

	DirectMail int

	SoundState int

	Rights []string

	Badges []string

	Achievements []*Achievement

	Flats []*NavigatorFlat

	FriendList *FriendList
}
