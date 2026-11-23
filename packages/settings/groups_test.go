package settings

import (
	"slices"
	"testing"
)

func TestEverySettingAnAdministratorEditsIsInExactlyOneGroup(t *testing.T) {
	found := make(map[string][]string)
	for _, g := range Groups() {
		for _, f := range g.Fields {
			found[f.Key] = append(found[f.Key], g.ID)
		}
	}
	for key := range catalogue {
		if slices.Contains(ungrouped, key) {
			if groups := found[key]; len(groups) > 0 {
				t.Errorf("%s belongs to no group, but is in %v", key, groups)
			}
			continue
		}
		if groups := found[key]; len(groups) != 1 {
			t.Errorf("%s is in %d groups %v, want exactly one", key, len(groups), groups)
		}
	}
}

func TestEveryFieldOfAGroupNamesADeclaredSetting(t *testing.T) {
	for _, g := range Groups() {
		for _, f := range g.Fields {
			d, ok := catalogue[f.Key]
			if !ok {
				t.Errorf("group %s: %s is not a declared setting", g.ID, f.Key)
				continue
			}
			if f.Kind == "" {
				t.Errorf("group %s: %s has no kind", g.ID, f.Key)
			}
			for _, c := range f.Choices {
				if err := d.validate(c.Value); err != nil {
					t.Errorf("group %s: %s offers %q, which it refuses: %v", g.ID, f.Key, c.Value, err)
				}
			}
		}
	}
}

func TestAFieldTakesItsKindFromItsDeclaration(t *testing.T) {
	kinds := make(map[string]string)
	for _, g := range Groups() {
		for _, f := range g.Fields {
			kinds[f.Key] = f.Kind
		}
	}
	for key, want := range map[string]string{
		"site.name":             "text",
		"registration.maxPerIp": "number",
		"referral.enabled":      "switch",
		"staffPage.box1Color":   "choice",
	} {
		if kinds[key] != want {
			t.Errorf("%s is a %q, want %q", key, kinds[key], want)
		}
	}
}

func TestTheMailGroupIsThePasswordResetMail(t *testing.T) {
	at := slices.IndexFunc(Groups(), func(g Group) bool { return g.ID == "mail" })
	if at < 0 {
		t.Fatal("no mail group")
	}
	if got := Groups()[at].Title; got != "Password reset mail" {
		t.Errorf("the mail group is titled %q", got)
	}
}

func TestChangingTheGroupsLeavesTheNextCallAlone(t *testing.T) {
	groups := Groups()
	groups[0].Fields[0].Label = "changed"
	for _, g := range groups {
		for i := range g.Fields {
			if len(g.Fields[i].Choices) > 0 {
				g.Fields[i].Choices[0].Label = "changed"
			}
		}
	}
	for _, g := range Groups() {
		for _, f := range g.Fields {
			if f.Label == "changed" || slices.ContainsFunc(f.Choices, func(c Choice) bool { return c.Label == "changed" }) {
				t.Fatalf("%s kept a change made to an earlier call", f.Key)
			}
		}
	}
}
