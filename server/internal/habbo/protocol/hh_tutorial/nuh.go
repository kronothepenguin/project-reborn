package hhtutorial

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

const HELPITEMS = "HELPITEMS"
const TUTORSAVAILABLE = "TUTORSAVAILABLE"
const INVITINGCOMPLETED = "INVITINGCOMPLETED"
const INVITATIONEXISTS = "INVITATIONEXISTS"
const INVITATIONSENT = "INVITATIONSENT"
const GUIDEFOUND = "GUIDEFOUND"
const INVITERLEFTROOM = "INVITERLEFTROOM"

func Register(registry protocol.Registry) {
	registry.Commands().Register(HELPITEMS, 352)
	registry.Commands().Register(TUTORSAVAILABLE, 356)
	registry.Commands().Register(INVITINGCOMPLETED, 357)
	registry.Commands().Register(INVITATIONEXISTS, 358)
	registry.Commands().Register(INVITATIONSENT, 421)
	registry.Commands().Register(GUIDEFOUND, 423)
	registry.Commands().Register(INVITERLEFTROOM, 424)

	registry.Listeners().Register(313, handleMSG_REMOVE_ACCOUNT_HELP_TEXT)
	registry.Listeners().Register(355, handleMSG_GET_TUTORS_AVAILABLE)
	registry.Listeners().Register(356, handleMSG_INVITE_TUTORS)
	registry.Listeners().Register(359, handleMSG_CANCEL_TUTOR_INVITATIONS)
}

func handleMSG_REMOVE_ACCOUNT_HELP_TEXT(*protocol.Packet) error { return nil }
func handleMSG_GET_TUTORS_AVAILABLE(*protocol.Packet) error     { return nil }
func handleMSG_INVITE_TUTORS(*protocol.Packet) error            { return nil }
func handleMSG_CANCEL_TUTOR_INVITATIONS(*protocol.Packet) error { return nil }
