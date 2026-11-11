package settings

import (
	"encoding/json/v2"
	"errors"
	"fmt"
	"net/mail"
	"net/url"
	"slices"
	"strings"
	"unicode/utf8"
)

var catalogue = map[string]declaration{
	"cms.refresh": declare(1, between(1, 3600)),

	"housekeeping.note": declare("", nil),

	"site.name":        declare("Holo Hotel", length(1, 30)),
	"site.shortName":   declare("Holo", length(1, 30)),
	"site.url":         declare("http://localhost:17387", origin),
	"site.maintenance": declare(false, nil),

	"site.housekeepingUrl": declare("http://localhost:18465/housekeeping", location),

	"auth.secureCookies":      declare(true, nil),
	"auth.sessionIdleMinutes": declare(30, between(5, 1440)),
	"auth.rememberDays":       declare(100, between(1, 365)),
	"auth.loginMaxFailures":   declare(5, between(1, 100)),
	"auth.loginWindowMinutes": declare(15, between(1, 1440)),
	"auth.passwordMinLength":  declare(6, between(6, 128)),
	"auth.passwordMaxLength":  declare(25, between(6, 1024)),
	"auth.resetTokenMinutes":  declare(60, between(5, 1440)),
	"auth.resetMaxActive":     declare(3, between(1, 100)),

	"registration.startCredits":     declare(500, between(0, 1_000_000)),
	"registration.maxHabbosPerUser": declare(5, between(1, 100)),
	"registration.maxPerIp":         declare(5, between(1, 1000)),
	"registration.ipWindowHours":    declare(24, between(1, 8760)),
	"registration.defaultFigure":    declare("hr-802-61.hd-190-1.ch-260-62.lg-280-110.sh-295-91.fa-1207-103", length(1, 255)),
	"registration.defaultGender":    declare("M", oneOf("M", "F")),

	"referral.enabled": declare(true, nil),
	"referral.reward":  declare(50, between(1, 1_000_000)),

	"mail.host":     declare("", nil),
	"mail.port":     declare(587, between(1, 65535)),
	"mail.username": declare("", nil),
	"mail.password": secret(declare("", nil)),
	"mail.from":     declare("", mailbox),

	"imaging.avatarUrl": declare("https://www.habbo.com/habbo-imaging/avatarimage", imager),

	"features.landingPromo":          declare(true, nil),
	"features.birthdayNotifications": declare(true, nil),
	"features.smilies":               declare(true, nil),
	"features.staffPage":             declare(true, nil),
	"features.tagFight":              declare(true, nil),
	"features.groupPurchase":         declare(true, nil),
	"features.forum":                 declare(true, nil),

	// The boxes of the staff page, in BBCode, with Holo's texts and colours.
	"staffPage.box1Heading": declare("Need our help?", length(1, 100)),
	"staffPage.box1Body":    declare(staffBox1, length(0, 5000)),
	"staffPage.box1Color":   declare("green", oneOf(staffBoxColors...)),
	"staffPage.box2Heading": declare("Joining the Team", length(1, 100)),
	"staffPage.box2Body":    declare(staffBox2, length(0, 5000)),
	"staffPage.box2Color":   declare("green", oneOf(staffBoxColors...)),

	"homes.maxItems":      declare(200, between(1, 1000)),
	"homes.noteMaxLength": declare(500, between(1, 5000)),
	"homes.maxTags":       declare(20, between(1, 100)),
	"homes.wardrobeSlots": declare(5, between(1, 20)),

	"groups.price":                declare(20, between(0, 1_000_000)),
	"groups.maxOwned":             declare(3, between(1, 100)),
	"groups.maxMemberships":       declare(10, between(1, 1000)),
	"groups.maxMembers":           declare(500, between(1, 100_000)),
	"groups.nameMaxLength":        declare(25, between(1, 100)),
	"groups.descriptionMaxLength": declare(200, between(1, 1000)),

	// The seconds a habbo waits between two new posts; 0 lets every post through.
	"forum.spamSeconds": declare(30, between(0, 3600)),

	"club.price1Month":  declare(20, between(0, 1_000_000)),
	"club.price3Months": declare(50, between(0, 1_000_000)),
	"club.price6Months": declare(80, between(0, 1_000_000)),
	"club.daysPerMonth": declare(31, between(1, 31)),

	// The most club months a user holds at once; 0 lifts the limit.
	"club.maxMonths": declare(6, between(0, 120)),

	// The boxes of the credits page, in BBCode, with Holo's texts. Their pictures
	// are part of the page, and the second box's list became lines that start
	// with "* " (decision 0105).
	"creditsPage.box1Heading": declare("What are credits?", length(1, 100)),
	"creditsPage.box1Body":    declare(creditsBox1, length(0, 5000)),
	"creditsPage.box2Heading": declare("Get credits!", length(1, 100)),
	"creditsPage.box2Body":    declare(creditsBox2, length(0, 5000)),

	// Holo's help tool took a question of any length; the port stops at the
	// forum's post limit (decision 0109).
	"help.messageMaxLength": declare(65535, between(1, 65535)),

	// The game client's session parameters, ids 0 to 9 (plans/server decision
	// 0034), and the version its VERSIONCHECK must carry (decision 0040).
	"game.clientVersion":             declare(1, between(1, 1_000_000)),
	"game.coppa":                     declare(0, between(0, 2)),
	"game.vouchers":                  declare(false, nil),
	"game.parentEmailRequest":        declare(false, nil),
	"game.parentEmailReregistration": declare(false, nil),
	"game.directMail":                declare(false, nil),
	"game.dateFormat":                declare("dd-mm-yyyy", length(1, 20)),
	"game.partnerIntegration":        declare(false, nil),
	"game.profileEditing":            declare(true, nil),
	"game.trackingHeader":            declare("", length(0, 255)),
	"game.tutorial":                  declare(false, nil),

	// How often the server pings each game client, and how long a client may
	// leave the pings unanswered before the server closes it (plans/server
	// decision 0042).
	"game.pingSeconds":        declare(30, between(1, 3600)),
	"game.pongTimeoutSeconds": declare(90, between(1, 3600)),

	// The navigator's limits, as Holo's were (plans/server decisions 0056, 0058
	// and 0061).
	"game.maxRoomsPerHabbo":  declare(50, between(1, 1000)),
	"game.maxFavouriteRooms": declare(30, between(1, 1000)),
	"game.categoryMaxRooms":  declare(30, between(1, 1000)),
	"game.searchMaxRooms":    declare(30, between(1, 1000)),

	// Rooms: how long a room ban lasts, how long the chat history is kept, and
	// the ads shown while a room loads and in it (plans/server decisions 0066,
	// 0067 and 0070).
	"game.roomBanMinutes":  declare(15, between(1, 10080)),
	"game.chatHistoryDays": declare(30, between(1, 3650)),
	"game.loadingAdImage":  declare("", optionalURL),
	"game.loadingAdLink":   declare("", optionalURL),
	"game.roomAdImage":     declare("", optionalURL),
	"game.roomAdLink":      declare("", optionalURL),

	// How many messages may wait for a client before the server closes it, as a
	// client that stopped reading (plans/server decision 0073).
	"game.outboxSize": declare(500, between(10, 100000)),

	// Chat: how far a habbo's chat is read, how long a line may be, and how
	// many habbos a habbo may ignore (plans/server decisions 0074, 0076 and
	// 0078).
	"game.chatRange":        declare(5, between(1, 50)),
	"game.chatMaxLength":    declare(100, between(10, 1000)),
	"game.maxIgnoredHabbos": declare(100, between(1, 1000)),

	// How many room event types there are, which the client names from its
	// texts roomevent_type_<n> (plans/server decision 0081).
	"game.roomEventTypes": declare(11, between(1, 50)),

	// How many spectators may watch a full room at once (plans/server
	// decision 0089).
	"game.maxSpectators": declare(50, between(1, 1000)),

	// How many furni a habbo room holds, floor furni and wall items together
	// (plans/server decision 0104).
	"game.maxRoomFurni": declare(500, between(1, 100000)),

	// How high a floor furni may stand on a stack; one that would stand
	// higher is placed there, as Holo's items_stacking_maxstackheight had it.
	"game.maxStackHeight": declare(20, between(1, 100)),

	// How many characters a present's note keeps (plans/server decision
	// 0106).
	"game.presentNoteMaxLength": declare(200, between(1, 1000)),
}

