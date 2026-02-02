package hhentryinit

import (
	"crypto/rand"
	"fmt"
	"log/slog"
	"math/big"

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
	registry.Commands().Register(DISCONNECT, -1)
	registry.Commands().Register(HELLO, 0)
	registry.Commands().Register(SERVERSECRETKEY, 1)
	registry.Commands().Register(RIGHTS, 2)
	registry.Commands().Register(LOGINOK, 3)
	registry.Commands().Register(USEROBJ, 5)
	registry.Commands().Register(ERR, 33)
	registry.Commands().Register(USERBANNED, 35)
	registry.Commands().Register(PING, 50)
	registry.Commands().Register(EPSNOTIFY, 52)
	registry.Commands().Register(SYSTEMBROADCAST, 139)
	registry.Commands().Register(CHECKSUM, 141)
	registry.Commands().Register(MODALERT, 161)
	registry.Commands().Register(AVAILABLEBADGES, 229)
	registry.Commands().Register(SESSIONPARAMETERS, 257)
	registry.Commands().Register(CRYPTOPARAMETERS, 277)
	registry.Commands().Register(ENDOFCRYPTOPARAMS, 278)
	registry.Commands().Register(HOTELLOGOUT, 287)
	registry.Commands().Register(SOUNDSETTING, 308)
	registry.Commands().Register(POSSIBLEACHIEVEMENTS, 436)
	registry.Commands().Register(ACHIEVEMENTNOTIFICATION, 437)
	registry.Commands().Register(LATENCYTEST, 354)

	registry.Listeners().Register(756, handleTryLogin)
	registry.Listeners().Register(1170, handleVersionCheck)
	registry.Listeners().Register(813, handleUniqueID)
	registry.Listeners().Register(7, handleGetInfo)
	registry.Listeners().Register(8, handleGetCredits)
	registry.Listeners().Register(47, handleGetPassword)
	registry.Listeners().Register(58, handleLangCheck)
	registry.Listeners().Register(105, handleBTCKS)
	registry.Listeners().Register(157, handleGetAvailableBadges)
	registry.Listeners().Register(159, handleGetSelectedBadges)
	registry.Listeners().Register(1817, handleGetSessionParameters)
	registry.Listeners().Register(196, handlePong)
	registry.Listeners().Register(2002, handleGenerateKey)
	registry.Listeners().Register(204, handleSSO)
	registry.Listeners().Register(206, handleInitCrypto)
	registry.Listeners().Register(207, handleSecretKey)
	registry.Listeners().Register(228, handleGetSoundSettings)
	registry.Listeners().Register(229, handleSetSoundSettings)
	registry.Listeners().Register(370, handleGetPossibleAchievements)
	registry.Listeners().Register(315, handleTestLatency)
	registry.Listeners().Register(316, handleReportLatency)
}

func handleTryLogin(packet *protocol.Packet) error {
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

	return packet.Context.Send(LOGINOK)
}

func handleVersionCheck(packet *protocol.Packet) error {
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

	packet.Context.Logger().Info("",
		slog.Int("version", version),
		slog.String("clientURL", clientURL),
		slog.String("extVarsURL", extVarsURL),
	)

	return nil
}

func handleUniqueID(packet *protocol.Packet) error {
	id, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	if id == "" {
	}

	return nil
}

func handleGetInfo(packet *protocol.Packet) error {
	userID := "1"
	name := "$name"
	figure := ""
	sex := "M"
	customData := ""
	phTickets := 0
	phFigure := ""
	photoFilm := 0
	directMail := 1

	return packet.Context.Send(USEROBJ,
		protocol.String(userID),
		protocol.String(name),
		protocol.String(figure),
		protocol.String(sex),
		protocol.String(customData),
		protocol.Int(phTickets),
		protocol.String(phFigure),
		protocol.Int(photoFilm),
		protocol.Int(directMail),
	)
}

func handleGetCredits(packet *protocol.Packet) error {
	// TODO: send credits
	return nil
}

func handleGetPassword(packet *protocol.Packet) error {
	// TODO: send password
	return nil
}

func handleLangCheck(packet *protocol.Packet) error {
	return packet.Context.Send(EPSNOTIFY, protocol.RawString(""))
}

