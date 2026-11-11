package server

import (
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
)

func TestTheServerStartsWithTheCatalogue(t *testing.T) {
	if chair, ok := furni.Get(463); !ok || chair.Sprite != "rclr_chair" {
		t.Errorf("furni 463 = %+v, %t; want the recycler's Palm Chair", chair, ok)
	}
	if pages := catalogue.Pages(); len(pages) != 67 {
		t.Errorf("%d pages loaded, want Holo's 67", len(pages))
	}
	if page, ok := catalogue.Get("Recycler"); !ok || page.Name != "Ecotron" {
		t.Errorf("the page Recycler = %+v, %t; want the Ecotron", page.CataloguePage, ok)
	}
}

// catalogueIndex sends GCIX and returns the names 126 lists by page code, and the codes in their order.
func catalogueIndex(t *testing.T, c *client) (names map[string]string, codes []string) {
	t.Helper()
	c.send(t, 101, "production/en")
	id, body := c.next(t)
	if id != 126 {
		t.Fatalf("received %d %q, want the catalogue's index, 126", id, body)
	}
	names = map[string]string{}
	for _, line := range strings.Split(strings.TrimSuffix(body, "\r"), "\r") {
		code, name, ok := strings.Cut(line, "\t")
		if !ok {
			t.Fatalf("the index line %q has no tab", line)
		}
		names[code] = name
		codes = append(codes, code)
	}
	return names, codes
}

// The catalogue lists a habbo the pages its level reaches and the club opens (plans/server decision 0100), in Holo's
// order, and leaves out the pages that wait for S7 (decision 0101).
func TestTheCatalogueListsThePagesAHabboSees(t *testing.T) {
	habboWithTickets(t, "Shopper", "shopper")
	clubber := habboWithTickets(t, "Cardholder", "cardholder")
	curator := habboWithTickets(t, "Curator", "curator")
	ctx := t.Context()
	q := store.New(testDB)
	now := time.Now().UTC()
	day := 24 * time.Hour
	err := q.CreateClubSubscription(ctx, store.CreateClubSubscriptionParams{UserID: userOf(t, clubber), StartsAt: now.Add(-day), EndsAt: now.Add(30 * day), CreatedAt: now.Add(-day)})
	if err != nil {
		t.Fatal(err)
	}
	group, err := q.CreateAccessGroup(ctx, store.CreateAccessGroupParams{Name: "Curators", Level: 7, CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	if err := q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userOf(t, curator), GrantedAt: now}); err != nil {
		t.Fatal(err)
	}

	shopper, _ := login(t, "shopper")
	names, codes := catalogueIndex(t, shopper)
	if len(codes) != 49 || codes[0] != "Purse" || codes[1] != "Frontpage" || names["Recycler"] != "Ecotron" || names["Trophies"] != "Trophies" {
		t.Errorf("a habbo's index has %d pages, %v first, the recycler named %q; want 49, the Purse first and the Ecotron", len(codes), codes[:2], names["Recycler"])
	}
	for _, hidden := range []string{"Rares", "Greek", "Advertisement", "Pets", "Camera", "Trax Dance", "Club Shop", "Offers"} {
		if _, listed := names[hidden]; listed {
			t.Errorf("a habbo's index lists %s", hidden)
		}
	}
	if _, listed := names["Club Furni"]; !listed {
		t.Error("a habbo's index does not list Club Furni, which everyone sees")
	}

	member, _ := login(t, "cardholder")
	names, codes = catalogueIndex(t, member)
	if _, rares := names["Rares"]; len(codes) != 51 || names["Greek"] != "Greek" || names["Advertisement"] != "Advertisement" || rares {
		t.Errorf("a club member's index has %d pages, Rares listed %t; want 51 with Greek and Advertisement, and no Rares", len(codes), rares)
	}

	staff, _ := login(t, "curator")
	names, codes = catalogueIndex(t, staff)
	if len(codes) != 67 || names["Rares"] != "Rares" || names["Greek"] != "Greek" || names["Dragons"] != "Dragons" {
		t.Errorf("a level 7 habbo's index has %d pages; want all 67, with Rares, Greek and Dragons", len(codes))
	}
}

// A page comes as 127 with its texts and a p line for each thing it sells (plans/server/reference/r26/hh_cat_code.md).
func TestACataloguePageComesWithWhatItSells(t *testing.T) {
	habboWithTickets(t, "Pagereader", "pagereader")
	c, _ := login(t, "pagereader")

	c.send(t, 102, "production/Spaces/en")
	spaces := c.nextBody(t, 127)
	head := "i:Spaces\rn:Spaces\rl:ctlg_spaces\rg:catalog_spaces_headline1\rh:Are your walls looking a little grey?"
	texts := "t1:Wall\rt2:Floor\rt3:Pattern\rt4:Colour\rt5:Pattern\rt6:Colour\rt7:Preview\r"
	if !strings.HasPrefix(spaces, head) || !strings.Contains(spaces, texts) || strings.Count(spaces, "\rp:") != 40 {
		t.Errorf("the Spaces page = %q; want its head, its seven texts and 40 products", spaces)
	}
	if wallpaper := "p:wallpaper\twallpaper\t3\t\ti\twallpaper 1\t\t\t3\t\r"; !strings.Contains(spaces, wallpaper) {
		t.Errorf("the Spaces page has no line %q for its first wallpaper, a wall item", wallpaper)
	}

	c.send(t, 102, "production/Rollers/en")
	rollers := c.nextBody(t, 127)
	if roller := "p:White Habbo Roller\tThe power of movement\t5\t\ts\tqueue_tile1*0\t0\t1,1\t465\t#ffffff,#ffffff,#ffffff,#ffffff\r"; !strings.Contains(rollers, roller) {
		t.Errorf("the Rollers page = %q; want the line %q for a floor furni", rollers, roller)
	}

	c.send(t, 102, "production/Pet Accesories/en")
	pets := c.nextBody(t, 127)
	if bones := "p:Doggy Bones\tNatural nutrition for the barking one\t2\t\td\t\t\t\tdeal97\t\t1\tpetfood1\t6\t0,0,0\r"; !strings.Contains(pets, bones) {
		t.Errorf("the Pet Accesories page = %q; want the line %q for a deal", pets, bones)
	}

	c.send(t, 102, "production/Recycler/en")
	if recycler := c.nextBody(t, 127); recycler != "i:Recycler\rn:Ecotron\rl:ctlg_recycler\rg:catalog_recycler_headline1\r" {
		t.Errorf("the recycler's page = %q; want its id, name, layout and header image, and nothing to sell", recycler)
	}
}

// A page the habbo does not see, or that does not exist, gets no answer.
func TestAHiddenCataloguePageIsNotSent(t *testing.T) {
	habboWithTickets(t, "Peeker", "peeker")
	c, _ := login(t, "peeker")
	for _, page := range []string{"Rares", "Greek", "Pets", "Nowhere"} {
		c.send(t, 102, "production/"+page+"/en")
	}
	c.send(t, 102, "production/Frontpage/en")
	if body := c.nextBody(t, 127); !strings.HasPrefix(body, "i:Frontpage\r") {
		t.Errorf("after four hidden pages the client received %q, want the front page", body)
	}
}
