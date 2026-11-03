// Package bbcode turns the text of notes, and later of news and forum posts,
// into HTML as HoloCMS's bbcode_format did, with every piece of the text
// escaped.
package bbcode

import (
	"html/template"
	"strings"
)

// Format renders text as Holo's bbcode_format(nl2br(text)) did: a <br />
// before every line break, the smilies when smilies is true, then each tag in
// one pass, in Holo's order, nested as a browser nested Holo's HTML. A link
// takes only an http or https address, and colours and sizes are Tailwind
// classes.
func Format(text string, smilies bool) template.HTML {
	tokens := tokenize(text, smilies)
	for i := range tags {
		tokens = tags[i].replace(tokens)
	}
	var b strings.Builder
	build(tokens).render(&b)
	return template.HTML(b.String())
}

type kind uint8

const (
	textKind kind = iota
	smileyKind
	breakKind
	startKind
	endKind
)

// token is a piece of the text on its way through Holo's steps: the user's
// text, a smiley, the <br /> of a line break, or the start or end of a tag.
type token struct {
	kind  kind
	text  string // the user's text, or the smiley's image
	tag   *tag
	value string // the X of [link=X], [url=X] and [color=X]; "" when it held more than text
}

// smileyCodes are in the order of Holo's str_replace calls. No two codes can
// overlap, and the markup Holo put in their place holds none of their
// characters, so one scan over the text finds what the ten calls found.
var smileyCodes = []struct{ code, image string }{
	{":)", "smile"}, {";)", "wink"},
	{":P", "tongue"}, {";P", "winktongue"},
	{":p", "tongue"}, {";p", "winktongue"},
	{"(L)", "heart"}, {"(l)", "heart"},
	{":o", "shocked"}, {":O", "shocked"},
}

// tokenize finds the line breaks and smilies in the raw text, so that none
// is ever looked for in escaped text, where ' becomes &#39; and holds ";".
func tokenize(s string, smilies bool) []token {
	var tokens []token
	var text strings.Builder
	flush := func() {
		if text.Len() > 0 {
			tokens = append(tokens, token{kind: textKind, text: text.String()})
			text.Reset()
		}
	}
	for i := 0; i < len(s); {
		if c := s[i]; c == '\n' || c == '\r' {
			n := 1
			if i+1 < len(s) && (s[i+1] == '\n' || s[i+1] == '\r') && s[i+1] != c {
				n = 2
			}
			flush()
			tokens = append(tokens, token{kind: breakKind})
			text.WriteString(s[i : i+n])
			i += n
			continue
		}
		if smilies {
			if image, n := smileyAt(s[i:]); n > 0 {
				text.WriteByte(' ')
				flush()
				tokens = append(tokens, token{kind: smileyKind, text: image})
				text.WriteByte(' ')
				i += n
				continue
			}
		}
		text.WriteByte(s[i])
		i++
	}
	flush()
	return tokens
}

func smileyAt(s string) (image string, n int) {
	for _, c := range smileyCodes {
		if strings.HasPrefix(s, c.code) {
			return c.image, len(c.code)
		}
	}
	return "", 0
}

// tag is one of the patterns Holo's preg_replace ran, in the order of tags.
type tag struct {
	open, close string // in lower case; an open ending in "=" takes a value up to "]"
	element     string // what Holo wrote, which decides how a browser nests it
	markup      func(value string) (start, end string)
}

var tags = []tag{
	{"[b]", "[/b]", "strong", fixed("<strong>", "</strong>")},
	{"[i]", "[/i]", "em", fixed("<em>", "</em>")},
	{"[u]", "[/u]", "u", fixed("<u>", "</u>")},
	{"[s]", "[/s]", "s", fixed("<s>", "</s>")},
	{"[quote]", "[/quote]", "div", fixed("<div class='bg-stone-300 border border-black m-[3px] mb-2.5 p-[5px]'>", "</div>")},
	{"[link=", "[/link]", "a", link},
	{"[url=", "[/url]", "a", link},
	{"[color=", "[/color]", "font", colour},
	{"[size=small]", "[/size]", "font", fixed("<span class='text-[10px]'>", "</span>")},
	{"[size=large]", "[/size]", "font", fixed("<span class='text-base'>", "</span>")},
	{"[code]", "[/code]", "pre", fixed("<pre>", "</pre>")},
}

func fixed(start, end string) func(string) (string, string) {
	return func(string) (string, string) { return start, end }
}

// browserNoise is what a browser removes from anywhere in an address before it
// reads it.
var browserNoise = strings.NewReplacer("\t", "", "\n", "", "\r", "")

