package hhcatcode

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

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

func handleGPRC(*protocol.Packet) error { return nil }
func handleGCIX(*protocol.Packet) error { return nil }
func handleGCAP(*protocol.Packet) error { return nil }
