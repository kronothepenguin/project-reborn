package site

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestDefaultsSatisfyTheirValidators(t *testing.T) {
	for key, err := range map[string]error{
		"name":        ValidateName(DefaultName()),
		"shortName":   ValidateShortName(DefaultShortName()),
		"url":         ValidateURL(DefaultURL()),
		"maintenance": ValidateMaintenance(DefaultMaintenance()),
	} {
		if err != nil {
			t.Errorf("default %s is invalid: %v", key, err)
		}
	}
}

func TestValidateNames(t *testing.T) {
	for _, validate := range []func(string) error{ValidateName, ValidateShortName} {
		for _, name := range []string{"H", "Holo Hotel", "Hôtel Habbo", strings.Repeat("a", 30)} {
			if err := validate(name); err != nil {
				t.Errorf("name %q rejected: %v", name, err)
			}
		}
		for _, name := range []string{"", strings.Repeat("a", 31)} {
			if err := validate(name); err == nil {
				t.Errorf("name %q accepted, want an error", name)
			}
		}
	}
}

func TestValidateURL(t *testing.T) {
	for _, u := range []string{"http://localhost:17387", "https://hotel.example.com"} {
		if err := ValidateURL(u); err != nil {
			t.Errorf("ValidateURL(%q) = %v, want nil", u, err)
		}
	}
	for _, u := range []string{
		"", "localhost:17387", "ftp://hotel.example.com", "https://hotel.example.com/",
		"https://hotel.example.com/cms", "https://hotel.example.com?a=1", "https://user@hotel.example.com",
	} {
		if err := ValidateURL(u); err == nil {
			t.Errorf("ValidateURL(%q) = nil, want an error", u)
		}
	}
}

func TestJSONTags(t *testing.T) {
	in := Site{Name: "Reborn Hotel", ShortName: "Reborn", URL: "https://hotel.example.com", Maintenance: true}
	data, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	want := `{"name":"Reborn Hotel","shortName":"Reborn","url":"https://hotel.example.com","maintenance":true}`
	if string(data) != want {
		t.Errorf("marshal = %s, want %s", data, want)
	}
	var out Site
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if out != in {
		t.Errorf("round trip = %+v, want %+v", out, in)
	}
}
