package main

import (
	"bytes"
	"go/format"
	"io/fs"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

func writeProbe(t *testing.T, kind string) string {
	t.Helper()
	return writeProject(t, kind, "probe")
}

func writeProject(t *testing.T, kind, name string) string {
	t.Helper()
	root := t.TempDir()
	if err := write(root, newProject(kind, name, 10001, 20001)); err != nil {
		t.Fatalf("write: %v", err)
	}
	return root
}

func checkContains(t *testing.T, root string, files map[string][]string) {
	t.Helper()
	for file, wants := range files {
		data, err := os.ReadFile(filepath.Join(root, file))
		if err != nil {
			t.Errorf("read the generated %s: %v", file, err)
			continue
		}
		for _, want := range wants {
			if !strings.Contains(string(data), want) {
				t.Errorf("the generated %s lacks %q:\n%s", file, want, data)
			}
		}
	}
}

// The dev runner works from the repository root, so the generated Makefile
// starts air there and .air.toml names every path from the root.
func TestWriteRendersTheRunnerFromTheRoot(t *testing.T) {
	root := writeProbe(t, fullstack)
	checkContains(t, root, map[string][]string{
		"apps/probe/.air.toml": {`cmd = "go build -o ./apps/probe/tmp/probe ./apps/probe/cmd/probe-dev"`},
		"apps/probe/Makefile":  {"cd ../.. && go tool air -c apps/probe/.air.toml"},
	})
}

// make install is what makes a fresh clone compile: the root runs it in every
// app, and the app runs the one of its package.
func TestWriteGeneratesInstallTargets(t *testing.T) {
	root := writeProbe(t, fullstack)
	checkContains(t, root, map[string][]string{
		"apps/probe/Makefile":     {"$(MAKE) -C ../../packages/probe install"},
		"packages/probe/Makefile": {"test -e dist/index.html ||"},
	})
}

// A new project is not in git yet and has no build, so it starts with the
// placeholder go:embed needs.
func TestWriteGeneratesThePlaceholder(t *testing.T) {
	root := writeProbe(t, fullstack)
	checkContains(t, root, map[string][]string{
		"packages/probe/dist/index.html": {"<title>probe</title>"},
	})
}

// A new app starts in the shape of the apps that exist: the runner opens the
// database and hands it to New, and a server that cannot start says why.
func TestWriteGeneratesTheCurrentAppShape(t *testing.T) {
	root := writeProbe(t, fullstack)
	checkContains(t, root, map[string][]string{
		"apps/probe/cmd/probe/main.go": {
			"db := store.FromConfig()",
			"probe.New(db,",
			"probe.WithResolver(resolver)",
			"probe.WithStatic(fileServer)",
			"log.Fatalln(server.ListenAndServe())",
		},
		"apps/probe/cmd/probe-dev/main.go": {
			"db := store.FromConfig()",
			"probe.New(db,",
			"probe.WithResolver(resolver)",
			"probe.WithStatic(proxy)",
			"log.Fatalln(server.ListenAndServe())",
		},
		"packages/probe/probe.go": {
			"func New(db *sql.DB, opts ...Option) *Probe {",
			"func (c *Probe) Mount(mux *http.ServeMux) {",
		},
		"packages/probe/internal/router/router.go": {"DB       *sql.DB"},
		"packages/probe/src/pages/index.astro":     {`<Counter client:only="svelte" />`},
		"packages/probe/src/components/counter.svelte": {
			"$state(0)",
			"onclick=",
		},
	})
}

// A backend is the fullstack project without its frontend: one runner that
// air builds, and a package that takes only the database.
func TestWriteGeneratesTheBackendShape(t *testing.T) {
	root := writeProbe(t, backend)
	checkContains(t, root, map[string][]string{
		"apps/probe/cmd/probe/main.go": {
			"db := store.FromConfig()",
			"c := probe.New(db)\n",
			`Addr:    "localhost:10001"`,
			"log.Fatalln(server.ListenAndServe())",
		},
		"apps/probe/.air.toml": {`cmd = "go build -o ./apps/probe/tmp/probe ./apps/probe/cmd/probe"`},
		"apps/probe/Makefile": {
			"$(MAKE) -C ../../packages/probe install",
			"cd ../.. && go tool air -c apps/probe/.air.toml",
		},
		"packages/probe/probe.go": {
			"func New(db *sql.DB) *Probe {",
			"func (c *Probe) Mount(mux *http.ServeMux) {",
			`mux.HandleFunc("GET /{$}", r.HandleIndexView)`,
		},
		"packages/probe/internal/router/router.go": {"DB      *sql.DB"},
		"packages/probe/Makefile":                  {"go mod download"},
	})

	for _, file := range []string{"apps/probe/cmd/probe-dev", "packages/probe/package.json", "packages/probe/dist"} {
		if _, err := os.Stat(filepath.Join(root, file)); err == nil {
			t.Errorf("a backend has %s", file)
		}
	}
	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		for _, frontend := range []string{"astro", "pnpm"} {
			if strings.Contains(strings.ToLower(string(data)), frontend) {
				t.Errorf("%s mentions %s", path, frontend)
			}
		}
		return nil
	})
	if err != nil {
		t.Fatalf("walk: %v", err)
	}
}