// buy game tickets
func handleBTCKS(packet *protocol.Packet) error {
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

func handleGetAvailableBadges(packet *protocol.Packet) error {
	// TODO: get available badges from storage
	badges := []protocol.Argument{}
	badges = append(badges, protocol.String("VIP"))

	chosen := []protocol.Argument{}
	index := 1
	chosen = append(chosen, protocol.Int(index))
	chosen = append(chosen, protocol.String("VIP"))

	args := make([]protocol.Argument, len(badges)+1+len(chosen)+1)
	args[0] = protocol.Int(len(badges))
	copy(args[1:], badges)
	args[len(badges)+1] = protocol.Int(len(chosen))
	copy(args[len(badges)+2:], chosen)

	return packet.Context.Send(AVAILABLEBADGES, args...)
}

func handleGetSelectedBadges(packet *protocol.Packet) error {
	// TODO: get selected badges
	return nil
}

func handleGetSessionParameters(packet *protocol.Packet) error {
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
	args[0] = protocol.Int(len(parameters))
	copy(args[1:], parameters)

	return packet.Context.Send(SESSIONPARAMETERS, args...)
}

func handlePong(packet *protocol.Packet) error {
	// TODO: pong received
	// packet.Context.Pong() to enable a timeout for the next PING?
	return nil
}

func handleGenerateKey(packet *protocol.Packet) error {
	publicKey, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleGenerateKey",
		slog.String("publicKey", publicKey),
	)

	clientPublicKey := new(big.Int)
	if _, err := fmt.Sscanf(publicKey, "%X", clientPublicKey); err != nil {
		return err
	}

	b, err := rand.Int(rand.Reader, protocol.P())
	if err != nil {
		return err
	}

	shared := new(big.Int).Exp(clientPublicKey, b, protocol.P())
	packet.Context.Crypto().Init(shared)

	serverPublicKey := new(big.Int).Exp(protocol.G(), b, protocol.P())
	content := fmt.Sprintf("%X", serverPublicKey)
	return packet.Context.Send(SERVERSECRETKEY, protocol.RawString(content))
}

func handleSSO(packet *protocol.Packet) error {
	ticket, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	// TODO: sso
	packet.Context.Logger().Info("sso",
		slog.String("ticket", ticket),
	)

	return packet.Context.Send(LOGINOK)
}

func handleInitCrypto(packet *protocol.Packet) error {
	serverToClientSecurity := 0

	return packet.Context.Send(CRYPTOPARAMETERS, protocol.Int(serverToClientSecurity))
}

func handleSecretKey(packet *protocol.Packet) error {
	// TODO: crypto

	return nil
}

func handleGetSoundSettings(packet *protocol.Packet) error {
	state := 0 // 0 - muted, 1 - max
	return packet.Context.Send(SOUNDSETTING, protocol.Int(state))
}

func handleSetSoundSettings(packet *protocol.Packet) error {
	state, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}
	// TODO: store sound state
	if state == 0 {
	}
	return nil
}

func handleGetPossibleAchievements(packet *protocol.Packet) error {
	// TODO: fetch from storage and loop
	achievements := []protocol.Argument{}

	typeID := 1
	achievements = append(achievements, protocol.Int(typeID))
	level := 1
	achievements = append(achievements, protocol.Int(level))
	badgeID := "trade"
	achievements = append(achievements, protocol.String(badgeID))

	args := make([]protocol.Argument, len(achievements)+1)
	args[0] = protocol.Int(len(achievements))
	copy(args[1:], achievements)

	return packet.Context.Send(POSSIBLEACHIEVEMENTS, args...)
}

func handleTestLatency(packet *protocol.Packet) error {
	id, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}
	return packet.Context.Send(LATENCYTEST, protocol.Int(id))
}

func handleReportLatency(packet *protocol.Packet) error {
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

	packet.Context.Logger().Info("",
		slog.Int("latency", latency),
		slog.Int("latencyCleared", latencyCleared),
		slog.Int("latencyValueCount", latencyValueCount),
	)

	return nil
}

func SendInitialCommands(ctx protocol.Context) error {
	if err := ctx.Send(HELLO); err != nil {
		return err
	}
	return nil
}
