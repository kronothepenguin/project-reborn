package settings

import (
	"fmt"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestCatalogueKeysAreNotConfigKeys(t *testing.T) {
	if len(configKeys) == 0 {
		t.Fatal("found no config keys")
	}
	for key := range configKeys {
		if _, ok := catalogue[key]; ok {
			t.Errorf("%s is both a config.json key and a declared setting", key)
		}
	}
}

func TestEveryDefaultPassesItsChecksAndTheRules(t *testing.T) {
	defaults := make(map[string]any, len(catalogue))
	for key, d := range catalogue {
		if err := d.validate(d.def); err != nil {
			t.Errorf("%s: the default %#v is refused: %v", key, d.def, err)
		}
		defaults[key] = d.def
	}
	for _, r := range rules {
		if err := r.check(defaults); err != nil {
			t.Errorf("the defaults break a rule: %v", err)
		}
	}
}

func TestHousekeepingURLTakesAPathOrAURL(t *testing.T) {
	for value, valid := range map[string]bool{
		"/housekeeping":                  true,
		"http://localhost:18000/hk":      true,
		"https://staff.example.com":      true,
		"":                               false,
		"housekeeping":                   false,
		"//evil.example.com":             false,
		"javascript:alert(1)":            false,
		"ftp://example.com/housekeeping": false,
	} {
		if err := location(value); valid != (err == nil) {
			t.Errorf("location(%q) = %v, want valid %t", value, err, valid)
		}
	}
}

// Holo wrote the club's prices, its days and the wardrobe's slots in its code,
// and kept the month limit and the credits page's boxes in cms_content.
func TestTheEconomySettingsHoldHolosValues(t *testing.T) {
	q := store.New(openDB(t))

	assertValues(t, q, map[string]any{
		"club.price1Month":        20,
		"club.price3Months":       50,
		"club.price6Months":       80,
		"club.daysPerMonth":       31,
		"club.maxMonths":          6,
		"homes.wardrobeSlots":     5,
		"creditsPage.box1Heading": "What are credits?",
		"creditsPage.box1Body":    "Credits are the hotel's currency. You can use them to buy all kinds of things, from rubber ducks and sofas, to Habbo Club membership, jukeboxes and teleports.",
		"creditsPage.box2Heading": "Get credits!",
		// Holo's credits2 without the palm chair, which belongs to the page, and
		// with each item of its list on a line of its own (decision holo-port/0105).
		"creditsPage.box2Body": "To buy furniture or play games, you need [b]credits[/b]. We provide you with free credits on registration, and if you run out, there are several ways you can earn more credits:\n" +
			"* Refer a friend to the hotel and earn credits\n" +
			"* Ask a staff member ingame\n" +
			"* Redeem a voucher if you have one\n" +
			"* Trade your furniture with others for credit furniture",
	})
}

// The bounds are the port's own, since Holo wrote the numbers in its code and
// took any text; the credits boxes take the lengths of the staff boxes.
func TestTheEconomySettingsKeepTheirBounds(t *testing.T) {
	validate := func(key string, value any) error {
		d, ok := catalogue[key]
		if !ok {
			return fmt.Errorf("%s is not declared", key)
		}
		return d.validate(value)
	}
	edges := func(bounds [2]int) map[int]bool {
		return map[int]bool{bounds[0] - 1: false, bounds[0]: true, bounds[1]: true, bounds[1] + 1: false}
	}

	for key, bounds := range map[string][2]int{
		"club.price1Month":    {0, 1_000_000},
		"club.price3Months":   {0, 1_000_000},
		"club.price6Months":   {0, 1_000_000},
		"club.daysPerMonth":   {1, 31},
		"club.maxMonths":      {0, 120},
		"homes.wardrobeSlots": {1, 20},
	} {
		for value, valid := range edges(bounds) {
			if err := validate(key, value); valid != (err == nil) {
				t.Errorf("%s = %d: %v, want valid %t", key, value, err, valid)
			}
		}
	}
	for key, bounds := range map[string][2]int{
		"creditsPage.box1Heading": {1, 100},
		"creditsPage.box2Heading": {1, 100},
		"creditsPage.box1Body":    {0, 5000},
		"creditsPage.box2Body":    {0, 5000},
	} {
		for n, valid := range edges(bounds) {
			if n < 0 {
				continue
			}
			if err := validate(key, strings.Repeat("x", n)); valid != (err == nil) {
				t.Errorf("%s of %d characters: %v, want valid %t", key, n, err, valid)
			}
		}
	}
}

// Holo's help tool took a question of any length; the port stops at the
// forum's post limit (decision holo-port/0109).
func TestTheHelpSettingStopsAtTheForumsLimit(t *testing.T) {
	q := store.New(openDB(t))
	assertValues(t, q, map[string]any{"help.messageMaxLength": 65535})

	for value, valid := range map[int]bool{0: false, 1: true, 65535: true, 65536: false} {
		if err := catalogue["help.messageMaxLength"].validate(value); valid != (err == nil) {
			t.Errorf("help.messageMaxLength = %d: %v, want valid %t", value, err, valid)
		}
	}
}

func TestTheGameSettingsHoldTheirDefaults(t *testing.T) {
	q := store.New(openDB(t))
	assertValues(t, q, map[string]any{
		"game.clientVersion":             1,
		"game.coppa":                     0,
		"game.vouchers":                  false,
		"game.parentEmailRequest":        false,
		"game.parentEmailReregistration": false,
		"game.directMail":                false,
		"game.dateFormat":                "dd-mm-yyyy",
		"game.partnerIntegration":        false,
		"game.profileEditing":            true,
		"game.trackingHeader":            "",
		"game.tutorial":                  false,
		"game.pingSeconds":               30,
		"game.pongTimeoutSeconds":        90,
		"game.maxRoomsPerHabbo":          50,
		"game.maxFavouriteRooms":         30,
		"game.categoryMaxRooms":          30,
		"game.searchMaxRooms":            30,
		"game.roomBanMinutes":            15,
		"game.chatHistoryDays":           30,
		"game.loadingAdImage":            "",
		"game.roomAdLink":                "",
		"game.outboxSize":                500,
		"game.chatRange":                 5,
		"game.chatMaxLength":             100,
		"game.maxIgnoredHabbos":          100,
		"game.roomEventTypes":            11,
		"game.maxSpectators":             50,
		"game.maxRoomFurni":              500,
		"game.maxStackHeight":            20,
		"game.presentNoteMaxLength":      200,
		"game.postItMaxLength":           684,
		"game.maxTradeFurni":             65,
		"recycler.enabled":               true,
		"recycler.minOwnedMinutes":       43200,
		"recycler.sessionMinutes":        60,
		"recycler.timeoutMinutes":        10080,
	})

	for value, valid := range map[int]bool{0: false, 1: true, 1_000_000: true} {
		if err := catalogue["game.clientVersion"].validate(value); valid != (err == nil) {
			t.Errorf("game.clientVersion = %d: %v, want valid %t", value, err, valid)
		}
	}
	for value, valid := range map[int]bool{-1: false, 0: true, 2: true, 3: false} {
		if err := catalogue["game.coppa"].validate(value); valid != (err == nil) {
			t.Errorf("game.coppa = %d: %v, want valid %t", value, err, valid)
		}
	}
	if err := catalogue["game.dateFormat"].validate(""); err == nil {
		t.Error("game.dateFormat accepts an empty format")
	}
}

// A ping timeout no longer than the interval would close every game client before it could answer.
func TestThePingTimeoutIsLongerThanTheInterval(t *testing.T) {
	q := store.New(openDB(t))
	for timeout, valid := range map[int]bool{29: false, 30: false, 31: true} {
		if err := Validate(t.Context(), q, map[string]any{"game.pongTimeoutSeconds": timeout}); valid != (err == nil) {
			t.Errorf("a timeout of %d with pings every 30 seconds: %v, want valid %t", timeout, err, valid)
		}
	}
	if err := Validate(t.Context(), q, map[string]any{"game.pingSeconds": 90}); err == nil {
		t.Error("pings every 90 seconds pass with a timeout of 90")
	}
}

// An ad's address is empty, for none, or an absolute http or https URL the game client loads; a control character, such
// as the tab that separates 258's image from its link, is refused.
func TestAnAdIsEmptyOrAnAbsoluteURL(t *testing.T) {
	for value, valid := range map[string]bool{
		"":                              true,
		"https://example.com/ad.gif":    true,
		"http://localhost:17387/ad.png": true,
		"/ad.gif":                       false,
		"javascript:alert(1)":           false,
		"https://example.com/\tad":      false,
		"https://exa mple.com/\x01":     false,
	} {
		if err := catalogue["game.loadingAdImage"].validate(value); valid != (err == nil) {
			t.Errorf("game.loadingAdImage = %q: %v, want valid %t", value, err, valid)
		}
	}
}
