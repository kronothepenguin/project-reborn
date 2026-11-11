package server

import (
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// giveCredits adds credits to the wallet of the habbo's user.
func giveCredits(t *testing.T, avatarID, credits int64) {
	t.Helper()
	err := store.New(testDB).AddWalletCredits(t.Context(), store.AddWalletCreditsParams{UserID: userOf(t, avatarID), Credits: credits, UpdatedAt: time.Now().UTC()})
	if err != nil {
		t.Fatalf("AddWalletCredits: %v", err)
	}
}

// buy sends GPRC for an item of a page, with the page's extra value or a dash, and returns the first answer.
func buy(t *testing.T, c *client, page, item, extra string) (id int, body string) {
	t.Helper()
	c.send(t, 100, strings.Join([]string{"production", page, "en", item, extra, "0", ""}, "\r"))
	return c.next(t)
}

// handOf reads the habbo's hand from the store, the oldest furni first.
func handOf(t *testing.T, avatarID int64) []store.Furni {
	t.Helper()
	hand, err := store.New(testDB).ListHandFurni(t.Context(), store.ListHandFurniParams{AvatarID: avatarID, PageSize: 100})
	if err != nil {
		t.Fatalf("ListHandFurni: %v", err)
	}
	return hand
}

func credits(t *testing.T, avatarID int64) int64 {
	t.Helper()
	wallet, err := store.New(testDB).GetWallet(t.Context(), userOf(t, avatarID))
	if err != nil {
		t.Fatalf("GetWallet: %v", err)
	}
	return wallet.Credits
}

// A purchase takes the price from the user's wallet, writes it in the credit history and puts the furni in the
// buyer's hand; with too few credits it changes nothing (plans/server/reference/r26/hh_cat_code.md, Buying).
func TestBuyingAFurniWithCredits(t *testing.T) {
	spender := habboWithTickets(t, "Spender", "spender")
	giveCredits(t, spender, 12)
	c, _ := login(t, "spender")

	if id, body := buy(t, c, "Rollers", "465", "-"); id != 67 {
		t.Fatalf("buying a roller got %d %q, want the purchase done, 67", id, body)
	}
	c.expectMessage(t, 6, "7")
	hand := handOf(t, spender)
	if len(hand) != 1 || hand[0].FurniDefinitionID != 465 || hand[0].UserID != userOf(t, spender) || hand[0].State != "" {
		t.Fatalf("the hand = %+v, want one White Habbo Roller of the buyer's user", hand)
	}
	history, err := store.New(testDB).ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userOf(t, spender), RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(history) != 1 || history[0].Credits != -5 || history[0].Reason != "catalogue" ||
		history[0].Detail != "Catalogue purchase (White Habbo Roller)" || history[0].Habbo.String != "Spender" {
		t.Errorf("the credit history = %+v, want one line of -5 for the roller, by Spender", history)
	}

	if id, _ := buy(t, c, "Rollers", "465", "-"); id != 67 {
		t.Fatalf("the second roller got %d, want 67", id)
	}
	c.expectMessage(t, 6, "2")
	if id, body := buy(t, c, "Rollers", "465", "-"); id != 68 {
		t.Errorf("a roller of 5 credits with 2 got %d %q, want not enough credits, 68", id, body)
	}
	if got, hand := credits(t, spender), handOf(t, spender); got != 2 || len(hand) != 2 {
		t.Errorf("after the refused purchase the wallet holds %d and the hand %d furni, want 2 and 2", got, len(hand))
	}
}

// A deal gives every piece of it, a trophy keeps its buyer, the day and the inscription, a wallpaper keeps its
// pattern, and a pad of post-its starts with 20 notes.
func TestWhatAPurchaseLeavesInTheHand(t *testing.T) {
	buyer := habboWithTickets(t, "Packbuyer", "packbuyer")
	giveCredits(t, buyer, 100)
	c, _ := login(t, "packbuyer")

	if id, _ := buy(t, c, "Pet Accesories", "deal97", "-"); id != 67 {
		t.Fatalf("buying Doggy Bones got %d, want 67", id)
	}
	c.expectMessage(t, 6, "98")
	hand := handOf(t, buyer)
	if len(hand) != 6 {
		t.Fatalf("the deal left %d furni in the hand, want its 6 pieces", len(hand))
	}
	for _, f := range hand {
		if f.FurniDefinitionID != 41 {
			t.Errorf("the deal gave the furni %d, want petfood1, 41", f.FurniDefinitionID)
		}
	}

	if id, _ := buy(t, c, "Trophies", "600", "For the best\ttrader"); id != 67 {
		t.Fatalf("buying a trophy got %d, want 67", id)
	}
	c.expectMessage(t, 6, "86")
	trophy := handOf(t, buyer)[6]
	if want := "Packbuyer\t" + time.Now().Format("02-01-2006") + "\tFor the best trader"; trophy.State != want {
		t.Errorf("the trophy's state = %q, want %q", trophy.State, want)
	}

	if id, _ := buy(t, c, "Spaces", "3", "107"); id != 67 {
		t.Fatalf("buying a wallpaper got %d, want 67", id)
	}
	c.expectMessage(t, 6, "83")
	if wallpaper := handOf(t, buyer)[7]; wallpaper.State != "107" || wallpaper.FurniDefinitionID != 3 {
		t.Errorf("the wallpaper = %+v, want the pattern 107 as its state", wallpaper)
	}
	if id, body := buy(t, c, "Spaces", "3", "1/7"); id != 65 {
		t.Errorf("a wallpaper with the pattern 1/7 got %d %q, want an error, 65", id, body)
	}

	if id, _ := buy(t, c, "Accessories", "97", "-"); id != 67 {
		t.Fatalf("buying a pad of post-its got %d, want 67", id)
	}
	c.expectMessage(t, 6, "80")
	if pad := handOf(t, buyer)[8]; pad.State != "20" {
		t.Errorf("the pad's state = %q, want its 20 notes", pad.State)
	}
}

// Club Furni sells only to club members (plans/server decision 0102), and a page the habbo does not see sells it
// nothing.
func TestWhoMayBuy(t *testing.T) {
	outsider := habboWithTickets(t, "Outsider", "outsider")
	insider := habboWithTickets(t, "Insider", "insider")
	giveCredits(t, outsider, 50)
	giveCredits(t, insider, 50)
	now := time.Now().UTC()
	day := 24 * time.Hour
	err := store.New(testDB).CreateClubSubscription(t.Context(), store.CreateClubSubscriptionParams{UserID: userOf(t, insider), StartsAt: now.Add(-day), EndsAt: now.Add(30 * day), CreatedAt: now.Add(-day)})
	if err != nil {
		t.Fatal(err)
	}

	c, _ := login(t, "outsider")
	if id, body := buy(t, c, "Club Furni", "978", "-"); id != 296 || body != "I" {
		t.Errorf("an HC chair for a habbo outside the club got %d %q, want 296 with 1", id, body)
	}
	for _, order := range [][2]string{{"Rares", "1152"}, {"Rollers", "1152"}, {"Rollers", "nothing"}, {"Nowhere", "465"}, {"Pets", "34"}} {
		if id, body := buy(t, c, order[0], order[1], "-"); id != 65 {
			t.Errorf("the item %s of the page %s got %d %q, want an error, 65", order[1], order[0], id, body)
		}
	}
	if got, hand := credits(t, outsider), handOf(t, outsider); got != 50 || len(hand) != 0 {
		t.Errorf("after six refused purchases the wallet holds %d and the hand %d furni, want 50 and none", got, len(hand))
	}

	member, _ := login(t, "insider")
	if id, body := buy(t, member, "Club Furni", "978", "-"); id != 67 {
		t.Errorf("an HC chair for a club member got %d %q, want 67", id, body)
	}
	member.expectMessage(t, 6, "47")
}
