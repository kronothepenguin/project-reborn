package installer

import (
	"encoding/json"
	"html/template"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/reborn"
	"github.com/kronothepenguin/project-reborn/packages/config/server"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// printData stands in for the built pages: it prints the page data, so the
// test can read what a handler passed to its template.
func printData(name string) (*template.Template, error) {
	return template.New(name).Delims("[[", "]]").Parse(`[[ printf "%+v" . ]]`)
}

// Run alone, the installer keeps both forms as they are today: the walk through
// the steps with the site's port, housekeeping's port and housekeeping's address.
func TestInstallation(t *testing.T) {
	t.Chdir(t.TempDir())
	i, err := New(t.Context(), nil, WithResolver(printData), WithStatic(http.NotFoundHandler()))
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	t.Cleanup(func() {
		if installation, ok := i.setup.Current(); ok {
			installation.DB.Close()
		}
	})
	mux := http.NewServeMux()
	i.Mount(mux)

	site := url.Values{
		"name":            {"Reborn Hotel"},
		"shortName":       {"Reborn"},
		"url":             {"https://hotel.example.com"},
		"housekeepingUrl": {"http://localhost:18400/housekeeping"},
		"startCredits":    {"750"},
	}
	admin := url.Values{
		"name":            {"Admin-1"},
		"email":           {"admin@example.com"},
		"bornOn":          {"1990-05-01"},
		"password":        {"secret123"},
		"passwordConfirm": {"secret123"},
	}
	with := func(form url.Values, key, value string) url.Values {
		changed := url.Values{}
		for k, v := range form {
			changed[k] = v
		}
		changed.Set(key, value)
		return changed
	}

	for _, c := range []struct {
		name     string
		method   string
		path     string
		form     url.Values
		status   int
		location string
		body     string
	}{
		{"status before configuring", "GET", "/installer/", nil, 200, "", "Configured:false Installed:false"},
		{"status links nowhere before installing", "GET", "/installer/", nil, 200, "", "SiteURL:}"},
		{"site before configuring", "GET", "/installer/site", nil, 303, "/installer/config", ""},
		{"admin before configuring", "POST", "/installer/admin", admin, 303, "/installer/config", ""},
		{"config form", "GET", "/installer/config", nil, 200, "", "OneAddress:false Written:false ConfigPath:"},
		{"config form has both ports", "GET", "/installer/config", nil, 200, "", "Path:habbo.db Host: Port:17387 HousekeepingPort:18465"},
		{"port that is not a number", "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "port": {"abc"}, "housekeepingPort": {"18400"}}, 422, "", "The hotel port must be a number."},
		{"housekeeping port that is not a number", "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"abc"}}, 422, "", "The housekeeping port must be a number."},
		{"port out of range", "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "port": {"70000"}, "housekeepingPort": {"18400"}}, 422, "", "cms.port: must be between 1 and 65535"},
		{"housekeeping port out of range", "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"70000"}}, 422, "", "housekeeping.port: must be between 1 and 65535"},
		{"write config", "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"18400"}}, 303, "/installer/site", ""},
		{"config written", "GET", "/installer/config", nil, 200, "", "Written:true"},
		{"config shows the ports", "GET", "/installer/config", nil, 200, "", "Port:17400 HousekeepingPort:18400"},
		{"config again", "POST", "/installer/config", url.Values{"path": {"other.db"}, "port": {"17401"}, "housekeepingPort": {"18401"}}, 303, "/installer/config", ""},
		{"site form", "GET", "/installer/site", nil, 200, "", "Name:Reborn Hotel ShortName:Reborn URL:http://localhost:17387 HousekeepingURL:http://localhost:18400/housekeeping StartCredits:500 SecureCookies:true"},
		{"a bad housekeeping address", "POST", "/installer/site", with(site, "housekeepingUrl", "nowhere"), 422, "", "Housekeeping address: must be a path or an http or https URL"},
		{"site URL with a path", "POST", "/installer/site", with(site, "url", "https://hotel.example.com/cms"), 422, "", "Site URL: must be an http or https origin"},
		{"start credits out of range", "POST", "/installer/site", with(site, "startCredits", "-1"), 422, "", "Start credits: must be between 0 and 1000000"},
		{"save site", "POST", "/installer/site", site, 303, "/installer/admin", ""},
		{"admin form", "GET", "/installer/admin", nil, 200, "", "PasswordHelp:6 to 25 characters"},
		{"passwords differ", "POST", "/installer/admin", with(admin, "passwordConfirm", "secret124"), 422, "", "The passwords do not match."},
		{"missing birth date", "POST", "/installer/admin", with(admin, "bornOn", ""), 422, "", "Enter the birth date."},
		{"habbo name with a space", "POST", "/installer/admin", with(admin, "name", "Admin One"), 422, "", "Habbo names are 1 to 24 letters"},
		{"short password", "POST", "/installer/admin", with(with(admin, "password", "short"), "passwordConfirm", "short"), 422, "", "Passwords are 6 to 25 characters."},
		{"create administrator", "POST", "/installer/admin", admin, 303, "/", ""},
		{"status after installing", "GET", "/installer/", nil, 200, "", "Installed:true ConfigPath:"},
		{"status links to the hotel", "GET", "/installer/", nil, 200, "", "SiteURL:https://hotel.example.com}"},
		{"config after installing", "GET", "/installer/config", nil, 303, "/installer/", ""},
		{"site after installing", "POST", "/installer/site", site, 303, "/installer/", ""},
		{"admin after installing", "POST", "/installer/admin", admin, 303, "/installer/", ""},
	} {
		var body io.Reader
		if c.form != nil {
			body = strings.NewReader(c.form.Encode())
		}
		r := httptest.NewRequest(c.method, c.path, body)
		if c.form != nil {
			r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		}
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, r)

		if rec.Code != c.status || rec.Header().Get("Location") != c.location {
			t.Fatalf("%s: %d to %q, want %d to %q\n%s", c.name, rec.Code, rec.Header().Get("Location"), c.status, c.location, rec.Body)
		}
		if !strings.Contains(rec.Body.String(), c.body) {
			t.Fatalf("%s: body %q lacks %q", c.name, rec.Body, c.body)
		}
	}

	installation, _ := i.setup.Current()
	ctx, q := t.Context(), store.New(installation.DB)
	name, address := settings.String(ctx, q, "site.name"), settings.String(ctx, q, "site.url")
	credits, secure := settings.Int(ctx, q, "registration.startCredits"), settings.Bool(ctx, q, "auth.secureCookies")
	if name != "Reborn Hotel" || address != "https://hotel.example.com" || credits != 750 || secure {
		t.Errorf("settings after the site step: name %q, url %q, start credits %d, secure cookies %t",
			name, address, credits, secure)
	}

	data, err := os.ReadFile(config.Filename)
	if err != nil {
		t.Fatalf("read %s: %v", config.Filename, err)
	}
	var written config.Config
	if err := json.Unmarshal(data, &written); err != nil {
		t.Fatalf("decode %s: %v", config.Filename, err)
	}
	if written.Housekeeping.Host != "localhost" || written.Housekeeping.Port != 18400 {
		t.Errorf("%s holds housekeeping %+v, want the default host and the form's port", config.Filename, written.Housekeeping)
	}
	if written.Server.Info != server.DefaultInfo() || written.Server.MUS != server.DefaultMUS() {
		t.Errorf("%s holds server %+v, want the defaults", config.Filename, written.Server)
	}
	if written.Reborn != (reborn.Reborn{Host: reborn.DefaultHost(), Port: reborn.DefaultPort()}) {
		t.Errorf("%s holds reborn %+v, want the defaults", config.Filename, written.Reborn)
	}
}
