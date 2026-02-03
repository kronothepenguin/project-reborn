package virtual

type Hotel struct {
	navigator *navigator
}

func NewHotel() *Hotel {
	return &Hotel{
		navigator: newNavigator(),
	}
}

// TODO: storage
func (h *Hotel) Load() error {
	h.navigator.loadMockData()

	return nil
}

func (h *Hotel) Navigator() *navigator {
	return h.navigator
}
