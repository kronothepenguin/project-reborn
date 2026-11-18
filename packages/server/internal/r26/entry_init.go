package r26

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// The messages of hh_entry_init the server sends (packages/server/knowledge/r26/hh_entry_init.md). hello opens every
// session, and the client sends nothing before it.
const (
	hello                = 0
	rights               = 2
	loginOK              = 3
	userObject           = 5
	errorText            = 33
	ping                 = 50
	availableBadges      = 229
	sessionParameters    = 257
	cryptoParameters     = 277
	endOfCryptoParams    = 278
	hotelLogout          = 287
	soundSetting         = 308
	latencyTest          = 354
	possibleAchievements = 436
)

// purse is hh_cat_code's message, which GET_CREDITS asks for (packages/server/knowledge/r26/hh_cat_code.md).
const purse = 6

// The texts of 33 the client acts on, and the reason of 287 on which it opens url_logout_concurrent.
const (
	loginIncorrect    = "login incorrect"
	versionNotCorrect = "Version not correct"
	logoutConcurrent  = 2
)

// entryInitHandlers handles the commands of the handshake, the login and what the client asks after it. GENERATEKEY has
// no handler: it comes after ENDOFCRYPTOPARAMS, changes nothing, and is logged as unhandled (decision
// server/0027). GETSELECTEDBADGES waits for achievements (decision server/0051).
var entryInitHandlers = map[int]handler{
	7:    loggedIn(handleGetInfo),
	8:    loggedIn(handleGetCredits),
	157:  loggedIn(handleGetAvailableBadges),
	196:  handlePong,
	204:  handleSSO,
	206:  handleInitCrypto,
	228:  loggedIn(handleGetSoundSetting),
	229:  loggedIn(handleSetSoundSetting),
	315:  handleTestLatency,
	316:  handleReportLatency,
	370:  loggedIn(handleGetPossibleAchievements),
	756:  handleTryLogin,
	813:  handleUniqueID,
	1170: handleVersionCheck,
	1817: handleGetSessionParameters,
}

// handleInitCrypto answers CRYPTOPARAMETERS 0 and ENDOFCRYPTOPARAMS at once, so that the client sends plain bytes
// (decisions server/0012 and server/0027).
func handleInitCrypto(s *session, _ []byte) {
	s.reply(cryptoParameters, vl64(0))
	s.reply(endOfCryptoParams, nil)
}

// handleVersionCheck lets the client log in when it carries the version game.clientVersion holds, wherever it was
// loaded from; any other client gets 33 Version not correct and is closed (decisions server/0033 and server/0049).
func handleVersionCheck(s *session, body []byte) {
	if !versionPasses(s.db, body) {
		s.turnAway()
		return
	}
	s.checked = true
}

// versionPasses reads the whole check, the version and the client's two URLs, and compares the version alone.
func versionPasses(db *sql.DB, body []byte) bool {
	r := bytes.NewReader(body)
	version, err := encoding.ReadVL64(r)
	if err != nil {
		return false
	}
	for range 2 {
		if _, err := encoding.ReadB64String(r); err != nil {
			return false
		}
	}
	return int(version) == settings.Int(context.Background(), store.New(db), "game.clientVersion")
}

func (s *session) turnAway() {
	s.reply(errorText, []byte(versionNotCorrect))
	s.end()
}

// handleUniqueID keeps the machine id until the login saves it with the habbo (decision server/0035).
func handleUniqueID(s *session, body []byte) {
	id, err := encoding.ReadB64String(bytes.NewReader(body))
	if err != nil {
		s.malformed(813, body)
		return
	}
	s.machineID = id
}

