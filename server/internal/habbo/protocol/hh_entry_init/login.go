package hhentryinit

import (
	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

const DISCONNECT = "DISCONNECT"
const HELLO = "HELLO"
const SERVERSECRETKEY = "SERVERSECRETKEY"
const RIGHTS = "RIGHTS"
const LOGINOK = "LOGINOK"
const USEROBJ = "USEROBJ"
const ERR = "ERR"
const USERBANNED = "USERBANNED"
const PING = "PING"
const EPSNOTIFY = "EPSNOTIFY"
const SYSTEMBROADCAST = "SYSTEMBROADCAST"
const CHECKSUM = "CHECKSUM"
const MODALERT = "MODALERT"
const AVAILABLEBADGES = "AVAILABLEBADGES"
const SESSIONPARAMETERS = "SESSIONPARAMETERS"
const CRYPTOPARAMETERS = "CRYPTOPARAMETERS"
const ENDOFCRYPTOPARAMS = "ENDOFCRYPTOPARAMS"
const HOTELLOGOUT = "HOTELLOGOUT"
const SOUNDSETTING = "SOUNDSETTING"
const POSSIBLEACHIEVEMENTS = "POSSIBLEACHIEVEMENTS"
const ACHIEVEMENTNOTIFICATION = "ACHIEVEMENTNOTIFICATION"
const LATENCYTEST = "LATENCYTEST"

func registerLogin(registry protocol.Registry) {
	registry.RegisterCommand(DISCONNECT, -1)
	registry.RegisterCommand(HELLO, 0)
	registry.RegisterCommand(SERVERSECRETKEY, 1)
	registry.RegisterCommand(RIGHTS, 2)
	registry.RegisterCommand(LOGINOK, 3)
	registry.RegisterCommand(USEROBJ, 5)
	registry.RegisterCommand(ERR, 33)
	registry.RegisterCommand(USERBANNED, 35)
	registry.RegisterCommand(PING, 50)
	registry.RegisterCommand(EPSNOTIFY, 52)
	registry.RegisterCommand(SYSTEMBROADCAST, 139)
	registry.RegisterCommand(CHECKSUM, 141)
	registry.RegisterCommand(MODALERT, 161)
	registry.RegisterCommand(AVAILABLEBADGES, 229)
	registry.RegisterCommand(SESSIONPARAMETERS, 257)
	registry.RegisterCommand(CRYPTOPARAMETERS, 277)
	registry.RegisterCommand(ENDOFCRYPTOPARAMS, 278)
	registry.RegisterCommand(HOTELLOGOUT, 287)
	registry.RegisterCommand(SOUNDSETTING, 308)
	registry.RegisterCommand(POSSIBLEACHIEVEMENTS, 436)
	registry.RegisterCommand(ACHIEVEMENTNOTIFICATION, 437)
	registry.RegisterCommand(LATENCYTEST, 354)

	registry.RegisterListener(756, handleTryLogin)
	registry.RegisterListener(1170, handleVersionCheck)
	registry.RegisterListener(813, handleUniqueID)
	registry.RegisterListener(7, handleGetInfo)
	registry.RegisterListener(8, handleGetCredits)
	registry.RegisterListener(47, handleGetPassword)
	registry.RegisterListener(58, handleLangCheck)
	registry.RegisterListener(105, handleBTCKS)
	registry.RegisterListener(157, handleGetAvailableBadges)
	registry.RegisterListener(159, handleGetSelectedBadges)
	registry.RegisterListener(1817, handleGetSessionParameters)
	registry.RegisterListener(196, handlePong)
	registry.RegisterListener(2002, handleGenerateKey)
	registry.RegisterListener(204, handleSSO)
	registry.RegisterListener(206, handleInitCrypto)
	registry.RegisterListener(207, handleSecretKey)
	registry.RegisterListener(228, handleGetSoundSettings)
	registry.RegisterListener(229, handleSetSoundSettings)
	registry.RegisterListener(370, handleGetPossibleAchievements)
	registry.RegisterListener(315, handleTestLatency)
	registry.RegisterListener(316, handleReportLatency)
}

func handleTryLogin(ctx protocol.Context, packet *protocol.Packet) error {
	username, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	password, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	// TODO: verify credentials, better use bcrypt for password
	if username == "habbo" && password == "1234" {
	}

	return ctx.Send(LOGINOK)
}

func handleVersionCheck(ctx protocol.Context, packet *protocol.Packet) error {
	version, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	clientURL, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	extVarsURL, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	if version == 0 || clientURL == "" || extVarsURL == "" {
	}

	return nil
}

func handleUniqueID(ctx protocol.Context, packet *protocol.Packet) error {
	id, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	if id == "" {
	}

	return nil
}

func handleGetInfo(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: send info, session parameters?
	return nil
}

func handleGetCredits(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: send credits
	return nil
}

func handleGetPassword(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: send password
	return nil
}

func handleLangCheck(ctx protocol.Context, packet *protocol.Packet) error {
	return ctx.Send(EPSNOTIFY, protocol.RawString(""))
}

// buy game tickets
func handleBTCKS(ctx protocol.Context, packet *protocol.Packet) error {
	chosenAmount, err := packet.Message.ReadInt()
	if err != nil {
		return nil
	}

	name, err := packet.Message.ReadString()
	if err != nil {
		return nil
	}

	if chosenAmount == 0 || name == "" {
	}

	return nil
}

func handleGetAvailableBadges(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: get available badges from storage
	badges := []protocol.Argument{}
	badges = append(badges, protocol.String("VIP"))

	chosen := []protocol.Argument{}
	index := 1
	chosen = append(chosen, protocol.Int(index))
	chosen = append(chosen, protocol.String("VIP"))

	args := make([]protocol.Argument, len(badges)+1+len(chosen)+1)
	args = append(args, protocol.Int(len(badges)))
	args = append(args, badges...)
	args = append(args, protocol.Int(len(chosen)))
	args = append(args, chosen...)

	return ctx.Send(AVAILABLEBADGES, args...)
}

func handleGetSelectedBadges(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: get selected badges
	return nil
}

func handleGetSessionParameters(ctx protocol.Context, packet *protocol.Packet) error {
	parameters := []protocol.Argument{}
	// 0 - false, 1 - true, 2 - required

	coppa := 2 // 0
	parameters = append(parameters, protocol.Int(0))
	parameters = append(parameters, protocol.Int(coppa))

	voucher := 1 // 1
	parameters = append(parameters, protocol.Int(1))
	parameters = append(parameters, protocol.Int(voucher))

	parentEmailRequest := 1 // 2
	parameters = append(parameters, protocol.Int(2))
	parameters = append(parameters, protocol.Int(parentEmailRequest))

	parentEmailRequestReregistration := 1 // 3
	parameters = append(parameters, protocol.Int(3))
	parameters = append(parameters, protocol.Int(parentEmailRequestReregistration))

	allowDirectMail := 1 // 4
	parameters = append(parameters, protocol.Int(4))
	parameters = append(parameters, protocol.Int(allowDirectMail))

	dateFormat := "dd-mm-yyyy" // 5
	parameters = append(parameters, protocol.Int(5))
	parameters = append(parameters, protocol.String(dateFormat))

	partnerIntegration := 1 // 6
	parameters = append(parameters, protocol.Int(6))
	parameters = append(parameters, protocol.Int(partnerIntegration))

	profileEditing := 1 // 7
	parameters = append(parameters, protocol.Int(7))
	parameters = append(parameters, protocol.Int(profileEditing))

	trackingHeader := "" // 8
	parameters = append(parameters, protocol.Int(8))
	parameters = append(parameters, protocol.String(trackingHeader))

	tutorialEnabled := 1 // 9
	parameters = append(parameters, protocol.Int(9))
	parameters = append(parameters, protocol.Int(tutorialEnabled))

	args := make([]protocol.Argument, len(parameters)+1)
	args = append(args, protocol.Int(len(parameters)))
	args = append(args, parameters...)

	return ctx.Send(SESSIONPARAMETERS, args...)
}

func handlePong(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: pong received
	// ctx.Pong() to enable a timeout for the next PING?
	return nil
}

func handleGenerateKey(ctx protocol.Context, packet *protocol.Packet) error {
	publicKey, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	// TODO: crypto
	if publicKey == "" {
	}

	return nil
}

func handleSSO(ctx protocol.Context, packet *protocol.Packet) error {
	ticket, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	// TODO: sso
	if ticket == "" {
	}

	return nil
}

func handleInitCrypto(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: crypto

	return nil
}

func handleSecretKey(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: crypto

	return nil
}

func handleGetSoundSettings(ctx protocol.Context, packet *protocol.Packet) error {
	state := 0 // 0 - muted, 1 - max
	return ctx.Send(SOUNDSETTING, protocol.Int(state))
}

func handleSetSoundSettings(ctx protocol.Context, packet *protocol.Packet) error {
	state, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}
	// TODO: store sound state
	if state == 0 {
	}
	return nil
}

func handleGetPossibleAchievements(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: fetch from storage and loop
	achievements := []protocol.Argument{}

	typeID := 1
	achievements = append(achievements, protocol.Int(typeID))
	level := 1
	achievements = append(achievements, protocol.Int(level))
	badgeID := "trade"
	achievements = append(achievements, protocol.String(badgeID))

	args := make([]protocol.Argument, len(achievements)+1)
	args = append(args, protocol.Int(len(achievements)))
	args = append(args, achievements...)

	return ctx.Send(POSSIBLEACHIEVEMENTS, args...)
}

func handleTestLatency(ctx protocol.Context, packet *protocol.Packet) error {
	id, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}
	return ctx.Send(LATENCYTEST, protocol.Int(id))
}

func handleReportLatency(ctx protocol.Context, packet *protocol.Packet) error {
	latency, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	latencyCleared, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	latencyValueCount, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	// TODO: log, ctx.Log() maybe?
	println(latency, latencyCleared, latencyValueCount)

	return nil
}
