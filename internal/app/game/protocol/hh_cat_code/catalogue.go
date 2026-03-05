package hhcatcode

import (
	"errors"
	"log/slog"
	"strings"

	"github.com/kronothepenguin/project-reborn/internal/app/game/protocol"
)

const PURSE = "PURSE"
const PURCHASE_OK = "PURCHASE_OK"
const PURCHASE_ERROR = "PURCHASE_ERROR"
const PURCHASE_NOBALANCE = "PURCHASE_NOBALANCE"
const CATALOGINDEX = "CATALOGINDEX"
const CATALOGPAGE = "CATALOGPAGE"
const PURCHASENOTALLOWED = "PURCHASENOTALLOWED"

func Register(registry protocol.Registry) {
	registry.Commands().Register(PURSE, 6)
	registry.Commands().Register(PURCHASE_OK, 67)
	registry.Commands().Register(PURCHASE_ERROR, 65)
	registry.Commands().Register(PURCHASE_NOBALANCE, 68)
	registry.Commands().Register(CATALOGINDEX, 126)
	registry.Commands().Register(CATALOGPAGE, 127)
	registry.Commands().Register(PURCHASENOTALLOWED, 296)

	registry.Listeners().Register(100, handleGPRC)
	registry.Listeners().Register(101, handleGCIX)
	registry.Listeners().Register(102, handleGCAP)
}

func handleGPRC(packet *protocol.Packet) error {
	content := packet.Message.ReadRawString()

	order := strings.Split(content, "\r")
	if len(order) < 6 {
		return errors.New("handleGPRC invalid order")
	}

	editMode := order[0]
	lastPageID := order[1]
	language := order[2]
	purchaseCode := order[3]
	extra := order[4]
	gift := order[5]

	packet.Session.Logger.Debug(
		"handleGPRC",
		slog.String("editMode", editMode),
		slog.String("lastPageID", lastPageID),
		slog.String("language", language),
		slog.String("purchaseCode", purchaseCode),
		slog.String("extra", extra),
		slog.String("gift", gift),
	)

	return nil
}

func handleGCIX(packet *protocol.Packet) error {
	rawContent := packet.Message.ReadRawString()

	content := strings.Split(rawContent, "/")
	if len(content) < 2 {
		return errors.New("handleGCIX invalid content")
	}

	editMode := content[0]
	language := content[1]

	packet.Session.Logger.Debug(
		"handleGCIX",
		slog.String("editMode", editMode),
		slog.String("language", language),
	)

	catalog := [][]string{
		{"$page1_id", "$data1"},
		{"$page2_id", "$data2"},
	}

	data := strings.Join(
		[]string{strings.Join(catalog[0], "\t"), strings.Join(catalog[1], "\t")},
		"\n",
	)

	return packet.Session.Send(CATALOGINDEX, protocol.RawString(data))
}

func handleGCAP(packet *protocol.Packet) error {
	rawContent := packet.Message.ReadRawString()

	content := strings.Split(rawContent, "/")
	if len(content) < 3 {
		return errors.New("handleGCAP invalid content")
	}

	editMode := content[0]
	pageID := content[1]
	language := content[2]

	packet.Session.Logger.Debug(
		"handleGCAP",
		slog.String("editMode", editMode),
		slog.String("pageID", pageID),
		slog.String("language", language),
	)

	page := [][]string{
		{"i", "$id"},
		{"n", "$name"},
		{"l", "$layout"},
		{"h", "$header<br>$text"},
		{"g", "$headerImage"},
		{"w", "$teaser<br>$text"},
		{"e", "$teaserImg1,$teaserImg2"},
		{"s", "$teaser<br>$special<br>$text"},
		{"t1", "$text1<br>$text2"},
		{"u", "$link1,$link2"},
		{"p", "$name\t$description\t$price\t$specialText\t$objectType\t$class\t$direction\t$dimensions\t$purchaseCode\t$partColors"},
	}

	data := strings.Join(
		[]string{
			strings.Join(page[0], ":"),
			strings.Join(page[1], ":"),
		},
		"\n",
	)

	return packet.Session.Send(CATALOGPAGE, protocol.RawString(data))
}
