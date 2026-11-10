package r26

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// The messages of hh_entry_init the server sends (plans/server/reference/r26/hh_entry_init.md). hello opens every
// session, and the client sends nothing before it.
const (
	hello             = 0
	loginOK           = 3
	errorText         = 33
	sessionParameters = 257
	cryptoParameters  = 277
	endOfCryptoParams = 278
	hotelLogout       = 287
)

// The texts of 33 the client acts on, and the reason of 287 on which it opens url_logout_concurrent.
const (
	loginIncorrect    = "login incorrect"
	versionNotCorrect = "Version not correct"
	logoutConcurrent  = 2
)

// entryInitHandlers handles the commands of the handshake and the login. GENERATEKEY has no handler: it comes after
// ENDOFCRYPTOPARAMS, changes nothing, and is logged as unhandled (plans/server decision 0027).
var entryInitHandlers = map[int]handler{
	204:  handleSSO,
	206:  handleInitCrypto,
	756:  handleTryLogin,
	813:  handleUniqueID,
	1170: handleVersionCheck,
	1817: handleGetSessionParameters,
}

// handleInitCrypto answers CRYPTOPARAMETERS 0 and ENDOFCRYPTOPARAMS at once, so that the client sends plain bytes
// (plans/server decisions 0012 and 0027).
func handleInitCrypto(s *session, _ []byte) {
	s.reply(cryptoParameters, vl64(0))
	s.reply(endOfCryptoParams, nil)
}

// handleVersionCheck lets the client log in when it carries the version game.clientVersion holds and two URLs that are
// empty or on site.url; any other client gets 33 Version not correct and is closed (plans/server decisions 0033, 0041
// and 0049).
func handleVersionCheck(s *session, body []byte) {
	if !versionPasses(body) {
		s.turnAway()
		return
	}
	s.checked = true
}

func versionPasses(body []byte) bool {
	r := bytes.NewReader(body)
	version, err := encoding.ReadVL64(r)
	if err != nil {
		return false
	}
	clientURL, err := encoding.ReadB64String(r)
	if err != nil {
		return false
	}
	variablesURL, err := encoding.ReadB64String(r)
	if err != nil {
		return false
	}
	return int(version) == settings.GetInt("game.clientVersion") && onSite(clientURL) && onSite(variablesURL)
}

// onSite reports whether url is empty or on the site. site.url is an origin, so a URL on it is site.url itself or
// site.url and a slash: http://localhost:17387.example.com is not on http://localhost:17387.
func onSite(url string) bool {
	site := settings.GetString("site.url")
	return url == "" || url == site || strings.HasPrefix(url, site+"/")
}

func (s *session) turnAway() {
	s.reply(errorText, []byte(versionNotCorrect))
	s.end()
}

// handleUniqueID keeps the machine id until the login saves it with the habbo (plans/server decision 0035).
func handleUniqueID(s *session, body []byte) {
	id, err := encoding.ReadB64String(bytes.NewReader(body))
	if err != nil {
		s.malformed(813, body)
		return
	}
	s.machineID = id
}

// handleGetSessionParameters sends the ten session parameters, ids 0 to 9, from their settings; a flag goes out as 0
// or 1 (plans/server decision 0034).
func handleGetSessionParameters(s *session, _ []byte) {
	values := []any{
		settings.GetInt("game.coppa"),
		settings.GetBool("game.vouchers"),
		settings.GetBool("game.parentEmailRequest"),
		settings.GetBool("game.parentEmailReregistration"),
		settings.GetBool("game.directMail"),
		settings.GetString("game.dateFormat"),
		settings.GetBool("game.partnerIntegration"),
		settings.GetBool("game.profileEditing"),
		settings.GetString("game.trackingHeader"),
		settings.GetBool("game.tutorial"),
	}
	var b bytes.Buffer
	b.Write(vl64(len(values)))
	for id, value := range values {
		b.Write(vl64(id))
		switch value := value.(type) {
		case int:
			b.Write(vl64(value))
		case bool:
			b.Write(vl64(flag(value)))
		case string:
			if err := encoding.WriteString(&b, value); err != nil {
				slog.Error(fmt.Sprintf("r26 %s: session parameter %d: %v", s.addr, id, err))
				return
			}
		}
	}
	s.reply(sessionParameters, b.Bytes())
}

// handleSSO logs in the habbo of the ticket through game and answers LOGIN_OK, or 33 login incorrect for a ticket that
// is not valid (plans/server decisions 0028 and 0030). A session logs in once, and only after its version check.
func handleSSO(s *session, body []byte) {
	if s.habbo != 0 {
		return
	}
	if !s.checked {
		s.turnAway()
		return
	}
	ticket, err := encoding.ReadB64String(bytes.NewReader(body))
	if err != nil {
		s.malformed(204, body)
		s.reply(errorText, []byte(loginIncorrect))
		return
	}
	h, err := game.Login(context.Background(), s.db, s, ticket, s.machineID)
	switch {
	case errors.Is(err, game.ErrInvalidTicket):
		s.reply(errorText, []byte(loginIncorrect))
	case err != nil:
		slog.Error(fmt.Sprintf("r26 %s: %v", s.addr, err))
		s.end()
	default:
		s.habbo = h.ID
		s.reply(loginOK, nil)
	}
}

// handleTryLogin refuses every name and password: a habbo logs in only with SSO (plans/server decision 0028).
func handleTryLogin(s *session, _ []byte) {
	s.reply(errorText, []byte(loginIncorrect))
}

// reply sends a message and logs a failure: a broken connection also fails the session's next read.
func (s *session) reply(id int, body []byte) {
	if err := s.send(id, body); err != nil {
		slog.Warn(fmt.Sprintf("r26 %s: %v", s.addr, err))
	}
}

// malformed logs a command whose body cannot be read, as an unhandled one is logged: never its body.
func (s *session) malformed(id int, body []byte) {
	slog.Warn(fmt.Sprintf("r26 %s malformed %s, %s", s.addr, command(id), size(len(body))))
}

func vl64(v int) []byte {
	var b bytes.Buffer
	// Writing to a bytes.Buffer never fails, and every int the server sends fits the client's 32 bits.
	_ = encoding.WriteVL64(&b, int32(v))
	return b.Bytes()
}

func flag(v bool) int {
	if v {
		return 1
	}
	return 0
}

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
