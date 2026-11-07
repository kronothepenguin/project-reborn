package router

import (
	"testing"
)

// holoCharacters is the string of randomVoucher in Holo's housekeeping/vouchers.php.
const holoCharacters = "1234567890abdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// Every code has 8 of Holo's characters, and over many codes each character comes
// up as often as its places in Holo's string say: a digit twice as often as a
// letter, c never. With 60 degrees of freedom, a chi-square past 150 comes by chance
// about once in a billion runs.
func TestRandomVouchersDrawHolosCharacters(t *testing.T) {
	const codes = 10000
	drawn := map[rune]float64{}
	for range codes {
		code := randomVoucher()
		if len(code) != 8 {
			t.Fatalf("%q has %d characters, want 8", code, len(code))
		}
		for _, c := range code {
			drawn[c]++
		}
	}

	places := map[rune]float64{}
	for _, c := range holoCharacters {
		places[c]++
	}
	for c := range drawn {
		if places[c] == 0 {
			t.Errorf("%q is not one of Holo's characters", c)
		}
	}
	chiSquare := 0.0
	for c, n := range places {
		want := codes * 8 * n / float64(len(holoCharacters))
		chiSquare += (drawn[c] - want) * (drawn[c] - want) / want
	}
	if chiSquare > 150 {
		t.Errorf("chi-square = %.1f over %d characters, want each as likely as its places in Holo's string", chiSquare, len(places))
	}
}
