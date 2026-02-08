package virtual

import (
	"sync"
)

type Habbo struct {
	Connection

	Mu sync.RWMutex

	ID         int
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

	Achievements []Achievement

	Flats []*NavigatorFlat

	FriendList *FriendList
}

func newHabbo() *Habbo {
	return &Habbo{
		Connection: &nopConnection{},
	}
}

func (h *Habbo) loadFuseRights(storage Storage) ([]string, error) {
	return []string{
		"fuse_trade", "fuse_buy_credits", "fuse_any_room_controller",
		"fuse_remove_stickies", "fuse_use_special_room_layouts", "fuse_see_flat_ids",
		"fuse_remove_photos", "fuse_habbo_chooser", "fuse_furni_chooser",
		"fuse_performance_panel", "fuse_catalog_editor", "fuse_debug_window",
		"fuse_cancel_roomevent", "fuse_use_club_dance", "can_buy_credits",
		"fuse_kick", "fuse_see_chat_log_link", "fuse_alert",
	}, nil
}

func (h *Habbo) loadBadges(storage Storage) ([]string, error) {
	return []string{
		"ADM",
	}, nil
}

func (h *Habbo) loadBySSO(storage Storage, ticket string) error {
	h.ID = 1
	h.Name = "$name"
	h.Figure = "hd-180-1.ch-876-62.lg-280-62.sh-300-62"
	h.Sex = "M"
	h.CustomData = "$customData"
	h.PHTickets = 500
	h.PHFigure = ""
	h.PhotoFilm = 100
	h.DirectMail = 1

	h.Credits = 500

	h.SoundState = 1

	rights, err := h.loadFuseRights(storage)
	if err != nil {
		return err
	}
	h.Rights = rights

	badges, err := h.loadBadges(storage)
	if err != nil {
		return err
	}
	h.Badges = badges

	achivements, err := loadAchivements(storage, h.ID)
	if err != nil {
		return err
	}
	h.Achievements = achivements

	friendList, err := loadFriendList(storage, h.ID)
	if err != nil {
		return err
	}
	h.FriendList = friendList

	return nil
}
