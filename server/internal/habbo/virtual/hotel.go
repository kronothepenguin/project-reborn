package virtual

import "sync"

type Hotel struct {
	Config *Config

	Navigator *navigator

	habbos   map[string]*Habbo
	habbosMu sync.RWMutex

	storage Storage
}

func NewHotel(storage Storage) *Hotel {
	return &Hotel{
		Config:    newConfig(),
		Navigator: newNavigator(),

		habbos: make(map[string]*Habbo),

		storage: storage,
	}
}

func (h *Hotel) Load() error {
	// TODO: storage
	h.Config.loadMockData()
	h.Navigator.loadMockData()

	return nil
}

func (h *Hotel) setHabbo(id string, habbo *Habbo) {
	h.habbosMu.Lock()
	defer h.habbosMu.Unlock()

	h.habbos[id] = habbo
}

func (h *Hotel) LoadHabboBySSO(sso string) (*Habbo, error) {
	// TODO: load from storage
	habbo := Habbo{
		ID:         "1",
		Name:       "$name",
		Figure:     "hd-180-1.ch-876-62.lg-280-62.sh-300-62",
		Sex:        "M",
		CustomData: "$customData",
		PHTickets:  500,
		PHFigure:   "",
		PhotoFilm:  100,
		DirectMail: 1,

		SoundState: 1,

		Rights: []string{
			"fuse_trade", "fuse_buy_credits", "fuse_any_room_controller",
			"fuse_remove_stickies", "fuse_use_special_room_layouts", "fuse_see_flat_ids",
			"fuse_remove_photos", "fuse_habbo_chooser", "fuse_furni_chooser",
			"fuse_performance_panel", "fuse_catalog_editor", "fuse_debug_window",
			"fuse_cancel_roomevent", "fuse_use_club_dance", "can_buy_credits",
			"fuse_kick", "fuse_see_chat_log_link", "fuse_alert",
		},

		Badges: []string{
			"ADM",
		},

		Achievements: []*Achievement{
			{TypeID: 1, Level: 1, BadgeID: "AG1"},
		},
	}

	h.setHabbo(habbo.ID, &habbo)

	return &habbo, nil
}