// A client is a plain Vite app (decision server/0018): Vite's default
// build takes index.html as its entry, so the config holds only the port.
// It has nothing in apps/ and no Go.
func TestWriteGeneratesTheClientShape(t *testing.T) {
	root := writeProbe(t, client)
	checkContains(t, root, map[string][]string{
		"packages/probe/package.json":   {`"name": "@project-reborn/probe"`, `"build": "vite build"`},
		"packages/probe/vite.config.js": {"port: " + strconv.Itoa(VitePort("probe")) + ","},
		"packages/probe/index.html":     {"<title>probe</title>", `<script type="module" src="/src/main.js"></script>`},
		"packages/probe/src/main.js":    {`"probe"`},
	})

	config, err := os.ReadFile(filepath.Join(root, "packages", "probe", "vite.config.js"))
	if err != nil {
		t.Fatalf("read the generated vite.config.js: %v", err)
	}
	if strings.Contains(string(config), "build") {
		t.Errorf("the generated vite.config.js changes Vite's build:\n%s", config)
	}

	if _, err := os.Stat(filepath.Join(root, "apps")); err == nil {
		t.Errorf("a client has a folder in apps/")
	}
	err = filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		if filepath.Ext(path) == ".go" || filepath.Base(path) == "go.mod" {
			t.Errorf("a client has %s", path)
		}
		return nil
	})
	if err != nil {
		t.Fatalf("walk: %v", err)
	}
}

// Generated code passes the same checks as hand-written code, so that
// make create leaves nothing to fix, whatever the name: admin sorts before
// astro, tracker after store, and game-server holds a dash.
func TestWriteGeneratesFormattedFiles(t *testing.T) {
	for _, kind := range kinds {
		for _, name := range []string{"probe", "admin", "tracker", "game-server"} {
			t.Run(kind+"/"+name, func(t *testing.T) {
				checkFormatted(t, writeProject(t, kind, name))
			})
		}
	}
}

func checkFormatted(t *testing.T, root string) {
	t.Helper()
	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		name, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		if !bytes.HasSuffix(data, []byte("\n")) {
			t.Errorf("%s does not end with a newline", name)
		}
		if filepath.Ext(path) != ".go" {
			return nil
		}
		formatted, err := format.Source(data)
		if err != nil {
			t.Errorf("%s does not parse: %v", name, err)
			return nil
		}
		if !bytes.Equal(formatted, data) {
			t.Errorf("%s is not formatted", name)
		}
		return nil
	})
	if err != nil {
		t.Fatalf("walk: %v", err)
	}
}

// A Go package name cannot hold a dash, so game-server holds package
// gameserver, while its folders and module paths keep the dash (decision
// server/0024). The runner names the import, as goimports writes an import
// whose package is not named after the last element of its path.
func TestWriteDropsTheDashFromThePackageName(t *testing.T) {
	const imp = `gameserver "github.com/kronothepenguin/project-reborn/packages/game-server"`
	for kind, files := range map[string]map[string][]string{
		backend: {
			"packages/game-server/game-server.go": {
				"package gameserver\n",
				"type Gameserver struct {",
				"func New(db *sql.DB) *Gameserver {",
				`"github.com/kronothepenguin/project-reborn/packages/game-server/internal/router"`,
			},
			"packages/game-server/go.mod": {"module github.com/kronothepenguin/project-reborn/packages/game-server\n"},
			"apps/game-server/go.mod":     {"module github.com/kronothepenguin/project-reborn/apps/game-server\n"},
			"apps/game-server/cmd/game-server/main.go": {
				"\t" + imp + "\n",
				"c := gameserver.New(db)\n",
				`log.Println("game-server on http://" + server.Addr)`,
			},
		},
		fullstack: {
			"packages/game-server/game-server.go": {
				"package gameserver\n",
				"type Gameserver struct {",
				"func New(db *sql.DB, opts ...Option) *Gameserver {",
			},
			"packages/game-server/go.mod": {"module github.com/kronothepenguin/project-reborn/packages/game-server\n"},
			"apps/game-server/cmd/game-server/main.go": {
				"\t" + imp + "\n",
				`fs.Sub(gameserver.DistFS, "dist")`,
				"c := gameserver.New(db,\n",
				"gameserver.WithResolver(resolver),\n",
				"gameserver.WithStatic(fileServer),\n",
			},
			"apps/game-server/cmd/game-server-dev/main.go": {
				"\t" + imp + "\n",
				"c := gameserver.New(db,\n",
				"gameserver.WithStatic(proxy),\n",
			},
		},
	} {
		t.Run(kind, func(t *testing.T) {
			root := writeProject(t, kind, "game-server")
			checkContains(t, root, files)
			for file := range files {
				if filepath.Ext(file) != ".go" {
					continue
				}
				data, err := os.ReadFile(filepath.Join(root, file))
				if err != nil {
					t.Fatalf("read the generated %s: %v", file, err)
				}
				if strings.Contains(string(data), "game-server.") {
					t.Errorf("the generated %s uses game-server as a Go name:\n%s", file, data)
				}
			}
		})
	}
}