// handleGetSessionParameters sends the ten session parameters, ids 0 to 9, from their settings; a flag goes out as 0
// or 1 (decision server/0034).
func handleGetSessionParameters(s *session, _ []byte) {
	ctx, q := context.Background(), store.New(s.db)
	values := []any{
		settings.Int(ctx, q, "game.coppa"),
		settings.Bool(ctx, q, "game.vouchers"),
		settings.Bool(ctx, q, "game.parentEmailRequest"),
		settings.Bool(ctx, q, "game.parentEmailReregistration"),
		settings.Bool(ctx, q, "game.directMail"),
		settings.String(ctx, q, "game.dateFormat"),
		settings.Bool(ctx, q, "game.partnerIntegration"),
		settings.Bool(ctx, q, "game.profileEditing"),
		settings.String(ctx, q, "game.trackingHeader"),
		settings.Bool(ctx, q, "game.tutorial"),
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

// handleSSO logs in the habbo of the ticket through game and answers its fuses, then LOGIN_OK, as Holo did, so that the
// listeners of LOGIN_OK find the rights in place; or 33 login incorrect for a ticket that is not valid (decisions
// server/0028, server/0030 and server/0045). A session logs in once, and only after its version check.
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
	if !s.loadShared() {
		return
	}
	h, err := game.Login(context.Background(), s.db, s, ticket, s.machineID)
	switch {
	case errors.Is(err, game.ErrInvalidTicket):
		s.reply(errorText, []byte(loginIncorrect))
	case err != nil:
		s.fail(err)
	default:
		s.habbo = h.ID
		var b bytes.Buffer
		for _, fuse := range h.Fuses {
			if err := encoding.WriteString(&b, fuse); err != nil {
				slog.Error(fmt.Sprintf("r26 %s: fuse %q: %v", s.addr, fuse, err))
			}
		}
		s.reply(rights, b.Bytes())
		s.reply(loginOK, nil)
	}
}

// loggedIn runs h only once the session's habbo is online on it: the client asks these after LOGIN_OK.
func loggedIn(h func(s *session, me habbo.Habbo, body []byte)) handler {
	return func(s *session, body []byte) {
		me, ok := habbo.Get(s.habbo)
		if s.habbo == 0 || !ok || me.Session != s {
			return
		}
		h(s, me, body)
	}
}

// handleGetInfo sends the user object. The user id is the habbo's, the custom data its motto, and the direct mail
// whether its user takes the newsletter. The pool figure stays empty until a phase brings the pool.
func handleGetInfo(s *session, me habbo.Habbo, _ []byte) {
	account, err := game.UserAccount(context.Background(), s.db, me.UserID)
	if err != nil {
		s.fail(err)
		return
	}
	s.sendUserObject(me, account)
}

// sendUserObject writes 5, the user object, which the client reads after the login and again on each change of the
// habbo's look or motto: it keeps the figure, the sex and the motto in its session and redraws its entry bar.
func (s *session) sendUserObject(me habbo.Habbo, account game.Account) {
	var b bytes.Buffer
	for _, field := range []any{
		strconv.FormatInt(me.ID, 10), me.Name, me.Figure, me.Gender, me.Motto,
		int(account.Tickets), "", int(account.Film), flag(account.Newsletter),
	} {
		if err := writeField(&b, field); err != nil {
			s.fail(err)
			return
		}
	}
	s.reply(userObject, b.Bytes())
}

// handleGetCredits sends the credits of the habbo's user as text, the first word of 6, which hh_cat_code reads.
func handleGetCredits(s *session, me habbo.Habbo, _ []byte) {
	account, err := game.UserAccount(context.Background(), s.db, me.UserID)
	if err != nil {
		s.fail(err)
		return
	}
	s.reply(purse, []byte(strconv.FormatInt(account.Credits, 10)))
}

// handleGetAvailableBadges sends the habbo's badges, then those it wears, each with its slot, 1 to 5 (decision
// server/0083).
func handleGetAvailableBadges(s *session, me habbo.Habbo, _ []byte) {
	var b bytes.Buffer
	b.Write(vl64(len(me.Badges)))
	for _, badge := range me.Badges {
		if err := encoding.WriteString(&b, badge); err != nil {
			s.fail(err)
			return
		}
	}
	b.Write(wornBadges(me.Worn))
	s.reply(availableBadges, b.Bytes())
}

// wornBadges writes the badges a habbo wears as 229 and 228 carry them: their count, then each one's slot and code.
func wornBadges(worn [5]string) []byte {
	var b []byte
	n := 0
	for i, code := range worn {
		if code != "" {
			b = append(append(b, vl64(i+1)...), str(code)...)
			n++
		}
	}
	return append(vl64(n), b...)
}

func handleGetSoundSetting(s *session, me habbo.Habbo, _ []byte) {
	s.reply(soundSetting, vl64(flag(me.SoundEnabled)))
}

// handleSetSoundSetting saves the setting, 1 on and 0 off; any other value counts as on, as the client reads 308.
func handleSetSoundSetting(s *session, me habbo.Habbo, body []byte) {
	state, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(229, body)
		return
	}
	if err := game.SetSoundEnabled(context.Background(), s.db, s, me.ID, state != 0); err != nil {
		s.fail(err)
	}
}

// handleGetPossibleAchievements sends no achievement: the hotel has none yet (decision server/0051).
func handleGetPossibleAchievements(s *session, _ habbo.Habbo, _ []byte) {
	s.reply(possibleAchievements, vl64(0))
}

// handlePong keeps the session alive (decision server/0042).
func handlePong(s *session, _ []byte) {
	s.lastPong.Store(time.Now().UnixNano())
}

// handleTestLatency answers the client's latency test with the id it sent.
func handleTestLatency(s *session, body []byte) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(315, body)
		return
	}
	s.reply(latencyTest, vl64(int(id)))
}

// handleReportLatency writes the client's latency to the log, and saves nothing (decision server/0036): the mean
// of every round trip, the mean of those below twice it, and how many answers both count.
func handleReportLatency(s *session, body []byte) {
	r := bytes.NewReader(body)
	var values [3]int32
	for i := range values {
		v, err := encoding.ReadVL64(r)
		if err != nil {
			s.malformed(316, body)
			return
		}
		values[i] = v
	}
	slog.Info(fmt.Sprintf("r26 %s latency: mean %d ms, %d ms below twice the mean, %d answers", s.addr, values[0], values[1], values[2]))
}

// writeField writes a field of a message as the client's GetStrFrom and GetIntFrom read it.
func writeField(b *bytes.Buffer, field any) error {
	switch field := field.(type) {
	case string:
		return encoding.WriteString(b, field)
	case int:
		b.Write(vl64(field))
	}
	return nil
}

// fail logs a failure of the database or of a value the client cannot read, and closes the session.
func (s *session) fail(err error) {
	slog.Error(fmt.Sprintf("r26 %s: %v", s.addr, err))
	s.end()
}

// handleTryLogin refuses every name and password: a habbo logs in only with SSO (decision server/0028).
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
// them (packages/server/knowledge/r26/hh_entry_init.md).
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
