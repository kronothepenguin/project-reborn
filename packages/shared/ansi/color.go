package ansi

type Color rune

const (
	Black Color = iota + '0'
	Red
	Green
	Yellow
	Blue
	Magenta
	Cyan
	White
)

func Foreground(c Color) Attribute {
	return Attribute([]rune{'3', rune(c)})
}

func Background(c Color) Attribute {
	return Attribute([]rune{'4', rune(c)})
}