// rules check settings that depend on each other. keys lists every setting a
// rule reads, so that rows breaking the rule can go back to their defaults.
var rules = []rule{
	{
		keys: []string{"auth.passwordMinLength", "auth.passwordMaxLength"},
		check: func(values map[string]any) error {
			low, high := values["auth.passwordMinLength"].(int), values["auth.passwordMaxLength"].(int)
			if high < low {
				return fmt.Errorf("auth.passwordMaxLength: must be at least auth.passwordMinLength (%d), got %d", low, high)
			}
			return nil
		},
	},
	{
		// A timeout no longer than the interval would close a client before it
		// could answer the ping.
		keys: []string{"game.pingSeconds", "game.pongTimeoutSeconds"},
		check: func(values map[string]any) error {
			ping, timeout := values["game.pingSeconds"].(int), values["game.pongTimeoutSeconds"].(int)
			if timeout <= ping {
				return fmt.Errorf("game.pongTimeoutSeconds: must be longer than game.pingSeconds (%d), got %d", ping, timeout)
			}
			return nil
		},
	},
}

type declaration struct {
	def      any
	decode   func(literal string) (any, error)
	validate func(value any) error
	secret   bool
}

type rule struct {
	keys  []string
	check func(values map[string]any) error
}

// declare takes the setting's type from its default; a nil valid accepts every
// value of that type.
func declare[T int | bool | string](def T, valid func(T) error) declaration {
	return declaration{
		def: def,
		decode: func(literal string) (any, error) {
			var value *T
			if err := json.Unmarshal([]byte(literal), &value); err != nil {
				return nil, err
			}
			if value == nil {
				return nil, errors.New("value is null")
			}
			return *value, nil
		},
		validate: func(value any) error {
			typed, ok := value.(T)
			if !ok {
				return fmt.Errorf("expected %T, got %T", def, value)
			}
			if valid == nil {
				return nil
			}
			return valid(typed)
		},
	}
}

