package virtual

type FriendListCategory struct {
	ID   int // 1 - 5
	Name string
}

type Friend struct {
	ID         int
	Name       string
	Sex        int // unused
	Online     int
	CanFollow  int
	Figure     string
	CategoryID int
	Mission    string
	LastAccess string
}

type FriendRequest struct {
	ID     int
	Name   string
	UserID string
}

type FriendList struct {
	ExtendedLimit int

	Categories []FriendListCategory

	Friends []Friend

	Requests []FriendRequest
}
