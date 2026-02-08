package virtual

import "sync"

type Hotel struct {
	Settings Settings

	Navigator Navigator

	habbos   map[int]*Habbo
	habbosMu sync.RWMutex

	storage Storage
}

func NewHotel(storage Storage) *Hotel {
	return &Hotel{
		habbos:  make(map[int]*Habbo),
		storage: storage,
	}
}

func (h *Hotel) Load() error {
	h.Settings.load(h.storage)
	h.Navigator.load(h.storage)

	return nil
}

func (h *Hotel) setHabbo(id int, habbo *Habbo) {
	h.habbosMu.Lock()
	defer h.habbosMu.Unlock()

	h.habbos[id] = habbo
}

func (h *Hotel) LoadHabboBySSO(ticket string) (*Habbo, error) {
	habbo := newHabbo()
	if err := habbo.loadBySSO(h.storage, ticket); err != nil {
		return nil, err
	}
	h.setHabbo(habbo.ID, habbo)
	return habbo, nil
}
