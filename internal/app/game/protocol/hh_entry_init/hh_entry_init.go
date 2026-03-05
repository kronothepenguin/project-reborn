package hhentryinit

import "github.com/kronothepenguin/project-reborn/internal/app/game/protocol"

// RegisterLogin registers handlers for the pre-authentication phase.
func RegisterLogin(registry protocol.Registry) {
	registry.Commands().Register(DISCONNECT, -1)
	registry.Commands().Register(HELLO, 0)
	registry.Commands().Register(SERVERSECRETKEY, 1)
	registry.Commands().Register(ERR, 33)
	registry.Commands().Register(USERBANNED, 35)
	registry.Commands().Register(CRYPTOPARAMETERS, 277)
	registry.Commands().Register(ENDOFCRYPTOPARAMS, 278)
	registry.Commands().Register(LOGINOK, 3)

	registry.Listeners().Register(756, handleTryLogin)
	registry.Listeners().Register(1170, handleVersionCheck)
	registry.Listeners().Register(813, handleUniqueID)
	registry.Listeners().Register(58, handleLangCheck)
	registry.Listeners().Register(2002, handleGenerateKey)
	registry.Listeners().Register(204, handleSSO)
	registry.Listeners().Register(206, handleInitCrypto)
	registry.Listeners().Register(207, handleSecretKey)

	registerOpeningHours(registry)
}

// RegisterSession registers handlers for the post-authentication phase.
func RegisterSession(registry protocol.Registry) {
	registry.Commands().Register(RIGHTS, 2)
	registry.Commands().Register(USEROBJ, 5)
	registry.Commands().Register(PING, 50)
	registry.Commands().Register(EPSNOTIFY, 52)
	registry.Commands().Register(SYSTEMBROADCAST, 139)
	registry.Commands().Register(CHECKSUM, 141)
	registry.Commands().Register(MODALERT, 161)
	registry.Commands().Register(AVAILABLEBADGES, 229)
	registry.Commands().Register(SESSIONPARAMETERS, 257)
	registry.Commands().Register(HOTELLOGOUT, 287)
	registry.Commands().Register(SOUNDSETTING, 308)
	registry.Commands().Register(POSSIBLEACHIEVEMENTS, 436)
	registry.Commands().Register(ACHIEVEMENTNOTIFICATION, 437)
	registry.Commands().Register(LATENCYTEST, 354)

	registry.Listeners().Register(7, handleGetInfo)
	registry.Listeners().Register(8, handleGetCredits)
	registry.Listeners().Register(47, handleGetPassword)
	registry.Listeners().Register(105, handleBTCKS)
	registry.Listeners().Register(157, handleGetAvailableBadges)
	registry.Listeners().Register(159, handleGetSelectedBadges)
	registry.Listeners().Register(1817, handleGetSessionParameters)
	registry.Listeners().Register(196, handlePong)
	registry.Listeners().Register(228, handleGetSoundSettings)
	registry.Listeners().Register(229, handleSetSoundSettings)
	registry.Listeners().Register(370, handleGetPossibleAchievements)
	registry.Listeners().Register(315, handleTestLatency)
	registry.Listeners().Register(316, handleReportLatency)
}
