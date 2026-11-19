package cms

import (
	"database/sql"
	"fmt"
	"io/fs"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The page's parameters as printPage prints them, with the address of serve's
// requests and config.json's default game addresses.
const (
	clientSite    = "http://example.com/"
	clientInfo    = "{Name:sw2 Value:connection.info.host=localhost;connection.info.port=30000}"
	clientMUS     = "{Name:sw3 Value:connection.mus.host=localhost;connection.mus.port=30001}"
	clientFailed  = "{Name:sw6 Value:client.connection.failed.url=" + clientSite + "client/utils?key=connection_failed;external.variables.txt=" + clientSite + "dcr/external_variables.txt}"
	clientTexts   = "{Name:sw7 Value:external.texts.txt=" + clientSite + "dcr/external_texts.txt;user_isp=192.0.2.1}"
	clientReload  = "{Name:sw5 Value:client.reload.url=" + clientSite + "client?x=reauthenticate;client.fatal.error.url=" + clientSite + "client/utils?key=error}"
	clientMovie   = "Movie:" + clientSite + "dcr/habbo.dcr"
	clientSignIn  = "client/utils.html {Key:LogInPlease "
	wideClient    = "Width:960 Height:540"
	narrowClient  = "Width:720 Height:540"
	clientForward = "{Name:sw9 Value:forward.id="
)

// newClientSite mounts a CMS like newSite, with a running game, which the client
// page needs.
func newClientSite(t *testing.T) (*sql.DB, *http.ServeMux) {
	t.Helper()
	return newHotelSite(t, running(0))
}

func clientSetting(t *testing.T, db *sql.DB, key string, value bool) {
	t.Helper()
	if err := settings.Set(t.Context(), store.New(db), 0, key, value); err != nil {
		t.Fatalf("set %s: %v", key, err)
	}
}

// ssoTicket returns the one ticket the habbo holds.
func ssoTicket(t *testing.T, db *sql.DB, name string) string {
	t.Helper()
	var ticket string
	err := db.QueryRowContext(t.Context(), `SELECT id FROM sso_tickets WHERE avatar_id = ?`, avatarID(t, db, name)).Scan(&ticket)
	if err != nil {
		t.Fatalf("the ticket of %s: %v", name, err)
	}
	return ticket
}

func TestASignedInHabboGetsTheClientWithItsTicketAndTheGamesAddresses(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")

	rec := serve(mux, "GET", "/client", cookie, nil)

	wantPage(t, rec, http.StatusOK, "client.html {Name:Reborn Hotel ShortName:Reborn ", clientMovie,
		"{Name:sw8 Value:use.sso.ticket=1;sso.ticket="+ssoTicket(t, db, "Dora")+"}",
		clientInfo, clientMUS, clientFailed, clientTexts, clientReload,
		"{Name:sw4 Value:site.url="+clientSite+";url.prefix="+clientSite+"}",
		"{Name:sw1 Value:client.allow.cross.domain=1;client.notify.cross.domain=0}")
}

func TestAGuestIsAskedToSignInBeforeTheClient(t *testing.T) {
	_, mux := newClientSite(t)

	wantRedirect(t, serve(mux, "GET", "/client", nil, nil), "/client/utils?key=LogInPlease")
	for _, key := range []string{"LogInPlease", "error", "connection_failed", "cacheCheck"} {
		wantPage(t, serve(mux, "GET", "/client/utils?key="+key, nil, nil), http.StatusOK, clientSignIn)
	}
}

func TestTheClientIsWideByTheSettingOrTheAddress(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")

	// Holo's client-widescreen is on: the client is wide unless the address says otherwise.
	wantPage(t, serve(mux, "GET", "/client", cookie, nil), http.StatusOK, "WideBody:true "+wideClient)
	wantPage(t, serve(mux, "GET", "/client?wide=true", cookie, nil), http.StatusOK, wideClient)
	wantPage(t, serve(mux, "GET", "/client?wide=false", cookie, nil), http.StatusOK, narrowClient)

	clientSetting(t, db, "features.clientWideScreen", false)
	wantPage(t, serve(mux, "GET", "/client", cookie, nil), http.StatusOK, "WideBody:false "+narrowClient)
	wantPage(t, serve(mux, "GET", "/client?wide=true", cookie, nil), http.StatusOK, wideClient)
}

func TestTheLoaderShowsWhileItsSettingIsOn(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")

	wantPage(t, serve(mux, "GET", "/client", cookie, nil), http.StatusOK, "Loader:true")

	clientSetting(t, db, "features.clientLoader", false)
	wantPage(t, serve(mux, "GET", "/client", cookie, nil), http.StatusOK, "Loader:false")
}

func TestTheClientOpensInARoomThatExists(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")
	room, err := store.New(db).CreateRoom(t.Context(), store.CreateRoomParams{AvatarID: avatarID(t, db, "Dora"), RoomCategoryID: 2, RoomModelID: 1, Name: "Den", Door: "open", CreatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateRoom: %v", err)
	}

	path := fmt.Sprintf("/client?roomId=%d&forwardId=2", room.ID)
	wantPage(t, serve(mux, "GET", path, cookie, nil), http.StatusOK, fmt.Sprintf("%s%d;forward.type=2;processlog.enabled=1}", clientForward, room.ID))

	for _, path := range []string{fmt.Sprintf("/client?roomId=%d", room.ID+1) + "&forwardId=2", fmt.Sprintf("/client?roomId=%d&forwardId=1", room.ID), "/client?roomId=den&forwardId=2"} {
		rec := serve(mux, "GET", path, cookie, nil)
		wantPage(t, rec, http.StatusOK, "client.html", clientReload)
		if strings.Contains(rec.Body.String(), clientForward) {
			t.Errorf("%s forwards to a room: %s", path, rec.Body)
		}
	}
}

func TestTheClientLoadsFromTheAddressTheBrowserUsed(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")
	r := httptest.NewRequest("GET", "/client", nil)
	r.Host = "hotel.example.com:8080"
	r.AddCookie(cookie)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, r)

	site := "http://hotel.example.com:8080/"
	wantPage(t, rec, http.StatusOK, "Movie:"+site+"dcr/habbo.dcr",
		"{Name:sw4 Value:site.url="+site+";url.prefix="+site+"}",
		"external.variables.txt="+site+"dcr/external_variables.txt",
		"external.texts.txt="+site+"dcr/external_texts.txt",
		"client.reload.url="+site+"client?x=reauthenticate")
}

func TestTheClientLoadsFromTheAddressATrustedProxyForwards(t *testing.T) {
	cfg := config.Get()
	cfg.Proxy.Enabled = true
	t.Cleanup(func() { cfg.Proxy.Enabled = false })
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")
	r := httptest.NewRequest("GET", "/client", nil)
	r.RemoteAddr = "127.0.0.1:5000"
	r.Header.Set("X-Forwarded-For", "198.51.100.7")
	r.Header.Set("X-Forwarded-Host", "hotel.example.com")
	r.Header.Set("X-Forwarded-Proto", "https")
	r.AddCookie(cookie)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, r)

	site := "https://hotel.example.com/"
	wantPage(t, rec, http.StatusOK, "Movie:"+site+"dcr/habbo.dcr",
		"{Name:sw4 Value:site.url="+site+";url.prefix="+site+"}",
		"external.variables.txt="+site+"dcr/external_variables.txt",
		"external.texts.txt="+site+"dcr/external_texts.txt;user_isp=198.51.100.7")
}

