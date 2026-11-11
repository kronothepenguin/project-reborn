package server

import (
	"testing"

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
