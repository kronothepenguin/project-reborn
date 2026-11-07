package r26

// hello is the message that opens every session. The client sends nothing before it.
const hello = 0

// entryInitCommands names the commands of hh_entry_init by id, as its Login Handler and Opening Hours Handler register
// them (plans/server/reference/r26/hh_entry_init.md).
var entryInitCommands = map[int]string{
	7:    "GET_INFO",
	8:    "GET_CREDITS",
	47:   "GET_PASSWORD",
	58:   "LANGCHECK",
	105:  "BTCKS",
	157:  "GETAVAILABLEBADGES",
	159:  "GETSELECTEDBADGES",
	196:  "PONG",
	204:  "SSO",
	206:  "INIT_CRYPTO",
	207:  "SECRETKEY",
	212:  "GET_AVAILABILITY_TIME",
	228:  "GET_SOUND_SETTING",
	229:  "SET_SOUND_SETTING",
	315:  "TEST_LATENCY",
	316:  "REPORT_LATENCY",
	370:  "GET_POSSIBLE_ACHIEVEMENTS",
	756:  "TRY_LOGIN",
	813:  "UNIQUEID",
	1170: "VERSIONCHECK",
	1817: "GET_SESSION_PARAMETERS",
	2002: "GENERATEKEY",
}
