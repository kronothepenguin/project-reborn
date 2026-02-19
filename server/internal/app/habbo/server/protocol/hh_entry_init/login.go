package hhentryinit

import (
	"errors"
	"fmt"
	"io"
	"log/slog"
	"strconv"

	"github.com/kronothepenguin/project-reborn/internal/app/habbo/server/protocol"
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

	packet.Context.Logger().Debug(
		"handleTryLogin",
		slog.String("username", username),
		slog.String("password", password),
	)

	// do not allow client login for now, only sso is available
	return packet.Context.Send(ERR, protocol.RawString("login incorrect"))
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

	packet.Context.Logger().Debug(
		"handleVersionCheck",
		slog.Int("version", version),
		slog.String("clientURL", clientURL),
		slog.String("extVarsURL", extVarsURL),
	)

	// TODO: check version and send packet.Context.Send(ERR, protocol.RawString("Version not correct"))

	return nil
}

func handleUniqueID(packet *protocol.Packet) error {
	machineID, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleUniqueID",
		slog.String("machineID", machineID),
	)

	// TODO: verify ban and save machineID in context

	return nil
}

func handleGetInfo(packet *protocol.Packet) error {
	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleGetInfo habbo is nil")
	}

	habbo.Mu.RLock()
	habboID := strconv.Itoa(habbo.ID)
	habboName := habbo.Name
	habboFigure := habbo.Figure
	habboSex := habbo.Sex
	habboCustomData := habbo.CustomData
	habboPHTickets := habbo.PHTickets
	habboPHFigure := habbo.PHFigure
	habboPhotoFilm := habbo.PhotoFilm
	habboDirectMail := habbo.DirectMail
	habboRights := habbo.Rights
	habbo.Mu.RUnlock()

	packet.Context.Logger().Debug(
		"handleGetInfo",
		slog.String("userID", habboID),
		slog.String("name", habboName),
		slog.String("figure", habboFigure),
		slog.String("sex", habboSex),
		slog.String("customData", habboCustomData),
		slog.Int("phTickets", habboPHTickets),
		slog.String("phFigure", habboPHFigure),
		slog.Int("photoFilm", habboPhotoFilm),
		slog.Int("directMail", habboDirectMail),
	)

	var rights []io.WriterTo
	for _, fuse := range habboRights {
		rights = append(rights, protocol.String(fuse))
	}

	return errors.Join(
		packet.Context.Send(RIGHTS, []io.WriterTo(rights)...),
		packet.Context.Send(
			USEROBJ,
			protocol.String(habboID),
			protocol.String(habboName),
			protocol.String(habboFigure),
			protocol.String(habboSex),
			protocol.String(habboCustomData),
			protocol.Int(habboPHTickets),
			protocol.String(habboPHFigure),
			protocol.Int(habboPhotoFilm),
			protocol.Int(habboDirectMail),
		),
	)
}

func handleGetCredits(packet *protocol.Packet) error {
	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleGetCredits habbo is nil")
	}

	habbo.Mu.RLock()
	credits := strconv.Itoa(habbo.Credits)
	habbo.Mu.RUnlock()

	packet.Context.Logger().Debug(
		"handleGetCredits",
		slog.String("credits", credits),
	)

	return packet.Context.Send("PURSE", protocol.RawString(credits))
}

func handleGetPassword(packet *protocol.Packet) error {
	// client doesn't even send this command

	packet.Context.Logger().Debug("handleGetPassword")

	return errors.New("handleGetPassword this command doesn't exists")
}

func handleLangCheck(packet *protocol.Packet) error {
	word, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleLangCheck",
		slog.String("word", word),
	)

	return nil
}

func handleBTCKS(packet *protocol.Packet) error {
	// TODO: it seems this is a dead code in the lingo source
	amount, err := packet.Message.ReadInt()
	if err != nil {
		return nil
	}

	name, err := packet.Message.ReadString()
	if err != nil {
		return nil
	}

	packet.Context.Logger().Debug(
		"handleBTCKS",
		slog.Int("amount", amount),
		slog.String("name", name),
	)

	// TODO: if name != my name then gift
	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleBTCKS habbo is nil")
	}

	habbo.Mu.Lock()
	habbo.PHTickets += amount
	habbo.Credits -= amount // TODO: amount*ticketPrice
	habbo.Mu.Unlock()

	return packet.Context.Send("PURSE", protocol.RawString(strconv.Itoa(habbo.Credits)))
}

func handleGetAvailableBadges(packet *protocol.Packet) error {
	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleGetAvailableBadges habbo is nil")
	}

	habbo.Mu.RLock()
	habboBadges := habbo.Badges
	habbo.Mu.RUnlock()

	packet.Context.Logger().Debug(
		"handleGetAvailableBadges",
		slog.String("badges", fmt.Sprint(habboBadges)),
	)

	var args []io.WriterTo
	args = append(args, protocol.Int(len(habboBadges)))
	for _, badgeID := range habboBadges {
		args = append(args, protocol.String(badgeID))
	}

	// chosen badges seems to be code for the next version
	args = append(args, protocol.Int(0))

	return packet.Context.Send(AVAILABLEBADGES, args...)
}