// secret marks a setting whose value Declared never hands out.
func secret(d declaration) declaration {
	d.secret = true
	return d
}

func between(low, high int) func(int) error {
	return func(value int) error {
		if value < low || value > high {
			return fmt.Errorf("must be between %d and %d, got %d", low, high, value)
		}
		return nil
	}
}

func length(low, high int) func(string) error {
	return func(value string) error {
		if n := utf8.RuneCountInString(value); n < low || n > high {
			return fmt.Errorf("must be %d to %d characters, got %d", low, high, n)
		}
		return nil
	}
}

// mailbox accepts an address with or without a display name, or nothing while
// no mail is configured.
func mailbox(value string) error {
	if value == "" {
		return nil
	}
	if _, err := mail.ParseAddress(value); err != nil {
		return fmt.Errorf("must be an email address, got %q", value)
	}
	return nil
}

// staffBoxColors are the colours a box of the staff page takes, as Holo's
// content tool offered them.
var staffBoxColors = []string{"red", "blue", "white", "green"}

const (
	staffBox1 = "You can find the staff members all over the hotel -- in the public rooms, their own rooms, or that dark little corner in your room. But how can you call them if you actually need them!? Easy. If it's urgent, use the Call for Help system ingame by using the blue questionmark in the right bottom of your screen. If it isn't urgent, use the Help Tool on the website."
	staffBox2 = "So you want that sexy staff badge next to your name in the hotel and on the site? Do you want to join Holo Hotel's moderation team? Keep your eyes focused on this section and the news -- if we're looking for staff it will be announced there, and surely you won't miss it!"
)

const (
	creditsBox1 = "Credits are the hotel's currency. You can use them to buy all kinds of things, from rubber ducks and sofas, to Habbo Club membership, jukeboxes and teleports."
	creditsBox2 = "To buy furniture or play games, you need [b]credits[/b]. We provide you with free credits on registration, and if you run out, there are several ways you can earn more credits:\n" +
		"* Refer a friend to the hotel and earn credits\n" +
		"* Ask a staff member ingame\n" +
		"* Redeem a voucher if you have one\n" +
		"* Trade your furniture with others for credit furniture"
)

func oneOf(allowed ...string) func(string) error {
	return func(value string) error {
		if !slices.Contains(allowed, value) {
			return fmt.Errorf("must be one of %v, got %q", allowed, value)
		}
		return nil
	}
}

// imager requires a URL without a query because the Avatar primitive appends
// ?figure=… to it.
func imager(value string) error {
	u, err := url.Parse(value)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" ||
		u.RawQuery != "" || u.Fragment != "" || u.User != nil {
		return fmt.Errorf("must be an http or https URL without a query, like https://example.com/avatarimage, got %q", value)
	}
	return nil
}

// location accepts a path on this site or an http or https URL, because a
// housekeeping running alone has its own port.
func location(value string) error {
	if strings.HasPrefix(value, "/") && !strings.HasPrefix(value, "//") {
		return nil
	}
	u, err := url.Parse(value)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		return fmt.Errorf("must be a path or an http or https URL, got %q", value)
	}
	return nil
}

// optionalURL accepts an empty value, for none, or an absolute http or https URL, which the game client loads as it
// is.
func optionalURL(value string) error {
	if value == "" {
		return nil
	}
	u, err := url.Parse(value)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		return fmt.Errorf("must be empty or an http or https URL, got %q", value)
	}
	return nil
}

// origin requires a bare origin because links are built by appending a path
// such as /reset/<token> to it.
func origin(value string) error {
	u, err := url.Parse(value)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" ||
		u.Path != "" || u.RawQuery != "" || u.Fragment != "" || u.User != nil {
		return fmt.Errorf("must be an http or https origin without a path, like https://example.com, got %q", value)
	}
	return nil
}