// link keeps an address only when it is http or https once a browser has
// cleaned it up, as Holo's links worked with spaces around the address.
func link(value string) (string, string) {
	address := browserNoise.Replace(strings.TrimFunc(value, func(r rune) bool { return r <= ' ' }))
	if !hasPrefix(address, "http://") && !hasPrefix(address, "https://") {
		return "", ""
	}
	return "<a href='" + template.HTMLEscapeString(address) + "'>", "</a>"
}

var colours = []struct{ name, class string }{
	{"red", "text-red-600"},
	{"orange", "text-orange-500"},
	{"yellow", "text-amber-300"},
	{"green", "text-lime-500"},
	{"cyan", "text-teal-400"},
	{"blue", "text-sky-600"},
	{"gray", "text-olive-500"},
	{"black", "text-black"},
}

// colour reads the name as a browser read Holo's <font color>, without the
// spaces around it and without case.
func colour(value string) (string, string) {
	value = strings.Trim(value, "\t\n\f\r ")
	for _, c := range colours {
		if len(value) == len(c.name) && hasPrefix(value, c.name) {
			return "<span class='" + c.class + "'>", "</span>"
		}
	}
	return "", ""
}

// hasPrefix reports whether s starts with the lower-case prefix, ignoring the
// case of ASCII letters only, as PCRE's /i and a browser's colour names did.
func hasPrefix(s, prefix string) bool {
	if len(s) < len(prefix) {
		return false
	}
	for i := range len(prefix) {
		c := s[i]
		if 'A' <= c && c <= 'Z' {
			c += 'a' - 'A'
		}
		if c != prefix[i] {
			return false
		}
	}
	return true
}

func index(s, lit string) int {
	for i := range len(s) - len(lit) + 1 {
		if hasPrefix(s[i:], lit) {
			return i
		}
	}
	return -1
}

// position is a byte in the text of a token.
type position struct{ token, at int }

func (p position) add(n int) position { return position{p.token, p.at + n} }

// find returns the first lit at or after from. A tag's pieces lie within one
// text token, as the markup Holo had written by then stood between tokens.
func find(tokens []token, from position, lit string) (position, bool) {
	for i := from.token; i < len(tokens); i++ {
		if tokens[i].kind != textKind {
			continue
		}
		at := 0
		if i == from.token {
			at = from.at
		}
		if j := index(tokens[i].text[at:], lit); j >= 0 {
			return position{i, at + j}, true
		}
	}
	return position{}, false
}

// appendRange appends the tokens from from up to to, cutting the text tokens
// at both ends. to is in a text token, or after the last token.
func appendRange(out, tokens []token, from, to position) []token {
	for i := from.token; i < len(tokens) && i <= to.token; i++ {
		t := tokens[i]
		if t.kind != textKind {
			out = append(out, t)
			continue
		}
		lo, hi := 0, len(t.text)
		if i == from.token {
			lo = from.at
		}
		if i == to.token {
			hi = to.at
		}
		if lo < hi {
			t.text = t.text[lo:hi]
			out = append(out, t)
		}
	}
	return out
}

// replace is one of Holo's patterns, such as /\[b\](.*?)\[\/b\]/is, in one
// pass: the leftmost opening first, closed by the nearest closing after it,
// and the search going on after that. When an opening has no closing after
// it, no later one has either.
func (t *tag) replace(tokens []token) []token {
	var out []token
	from := position{}
	for {
		opening, ok := find(tokens, from, t.open)
		if !ok {
			break
		}
		content, value := opening.add(len(t.open)), ""
		if strings.HasSuffix(t.open, "=") {
			bracket, ok := find(tokens, content, "]")
			if !ok {
				break
			}
			if bracket.token == content.token {
				value = tokens[content.token].text[content.at:bracket.at]
			}
			content = bracket.add(1)
		}
		closing, ok := find(tokens, content, t.close)
		if !ok {
			break
		}
		out = appendRange(out, tokens, from, opening)
		out = append(out, token{kind: startKind, tag: t, value: value})
		out = appendRange(out, tokens, content, closing)
		out = append(out, token{kind: endKind, tag: t})
		from = closing.add(len(t.close))
	}
	return appendRange(out, tokens, from, position{token: len(tokens)})
}

func (n *node) render(b *strings.Builder) {
	for _, c := range n.children {
		switch c.kind {
		case textKind:
			b.WriteString(template.HTMLEscapeString(c.text))
		case smileyKind:
			b.WriteString("<img class='inline align-baseline' src='/smilies/" + c.text + ".gif' alt='Smiley' title='Smiley' border='0'>")
		case breakKind:
			b.WriteString("<br />")
		case startKind:
			start, end := c.tag.markup(c.value)
			b.WriteString(start)
			c.render(b)
			b.WriteString(end)
		}
	}
}
