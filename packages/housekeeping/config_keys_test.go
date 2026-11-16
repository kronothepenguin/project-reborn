package housekeeping

import (
	"encoding/json"
	"html"
	"maps"
	"net/http"
	"net/url"
	"os"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
)

// olderConfigJSON stands in for the config.json of an older release: it lacks
// cms.host and the proxy, server and reborn sections, and holds a key that nothing reads
// any more.
const olderConfigJSON = `{
  "store": {"path": "habbo.db"},
  "cms": {"port": 17387},
  "housekeeping": {"host": "localhost", "port": 18465},
  "theme": "dark"
}`

// useOlderConfig puts olderConfigJSON in place of the package's config.json
// until the test ends.
func useOlderConfig(t *testing.T) {
	t.Helper()
	original, err := os.ReadFile(config.Filename)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := os.WriteFile(config.Filename, original, 0o644); err != nil {
			t.Fatal(err)
		}
	})
	if err := os.WriteFile(config.Filename, []byte(olderConfigJSON), 0o644); err != nil {
		t.Fatal(err)
	}
}

// serverKeys fills the server and reborn sections, which olderConfigJSON lacks,
// in a form.
var serverKeys = url.Values{
	"key.server.info.host": {"localhost"}, "key.server.info.port": {"31000"},
	"key.server.mus.host": {"localhost"}, "key.server.mus.port": {"31001"},
	"key.server.api.host": {"localhost"}, "key.server.api.port": {"15445"},
	"key.reborn.host": {"localhost"}, "key.reborn.port": {"16416"},
}

func readConfig(t *testing.T) map[string]any {
	t.Helper()
	data, err := os.ReadFile(config.Filename)
	if err != nil {
		t.Fatal(err)
	}
	var file map[string]any
	if err := json.Unmarshal(data, &file); err != nil {
		t.Fatalf("config.json: %v: %s", err, data)
	}
	return file
}

func TestTheUpdatePageOffersConfigJsonsNewKeys(t *testing.T) {
	useOlderConfig(t)
	db, mux := newSite(t)
	_, keeper := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)

	wantPage(t, serve(mux, "GET", "/housekeeping/updates", keeper, nil), http.StatusOK,
		html.EscapeString(`NewKeys:[{Path:assets.path Value:assets} {Path:cms.host Value:localhost} {Path:proxy.enabled Value:false} {Path:proxy.trusted Value:["127.0.0.1","::1"]} `+
			`{Path:reborn.host Value:localhost} {Path:reborn.port Value:16416} {Path:server.api.host Value:localhost} {Path:server.api.port Value:15445} {Path:server.info.host Value:localhost} {Path:server.info.port Value:30000} {Path:server.mus.host Value:localhost} `+
			`{Path:server.mus.port Value:30001}] OldKeys:[{Path:theme Value:"dark"}]`))
}

func TestSavingConfigJsonWritesTheNewKeys(t *testing.T) {
	useOlderConfig(t)
	db, mux := newSite(t)
	_, keeper := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)

	form := url.Values{"key.assets.path": {"assets"}, "key.cms.host": {"0.0.0.0"}, "key.proxy.enabled": {"true"}, "key.proxy.trusted": {`["10.0.0.1"]`}}
	maps.Copy(form, serverKeys)
	wantRedirect(t, serve(mux, "POST", "/housekeeping/updates/config", keeper, form), "/housekeeping/updates?config=1")
	file := readConfig(t)
	proxy, _ := file["proxy"].(map[string]any)
	cms, _ := file["cms"].(map[string]any)
	server, _ := file["server"].(map[string]any)
	info, _ := server["info"].(map[string]any)
	mus, _ := server["mus"].(map[string]any)
	if proxy["enabled"] != true || len(proxy["trusted"].([]any)) != 1 || cms["port"] != float64(17387) || cms["host"] != "0.0.0.0" || file["theme"] != nil {
		t.Errorf("config.json = %v", file)
	}
	if info["host"] != "localhost" || info["port"] != float64(31000) || mus["host"] != "localhost" || mus["port"] != float64(31001) {
		t.Errorf("config.json holds server %v", server)
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "config.update" || logs[0].Detail != "added assets.path, cms.host, proxy.enabled, proxy.trusted, reborn.host, reborn.port, server.api.host, server.api.port, server.info.host, server.info.port, server.mus.host, server.mus.port; removed theme" {
		t.Errorf("staff logs = %+v", logs)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/updates?config=1", keeper, nil), http.StatusOK,
		"Message:config.json was saved. The new values apply when the programs restart.", "NewKeys:[] OldKeys:[]")
}

func TestABadValueLeavesConfigJsonAsItIs(t *testing.T) {
	useOlderConfig(t)
	db, mux := newSite(t)
	_, keeper := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)
	_, helper := staff(t, db, "Helper", auth.HousekeepingAccess)

	for _, c := range []struct {
		value string
		want  string
	}{
		{"yes", "Error:The value of proxy.enabled is not a JSON value."},
		{`"yes"`, "Error:config.json was not saved: "},
	} {
		form := url.Values{"key.cms.host": {"localhost"}, "key.proxy.enabled": {c.value}, "key.proxy.trusted": {`["10.0.0.1"]`}}
		maps.Copy(form, serverKeys)
		wantPage(t, serve(mux, "POST", "/housekeeping/updates/config", keeper, form), http.StatusUnprocessableEntity,
			c.want, html.EscapeString("{Path:proxy.enabled Value:"+c.value+"}"))
	}
	wantPage(t, serve(mux, "POST", "/housekeeping/updates/config", helper, url.Values{"key.proxy.enabled": {"true"}}), http.StatusForbidden, "access-denied.html")
	if data, _ := os.ReadFile(config.Filename); string(data) != olderConfigJSON {
		t.Errorf("config.json changed: %s", data)
	}
	if logs := staffLogs(t, db); len(logs) != 0 {
		t.Errorf("staff logs = %+v, want none", logs)
	}
}
