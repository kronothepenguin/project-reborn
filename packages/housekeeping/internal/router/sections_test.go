package router

import (
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/settings"
)

func TestLongTextsAndChoicesGetTheirFields(t *testing.T) {
	body := settings.Field{Key: "staffPage.box1Body", Kind: "text"}
	short := filled(body, settings.Setting{Key: body.Key, Value: "A line.\nAnother."})
	if short.Kind != kindLongText || short.Rows != 2 || short.Value != "A line.\nAnother." || !short.BBCode {
		t.Errorf("a short long text = %+v", short)
	}
	long := filled(body, settings.Setting{Key: body.Key, Value: strings.Repeat("word ", 300)})
	if long.Rows != 10 {
		t.Errorf("a long text of 1500 characters has %d rows, want Holo's most, 10", long.Rows)
	}
	middle := filled(body, settings.Setting{Key: body.Key, Value: strings.Repeat("x", 250)})
	if middle.Rows != 5 {
		t.Errorf("250 characters have %d rows, want one per 60, 5", middle.Rows)
	}

	colours := []settings.Choice{{Value: "red", Label: "Red"}, {Value: "green", Label: "Green"}}
	picked := filled(settings.Field{Key: "staffPage.box1Color", Kind: "choice", Choices: colours}, settings.Setting{Key: "staffPage.box1Color", Value: "green"})
	if picked.Kind != kindChoice || picked.Choices[0].Selected || !picked.Choices[1].Selected || picked.Choices[1].Label != "Green" {
		t.Errorf("a choice = %+v", picked)
	}
}
