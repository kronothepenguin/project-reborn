package hhnavigator

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

const FLAT_RESULTS = "FLAT_RESULTS"
const ERROR = "ERROR"
const FLATINFO = "FLATINFO"
const FLAT_RESULTS_2 = "FLAT_RESULTS_2"
const NOFLATSFORUSER = "NOFLATSFORUSER"
const NOFLATS = "NOFLATS"
const FAVOURITEROOMRESULTS = "FAVOURITEROOMRESULTS"
const FLATPASSWORD_OK = "FLATPASSWORD_OK"
const NAVNODEINFO = "NAVNODEINFO"
const USERFLATCATS = "USERFLATCATS"
const FLATCAT = "FLATCAT"
const SPACENODEUSERS = "SPACENODEUSERS"
const CANTCONNECT = "CANTCONNECT"
const SUCCESS = "SUCCESS"
const FAILURE = "FAILURE"
const PARENTCHAIN = "PARENTCHAIN"
const ROOMFORWARD = "ROOMFORWARD"
const RECOMMENDED_ROOM_LIST = "RECOMMENDED_ROOM_LIST"

func Register(registry protocol.Registry) {
	registry.Commands().Register(FLAT_RESULTS, 16)
	registry.Commands().Register(ERROR, 33)
	registry.Commands().Register(FLATINFO, 54)
	registry.Commands().Register(FLAT_RESULTS_2, 55)
	registry.Commands().Register(NOFLATSFORUSER, 57)
	registry.Commands().Register(NOFLATS, 58)
	registry.Commands().Register(FAVOURITEROOMRESULTS, 61)
	registry.Commands().Register(FLATPASSWORD_OK, 130)
	registry.Commands().Register(NAVNODEINFO, 220)
	registry.Commands().Register(USERFLATCATS, 221)
	registry.Commands().Register(FLATCAT, 222)
	registry.Commands().Register(SPACENODEUSERS, 223)
	registry.Commands().Register(CANTCONNECT, 224)
	registry.Commands().Register(SUCCESS, 225)
	registry.Commands().Register(FAILURE, 226)
	registry.Commands().Register(PARENTCHAIN, 227)
	registry.Commands().Register(ROOMFORWARD, 286)
	registry.Commands().Register(RECOMMENDED_ROOM_LIST, 351)

	registry.Listeners().Register(13, handleSBUSYF)
	registry.Listeners().Register(16, handleSUSERF)
	registry.Listeners().Register(17, handleSRCHF)
	registry.Listeners().Register(18, handleGETFVRF)
	registry.Listeners().Register(19, handleADD_FAVORITE_ROOM)
	registry.Listeners().Register(20, handleDEL_FAVORITE_ROOM)
	registry.Listeners().Register(21, handleGETFLATINFO)
	registry.Listeners().Register(23, handleDELETEFLAT)
	registry.Listeners().Register(24, handleUPDATEFLAT)
	registry.Listeners().Register(25, handleSETFLATINFO)
	registry.Listeners().Register(150, handleNAVIGATE)
	registry.Listeners().Register(151, handleGETUSERFLATCATS)
	registry.Listeners().Register(152, handleGETFLATCAT)
	registry.Listeners().Register(153, handleSETFLATCAT)
	registry.Listeners().Register(154, handleGETSPACENODEUSERS)
	registry.Listeners().Register(155, handleREMOVEALLRIGHTS)
	registry.Listeners().Register(156, handleGETPARENTCHAIN)
	registry.Listeners().Register(264, handleGET_RECOMMENDED_ROOMS)
}

func handleSBUSYF(*protocol.Packet) error                { return nil }
func handleSUSERF(*protocol.Packet) error                { return nil }
func handleSRCHF(*protocol.Packet) error                 { return nil }
func handleGETFVRF(*protocol.Packet) error               { return nil }
func handleADD_FAVORITE_ROOM(*protocol.Packet) error     { return nil }
func handleDEL_FAVORITE_ROOM(*protocol.Packet) error     { return nil }
func handleGETFLATINFO(*protocol.Packet) error           { return nil }
func handleDELETEFLAT(*protocol.Packet) error            { return nil }
func handleUPDATEFLAT(*protocol.Packet) error            { return nil }
func handleSETFLATINFO(*protocol.Packet) error           { return nil }
func handleNAVIGATE(*protocol.Packet) error              { return nil }
func handleGETUSERFLATCATS(*protocol.Packet) error       { return nil }
func handleGETFLATCAT(*protocol.Packet) error            { return nil }
func handleSETFLATCAT(*protocol.Packet) error            { return nil }
func handleGETSPACENODEUSERS(*protocol.Packet) error     { return nil }
func handleREMOVEALLRIGHTS(*protocol.Packet) error       { return nil }
func handleGETPARENTCHAIN(*protocol.Packet) error        { return nil }
func handleGET_RECOMMENDED_ROOMS(*protocol.Packet) error { return nil }
