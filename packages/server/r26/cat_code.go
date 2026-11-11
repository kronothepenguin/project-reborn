package r26

import (
	"context"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// The messages of hh_cat_code the server sends (plans/server/reference/r26/hh_cat_code.md).
const (
	catalogueIndex = 126
	cataloguePage  = 127
)

// catCodeCommands names the commands of hh_cat_code by id, as its Catalogue Handler and its pets page register them.
var catCodeCommands = map[int]string{
	42:  "APPROVENAME",
	100: "GPRC",
	101: "GCIX",
	102: "GCAP",
}

// catCodeHandlers handles hh_cat_code's commands.
var catCodeHandlers = map[int]handler{
	101: loggedIn(handleCatalogueIndex),
	102: loggedIn(handleCataloguePage),
}

// handleCatalogueIndex lists the pages the habbo sees, a line each: the page's code, a tab and its name. The edit mode
// and the language the client sends change nothing.
func handleCatalogueIndex(s *session, me habbo.Habbo, _ []byte) {
	pages, err := game.CataloguePages(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	var b strings.Builder
	for _, p := range pages {
		b.WriteString(printable(p.Code) + "\t" + printable(p.Name) + "\r")
	}
	s.reply(catalogueIndex, []byte(b.String()))
}

// handleCataloguePage sends the page the client names in <edit mode>/<page>/<language>, when the habbo sees it. A page
// it does not see gets no answer, as a page that does not exist.
func handleCataloguePage(s *session, me habbo.Habbo, body []byte) {
	parts := strings.Split(string(body), "/")
	if len(parts) < 3 {
		s.malformed(102, body)
		return
	}
	page, ok, err := game.CataloguePage(context.Background(), s.db, me, strings.Join(parts[1:len(parts)-1], "/"))
	if err != nil {
		s.fail(err)
		return
	}
	if ok {
		s.reply(cataloguePage, []byte(pageLines(page)))
	}
}

// pageLines writes a page as 127 carries it, a line per value under its one-letter key, a numbered text under t and
// its number, and what the page sells under p.
func pageLines(p catalogue.Page) string {
	var b strings.Builder
	line := func(key, value string) {
		b.WriteString(key + ":" + value + "\r")
	}
	line("i", printable(p.Code))
	line("n", printable(p.Name))
	line("l", printable(p.Layout))
	for _, optional := range [][2]string{{"g", p.HeaderImage}, {"e", p.TeaserImages}, {"h", p.HeaderText}, {"w", p.TeaserText}, {"s", p.SpecialText}} {
		if optional[1] != "" {
			line(optional[0], printable(optional[1]))
		}
	}
	for _, text := range p.Texts {
		line("t"+strconv.FormatInt(text.Number, 10), printable(text.Text))
	}
	for _, item := range p.Items {
		if len(item.Furni) > 0 {
			line("p", product(item))
		}
	}
	return b.String()
}

// product writes an item as the client reads a p line, its values tab-separated: name, description, price, special
// text, object type, class, direction, dimensions, purchase code and part colours; and for a deal, the count of its
// furni and each one's class, pieces and part colours. The object type is s for a floor furni, i for a wall item and
// d for a deal.
func product(item catalogue.Item) string {
	values := []string{printable(item.Name), printable(item.Description), strconv.FormatInt(item.Price, 10), ""}
	switch first := item.Furni[0]; {
	case item.Deal():
		values = append(values, "d", "", "", "", printable(item.Code), "", strconv.Itoa(len(item.Furni)))
		for _, f := range item.Furni {
			values = append(values, class(f.FurniDefinition), strconv.FormatInt(f.Amount, 10), printable(f.Colours))
		}
	case first.Kind == "wall":
		values = append(values, "i", class(first.FurniDefinition), "", "", printable(item.Code), "")
	default:
		size := strconv.FormatInt(first.Length, 10) + "," + strconv.FormatInt(first.Width, 10)
		values = append(values, "s", class(first.FurniDefinition), "0", size, printable(item.Code), printable(first.Colours))
	}
	return strings.Join(values, "\t")
}

// class names a furni to the client: its sprite, and after a space what a wall item carries, as in "poster 44".
func class(d store.FurniDefinition) string {
	if d.Data == "" {
		return printable(d.Sprite)
	}
	return printable(d.Sprite + " " + d.Data)
}

// printable keeps a value on its line and in its place: a tab, a line break or any other control character in it
// becomes a space.
func printable(value string) string {
	return strings.Map(func(r rune) rune {
		if r < ' ' {
			return ' '
		}
		return r
	}, value)
}
