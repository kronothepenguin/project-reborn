package store

import (
	"slices"
	"strconv"
	"strings"
	"testing"
)

// Holo's catalogue, as the update 0013-catalogue.sql seeds it (decisions server/0091, server/0097 and server/0099 to 0102).
func TestANewDatabaseHasHolosCatalogue(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()

	definitions := must(q.ListFurniDefinitions(ctx))
	pages := must(q.ListCataloguePages(ctx))
	texts := must(q.ListCataloguePageTexts(ctx))
	items := must(q.ListCatalogueItems(ctx))
	furni := must(q.ListCatalogueItemFurni(ctx))
	if len(definitions) != 1256 || len(pages) != 67 || len(texts) != 15 || len(items) != 1275 || len(furni) != 1275 {
		t.Fatalf("%d definitions, %d pages, %d texts, %d items giving %d furni; want 1256, 67, 15, 1275 and 1275",
			len(definitions), len(pages), len(texts), len(items), len(furni))
	}

	definition := map[int64]FurniDefinition{}
	for _, d := range definitions {
		definition[d.ID] = d
		if wall := d.Kind == "wall"; wall != (d.Length == 0) || wall != (d.Width == 0) {
			t.Errorf("definition %d %s is a %s of %d by %d", d.ID, d.Sprite, d.Kind, d.Length, d.Width)
		}
		for _, later := range []string{"sound_set_", "jukebox", "song_disk", "roomdimmer", "camera", "photo_film", "nest"} {
			if strings.HasPrefix(d.Sprite, later) {
				t.Errorf("definition %d is %s, which waits for S7", d.ID, d.Sprite)
			}
		}
	}

	page := map[string]CataloguePage{}
	levels := map[int64]int{}
	for _, p := range pages {
		page[p.Code] = p
		levels[p.MinLevel]++
		emptyImage := p.TeaserImages != "" && slices.Contains(strings.Split(p.TeaserImages, ","), "")
		if strings.ContainsAny(p.HeaderText+p.TeaserText+p.SpecialText, "\r\n") || emptyImage {
			t.Errorf("page %s keeps a line break or an empty teaser image", p.Code)
		}
	}
	if pages[0].Code != "Purse" || page["Recycler"].Name != "Ecotron" || page["Recycler"].Layout != "ctlg_recycler" {
		t.Errorf("the first page is %s and the recycler's %+v; want Purse first, and Recycler named Ecotron", pages[0].Code, page["Recycler"])
	}
	for _, code := range []string{"Trophies", "Christmas", "Easter", "Windows", "Dragons", "Trophies Rare"} {
		if page[code].Name != code {
			t.Errorf("page %s is named %q, want its English name", code, page[code].Name)
		}
	}
	for _, code := range []string{"Pets", "Camera", "Trax Ambient", "Trax Dance", "Trax Rock", "Trax SFX", "Trax Urban", "Club Shop", "Offers"} {
		if _, seeded := page[code]; seeded {
			t.Errorf("page %s is seeded, want it left out", code)
		}
	}
	if levels[0] != 49 || levels[2] != 2 || levels[7] != 16 {
		t.Errorf("pages by level = %v, want 49 for everyone, 2 at level 2 and 16 at level 7", levels)
	}
	if greek, ads, rares := page["Greek"], page["Advertisement"], page["Rares"]; greek.MinLevel != 2 || !greek.OpenToClub ||
		ads.MinLevel != 2 || !ads.OpenToClub || rares.MinLevel != 7 || rares.OpenToClub {
		t.Errorf("Greek %+v, Advertisement %+v and Rares %+v; want level 2 open to the club twice, and level 7", greek, ads, rares)
	}
	for _, p := range pages {
		if p.ClubOnly != (p.Code == "Club Furni") {
			t.Errorf("page %s sells only to the club: %t", p.Code, p.ClubOnly)
		}
	}

	spaces := page["Spaces"].ID
	var labels []string
	for _, text := range texts {
		if text.CataloguePageID == spaces {
			labels = append(labels, text.Text)
		}
		if strings.ContainsAny(text.Text, "\r\n") {
			t.Errorf("text %d of page %d keeps a line break", text.Number, text.CataloguePageID)
		}
	}
	if strings.Join(labels, ",") != "Wall,Floor,Pattern,Colour,Pattern,Colour,Preview" {
		t.Errorf("the Spaces page's texts = %v, want Holo's seven in order", labels)
	}

	item := map[int64]CatalogueItem{}
	for _, i := range items {
		item[i.ID] = i
	}
	gives := map[int64][]CatalogueItemFurni{}
	soldBy := map[int64][]int64{}
	for _, f := range furni {
		gives[f.CatalogueItemID] = append(gives[f.CatalogueItemID], f)
		soldBy[f.FurniDefinitionID] = append(soldBy[f.FurniDefinitionID], f.CatalogueItemID)
		if _, known := definition[f.FurniDefinitionID]; !known {
			t.Errorf("item %d gives the furni %d, which has no definition", f.CatalogueItemID, f.FurniDefinitionID)
		}
	}
	deals := 0
	for _, i := range items {
		given := gives[i.ID]
		if len(given) != 1 {
			t.Errorf("item %d %s gives %d kinds of furni, want one", i.ID, i.Name, len(given))
			continue
		}
		deal := given[0].Amount > 1
		if deal {
			deals++
		}
		if deal != strings.HasPrefix(i.Code, "deal") || !deal && i.Code != strconv.FormatInt(i.ID, 10) {
			t.Errorf("item %d %s has the code %q; want Holo's code for a deal, and its id for a furni", i.ID, i.Name, i.Code)
		}
	}
	bones := gives[37]
	if deals != 4 || item[37].Name != "Doggy Bones" || item[37].Code != "deal97" || bones[0].Amount != 6 ||
		definition[bones[0].FurniDefinitionID].Sprite != "petfood1" {
		t.Errorf("%d deals, and Doggy Bones %+v gives %+v; want Holo's four pet food packs of 6, this one deal97", deals, item[37], bones)
	}

	rollers := 0
	for _, d := range definitions {
		if d.Kind == "roller" {
			rollers++
		}
	}
	if rollers != 10 || definition[465].Kind != "roller" || definition[465].Height != 0.5 {
		t.Errorf("%d rollers, and the White Habbo Roller is %+v; want Holo's ten, half a tile high (decision server/0107)", rollers, definition[465])
	}

	throne := slices.IndexFunc(items, func(i CatalogueItem) bool { return i.Name == "Throne" })
	if throne < 0 {
		t.Fatal("no Throne in the catalogue")
	}
	if d := definition[gives[items[throne].ID][0].FurniDefinitionID]; items[throne].Price != 25 || d.Sprite != "throne" || d.Kind != "seat" {
		t.Errorf("the Throne costs %d and is %+v; want 25 credits for a seat", items[throne].Price, d)
	}

	var mummies []FurniDefinition
	for _, d := range definitions {
		if d.Sprite == "poster" && d.Data == "44" {
			mummies = append(mummies, d)
		}
	}
	if len(mummies) != 1 {
		t.Fatalf("%d definitions of the Mummy poster, want one", len(mummies))
	}
	sellers := soldBy[mummies[0].ID]
	if len(sellers) != 2 || item[sellers[0]].CataloguePageID == item[sellers[1]].CataloguePageID {
		t.Errorf("the Mummy poster is sold by the items %v, want one on each of two pages", sellers)
	}

	unsold := map[string]bool{}
	for _, d := range definitions {
		if len(soldBy[d.ID]) == 0 {
			unsold[d.Sprite] = true
		}
	}
	for _, sprite := range []string{"rclr_chair", "rclr_garden", "rclr_sofa", "present_gen1", "present_gen6"} {
		if !unsold[sprite] {
			t.Errorf("%s is sold or missing, want a furni that no page sells", sprite)
		}
	}
	if len(unsold) != 10 {
		t.Errorf("%d furni that no page sells, want 10: %v", len(unsold), unsold)
	}
}
