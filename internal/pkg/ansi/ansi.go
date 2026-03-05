package ansi

import "strings"

const csi = "\033["

type Attribute string

const Reset Attribute = "0"
const Bold Attribute = "1"
const Italic Attribute = "3"
const Underline Attribute = "4"

func Compose(attributes ...Attribute) string {
	if len(attributes) == 0 {
		return ""
	}

	var b strings.Builder
	b.WriteString(string(attributes[0]))
	for _, a := range attributes[1:] {
		b.WriteRune(';')
		b.WriteString(string(a))
	}

	return csi + b.String() + "m"
}

func S(raw ...any) string {
	if len(raw) == 0 {
		return ""
	}

	var b strings.Builder
	var attributes []Attribute
	for _, r := range raw {
		switch r := r.(type) {
		case Attribute:
			attributes = append(attributes, r)

		case Color:
			attributes = append(attributes, Foreground(r))

		case string:
			b.WriteString(Compose(attributes...))
			clear(attributes)
			b.WriteString(r)

		default:
			panic("not supported type")
		}
	}

	return b.String()
}
