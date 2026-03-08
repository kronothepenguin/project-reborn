package virtual

type Achievement struct {
	TypeID  int
	Level   int
	BadgeID string
}

func loadAchivements(habboID int) ([]Achievement, error) {
	return []Achievement{
		{TypeID: 1, Level: 1, BadgeID: "AG1"},
	}, nil
}
