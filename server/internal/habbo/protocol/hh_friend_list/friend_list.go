package hhfriendlist

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

const OK = "OK"
const FRIENDLISTINIT = "FRIENDLISTINIT"
const FRIENDLISTUPDATE = "FRIENDLISTUPDATE"
const FRIENDREQUEST = "FRIENDREQUEST"
const ERROR = "ERROR"
const FRIENDREQUESTLIST = "FRIENDREQUESTLIST"
const FRIENDREQUESTRESULT = "FRIENDREQUESTRESULT"
const FOLLOWFAILED = "FOLLOWFAILED"
const MAILNOTIFICATION = "MAILNOTIFICATION"
const MAILCOUNTNOTIFICATION = "MAILCOUNTNOTIFICATION"
const HABBOSEARCHRESULT = "HABBOSEARCHRESULT"

func Register(registry protocol.Registry) {
	registry.Commands().Register(OK, 3)
	registry.Commands().Register(FRIENDLISTINIT, 12)
	registry.Commands().Register(FRIENDLISTUPDATE, 13)
	registry.Commands().Register(FRIENDREQUEST, 132)
	registry.Commands().Register(ERROR, 260)
	registry.Commands().Register(FRIENDREQUESTLIST, 314)
	registry.Commands().Register(FRIENDREQUESTRESULT, 315)
	registry.Commands().Register(FOLLOWFAILED, 349)
	registry.Commands().Register(MAILNOTIFICATION, 363)
	registry.Commands().Register(MAILCOUNTNOTIFICATION, 364)
	registry.Commands().Register(HABBOSEARCHRESULT, 435)

	registry.Listeners().Register(12, handleFRIENDLIST_INIT)
	registry.Listeners().Register(15, handleFRIENDLIST_UPDATE)
	registry.Listeners().Register(32, handleFRIENDLIST_GETOFFLINEFRIENDS)
	registry.Listeners().Register(40, handleFRIENDLIST_REMOVEFRIEND)
	registry.Listeners().Register(41, handleMESSENGER_HABBOSEARCH)
	registry.Listeners().Register(37, handleFRIENDLIST_ACCEPTFRIEND)
	registry.Listeners().Register(38, handleFRIENDLIST_DECLINEFRIEND)
	registry.Listeners().Register(39, handleFRIENDLIST_FRIENDREQUEST)
	registry.Listeners().Register(233, handleFRIENDLIST_GETFRIENDREQUESTS)
	registry.Listeners().Register(262, handleFOLLOW_FRIEND)
}

func handleFRIENDLIST_INIT(*protocol.Packet) error              { return nil }
func handleFRIENDLIST_UPDATE(*protocol.Packet) error            { return nil }
func handleFRIENDLIST_GETOFFLINEFRIENDS(*protocol.Packet) error { return nil }
func handleFRIENDLIST_REMOVEFRIEND(*protocol.Packet) error      { return nil }
func handleMESSENGER_HABBOSEARCH(*protocol.Packet) error        { return nil }
func handleFRIENDLIST_ACCEPTFRIEND(*protocol.Packet) error      { return nil }
func handleFRIENDLIST_DECLINEFRIEND(*protocol.Packet) error     { return nil }
func handleFRIENDLIST_FRIENDREQUEST(*protocol.Packet) error     { return nil }
func handleFRIENDLIST_GETFRIENDREQUESTS(*protocol.Packet) error { return nil }
func handleFOLLOW_FRIEND(*protocol.Packet) error                { return nil }