func handleGetSelectedBadges(packet *protocol.Packet) error {
	// client calls this when receive ACHIEVEMENTNOTIFICATION
	packet.Context.Logger().Debug("handleGetSelectedBadges")

	return nil
}

func handleGetSessionParameters(packet *protocol.Packet) error {
	config := packet.Context.Hotel().Settings

	packet.Context.Logger().Debug(
		"handleGetSessionParameters",
		slog.String("parameters", fmt.Sprintf("%+v", config)),
	)

	var args []io.WriterTo
	args = append(
		args,
		protocol.Int(0), protocol.Int(config.Coppa),
		protocol.Int(1), protocol.Int(config.Voucher),
		protocol.Int(2), protocol.Int(config.ParentEmailRequest),
		protocol.Int(3), protocol.Int(config.ParentEmailRequestReregistration),
		protocol.Int(4), protocol.Int(config.AllowDirectMail),
		protocol.Int(5), protocol.String(config.DateFormat),
		protocol.Int(6), protocol.Int(config.PartnerIntegration),
		protocol.Int(7), protocol.Int(config.ProfileEditing),
		protocol.Int(8), protocol.String(config.TrackingHeader),
		protocol.Int(9), protocol.Int(config.TutorialEnabled),
	)

	return packet.Context.Send(SESSIONPARAMETERS, args...)
}

func handlePong(packet *protocol.Packet) error {
	// TODO: pong received
	// packet.Context.Pong() to enable a timeout for the next PING?
	packet.Context.Logger().Debug("handlePong")

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

	return packet.Context.Send(ENDOFCRYPTOPARAMS)

	// clientPublicKey := new(big.Int)
	// if _, err := fmt.Sscanf(publicKey, "%X", clientPublicKey); err != nil {
	// 	return err
	// }

	// b, err := rand.Int(rand.Reader, protocol.P())
	// if err != nil {
	// 	return err
	// }

	// shared := new(big.Int).Exp(clientPublicKey, b, protocol.P())
	// packet.Context.Crypto().Init(shared)

	// serverPublicKey := new(big.Int).Exp(protocol.G(), b, protocol.P())
	// content := fmt.Sprintf("%X", serverPublicKey)
	// return packet.Context.Send(SERVERSECRETKEY, protocol.RawString(content))
}

func handleSSO(packet *protocol.Packet) error {
	ticket, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleSSO",
		slog.String("ticket", ticket),
	)

	habbo, err := packet.Context.Hotel().Login(ticket)
	if err != nil {
		return err
	}
	packet.Context.SetHabbo(habbo)

	return packet.Context.Send(LOGINOK)
}

func handleInitCrypto(packet *protocol.Packet) error {
	// shockwave client has dead code and missing ccts it will fail if serverToClient equals 1
	serverToClientSecurity := 0

	packet.Context.Logger().Debug(
		"handleInitCrypto",
		slog.Int("serverToClientSecurity", serverToClientSecurity),
	)

	return packet.Context.Send(CRYPTOPARAMETERS, protocol.Int(serverToClientSecurity))
}

func handleSecretKey(packet *protocol.Packet) error {
	// TODO: crypto
	packet.Context.Logger().Debug("handleSecretKey")

	return nil
}

func handleGetSoundSettings(packet *protocol.Packet) error {
	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleGetSoundSettings habbo is nil")
	}

	habbo.Mu.RLock()
	state := habbo.SoundState
	habbo.Mu.RUnlock()

	packet.Context.Logger().Debug(
		"handleGetSoundSettings",
		slog.Int("state", state),
	)

	return packet.Context.Send(SOUNDSETTING, protocol.Int(state))
}

func handleSetSoundSettings(packet *protocol.Packet) error {
	state, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleSetSoundSettings",
		slog.Int("state", state),
	)

	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleSetSoundSettings habbo is nil")
	}

	habbo.Mu.Lock()
	habbo.SoundState = state
	habbo.Mu.Unlock()

	return nil
}

func handleGetPossibleAchievements(packet *protocol.Packet) error {
	habbo := packet.Context.Habbo()
	if habbo == nil {
		return errors.New("handleGetPossibleAchievements habbo is nil")
	}

	habbo.Mu.RLock()
	habboAchievements := habbo.Achievements
	habbo.Mu.RUnlock()

	packet.Context.Logger().Debug(
		"handleGetPossibleAchievements",
		slog.String("achievements", fmt.Sprint(habboAchievements)),
	)

	var args []io.WriterTo
	args = append(args, protocol.Int(len(habboAchievements)))
	for _, achievement := range habboAchievements {
		args = append(
			args,
			protocol.Int(achievement.TypeID),
			protocol.Int(achievement.Level),
			protocol.String(achievement.BadgeID),
		)
	}

	return packet.Context.Send(POSSIBLEACHIEVEMENTS, args...)
}

func handleTestLatency(packet *protocol.Packet) error {
	id, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Context.Logger().Debug(
		"handleTestLatency",
		slog.Int("id", id),
	)

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

	packet.Context.Logger().Debug(
		"handleReportLatency",
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