func TestAFailedConnectionNamesTheGamesAddressAndPort(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")

	rec := serve(mux, "GET", "/client/utils?key=connection_failed", login(t, db, "Dora"), nil)

	wantPage(t, rec, http.StatusOK, "client/utils.html {Key:connection_failed Name:Reborn Hotel ShortName:Reborn Host:localhost Port:30000}")
}

func TestAFatalErrorShowsHolosPage(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")

	wantPage(t, serve(mux, "GET", "/client/utils?key=error", login(t, db, "Dora"), nil), http.StatusOK, "client/utils.html {Key:error ")
}

func TestTheClientsReloadGivesAFreshTicket(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")
	first := ssoTicket(t, db, "Dora")
	// The game spends the ticket at login.
	if _, err := store.New(db).SpendSSOTicket(t.Context(), store.SpendSSOTicketParams{ID: first, Now: testNow}); err != nil {
		t.Fatalf("SpendSSOTicket: %v", err)
	}

	rec := serve(mux, "GET", "/client?x=reauthenticate", cookie, nil)

	fresh := ssoTicket(t, db, "Dora")
	if fresh == first {
		t.Fatalf("the reload kept the spent ticket %s", first)
	}
	wantPage(t, rec, http.StatusOK, "{Name:sw8 Value:use.sso.ticket=1;sso.ticket="+fresh+"}")
}

// What clientutils.php answered the client's other keys, and unloadclient.php.
func TestTheClientsOtherCallsAnswerAsHolos(t *testing.T) {
	db, mux := newClientSite(t)
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")

	for key, want := range map[string]string{"cacheCheck": "true", "cache": "true", "keepalive": "", "LogInPlease": ""} {
		rec := serve(mux, "GET", "/client/utils?key="+key, cookie, nil)
		if rec.Code != http.StatusOK || rec.Body.String() != want {
			t.Errorf("key %s: got %d %q, want %q", key, rec.Code, rec.Body, want)
		}
	}

	rec := serve(mux, "POST", "/client/unload", cookie, nil)
	if rec.Code != http.StatusOK || rec.Body.Len() != 0 {
		t.Errorf("unload: got %d %q, want an empty answer", rec.Code, rec.Body)
	}
	wantRedirect(t, serve(mux, "POST", "/client/unload", nil, nil), "/")
}

// The built page names LibreShockwave and its licence, and links to the source
// make player built it from, or to the repository before the player is built.
func TestTheClientPageNamesLibreShockwaveAndLinksToItsSource(t *testing.T) {
	page, err := fs.ReadFile(DistFS, "dist/client.html")
	if err != nil {
		t.Fatalf("the built client page: %v", err)
	}
	source := "https://github.com/LibreShockwave/LibreShockwave"
	if built, err := fs.ReadFile(DistFS, "dist/libreshockwave/source.txt"); err == nil {
		source = strings.TrimSpace(string(built))
		if !strings.HasPrefix(source, "https://github.com/LibreShockwave/LibreShockwave/tree/") {
			t.Errorf("the player's source is %q, want a commit of LibreShockwave", source)
		}
	}
	for _, want := range []string{`href="` + source + `"`, ">LibreShockwave</a>", "GNU AGPL-3.0"} {
		if !strings.Contains(string(page), want) {
			t.Errorf("the client page does not contain %q", want)
		}
	}
}

// newBuiltSite mounts a CMS with the built pages on a new database, with h
// injected as the game.
func newBuiltSite(t *testing.T, h services.Hotel) (*sql.DB, *http.ServeMux) {
	t.Helper()
	dist, err := fs.Sub(DistFS, "dist")
	if err != nil {
		t.Fatalf("the built pages: %v", err)
	}
	db := openDB(t)
	mux := http.NewServeMux()
	site := New(db, WithResolver(astro.MakeFSResolver(dist)), WithStatic(http.FileServerFS(dist)))
	site.Inject(Services{Hotel: h})
	site.Mount(mux)
	return db, mux
}