// A name without a dash is its own package name, so the runner's import needs
// no name.
func TestWriteImportsAPackageNamedAfterItsFolderPlainly(t *testing.T) {
	for _, kind := range []string{backend, fullstack} {
		root := writeProbe(t, kind)
		checkContains(t, root, map[string][]string{
			"apps/probe/cmd/probe/main.go": {"\t\"github.com/kronothepenguin/project-reborn/packages/probe\"\n"},
		})
	}
}

// gofmt orders the imports of a block by path, and the project's path moves
// with its name: before astro for admin, after store for tracker.
func TestWriteSortsTheImports(t *testing.T) {
	for _, c := range []struct {
		kind, name, file string
		order            []string
	}{
		{backend, "tracker", "apps/tracker/cmd/tracker/main.go", []string{"/packages/store\"", "/packages/tracker\""}},
		{backend, "tracker", "packages/tracker/tracker.go", []string{"/packages/store\"", "/packages/tracker/internal/router\""}},
		{fullstack, "tracker", "apps/tracker/cmd/tracker/main.go", []string{"/packages/astro\"", "/packages/store\"", "/packages/tracker\""}},
		{fullstack, "tracker", "apps/tracker/cmd/tracker-dev/main.go", []string{"/packages/astro\"", "/packages/store\"", "/packages/tracker\""}},
		{fullstack, "tracker", "packages/tracker/tracker.go", []string{"/packages/astro\"", "/packages/store\"", "/packages/tracker/internal/router\""}},
		{fullstack, "admin", "apps/admin/cmd/admin/main.go", []string{"/packages/admin\"", "/packages/astro\"", "/packages/store\""}},
		{fullstack, "admin", "packages/admin/admin.go", []string{"/packages/admin/internal/router\"", "/packages/astro\"", "/packages/store\""}},
	} {
		data, err := os.ReadFile(filepath.Join(writeProject(t, c.kind, c.name), c.file))
		if err != nil {
			t.Fatalf("read the generated %s: %v", c.file, err)
		}
		last := -1
		for _, imp := range c.order {
			i := strings.Index(string(data), imp)
			if i <= last {
				t.Errorf("the %s %s imports %q out of the order %q:\n%s", c.kind, c.file, imp, c.order, data)
			}
			last = i
		}
	}
}

// The dry run shows only the folders and the servers the template has.
func TestPlanFollowsTheTemplate(t *testing.T) {
	for kind, want := range map[string]struct{ has, lacks []string }{
		fullstack: {
			has:   []string{"  apps/probe/\n", "cmd/probe-dev/main.go\n", "  app:   http://localhost:10001\n", "  astro: http://localhost:20001\n"},
			lacks: []string{"vite:"},
		},
		backend: {
			has:   []string{"  apps/probe/\n", "cmd/probe/main.go\n", "  app:   http://localhost:10001\n"},
			lacks: []string{"astro", "cmd/probe-dev", "vite:", "package.json"},
		},
		client: {
			has:   []string{"  packages/probe/\n", "vite.config.js\n", "  vite:  http://localhost:" + strconv.Itoa(VitePort("probe")) + "\n"},
			lacks: []string{"apps/probe", "app:", "astro", ".go\n"},
		},
	} {
		var plan bytes.Buffer
		printPlan(&plan, "/root", newProject(kind, "probe", 10001, 20001))
		for _, s := range want.has {
			if !strings.Contains(plan.String(), s) {
				t.Errorf("the %s plan lacks %q:\n%s", kind, s, plan.String())
			}
		}
		for _, s := range want.lacks {
			if strings.Contains(plan.String(), s) {
				t.Errorf("the %s plan has %q:\n%s", kind, s, plan.String())
			}
		}
	}
}
