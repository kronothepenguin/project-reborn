package hhclub

import (
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/app/habbo/server/protocol"
)

const OK = "OK"
const SCR_SINFO = "SCR_SINFO"
const GIFT = "GIFT"

func Register(registry protocol.Registry) {
	registry.Commands().Register(OK, 3)
	registry.Commands().Register(SCR_SINFO, 7)
	registry.Commands().Register(GIFT, 280)

	registry.Listeners().Register(26, handleSCRGetUserInfo)
	registry.Listeners().Register(190, handleSCRBuy)
	registry.Listeners().Register(210, handleGiftApproval)
}

func handleSCRGetUserInfo(packet *protocol.Packet) error {
	product, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleSCRGetUserInfo",
		slog.String("product", product),
	)

	productName := "club_habbo"
	daysLeft := 365
	elapsedPeriods := 0
	prepaidPeriods := 0
	responseFlag := 0 // 2 - show dialog, 3 - ended

	return packet.Context.Send(SCR_SINFO, protocol.String(productName), protocol.Int(daysLeft), protocol.Int(elapsedPeriods), protocol.Int(prepaidPeriods), protocol.Int(responseFlag))
}

func handleSCRBuy(*protocol.Packet) error { return nil }

func handleGiftApproval(*protocol.Packet) error { return nil }
