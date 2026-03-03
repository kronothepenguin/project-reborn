package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/kronothepenguin/project-reborn/internal/pkg/dotenv"
)

const cacheFile = ".client-cache.json"

// buildCache stores the last build time per preset to skip unchanged presets.
type buildCache map[string]time.Time

func loadCache() buildCache {
	c := make(buildCache)
	data, err := os.ReadFile(cacheFile)
	if err != nil {
		return c
	}
	json.Unmarshal(data, &c)
	return c
}

func (c buildCache) save() {
	data, _ := json.Marshal(c)
	os.WriteFile(cacheFile, data, 0644)
}

// latestMtime returns the most recent modification time of files in a directory.
func latestMtime(dir string) time.Time {
	var latest time.Time
	filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return nil
		}
		ext := filepath.Ext(path)
		if ext == ".import" || ext == ".uid" {
			return nil
		}
		if info, err := d.Info(); err == nil && info.ModTime().After(latest) {
			latest = info.ModTime()
		}
		return nil
	})
	return latest
}

// skipPresets are non-PCK presets that this tool should not build.
var skipPresets = map[string]bool{
	"main":          true,
	"figurepreview": true,
}

func main() {
	dotenv.Load()

	godotBin := dotenv.GetenvString("GODOT_BIN", "godot")
	allPresets := readPresetNames("client/export_presets.cfg")

	var pckPresets []string
	for _, p := range allPresets {
		if !skipPresets[p] {
			pckPresets = append(pckPresets, p)
		}
	}

	exportAll(godotBin, pckPresets)

	go watch(godotBin, pckPresets)

	log.Println("Serving web/client on http://localhost:8080")
	log.Fatal(http.ListenAndServe("localhost:8080", http.FileServer(http.Dir("web/client"))))
}

func exportAll(godotBin string, presets []string) {
	cache := loadCache()

	// Build main: check fuse_client/, director/, and root files in client/.
	mainDirs := []string{"client/fuse_client", "client/director"}
	var mainLatest time.Time
	for _, d := range mainDirs {
		if t := latestMtime(d); t.After(mainLatest) {
			mainLatest = t
		}
	}
	// Also check root-level files in client/ (main.tscn, project.godot, etc.)
	entries, _ := os.ReadDir("client")
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		if info, err := e.Info(); err == nil && info.ModTime().After(mainLatest) {
			mainLatest = info.ModTime()
		}
	}

	if lastBuild, ok := cache["main"]; ok && !mainLatest.After(lastBuild) {
		log.Printf("\033[36m[cached]\033[0m main")
	} else {
		log.Println("Building main project...")
		out, err := godotExport(godotBin, "--export-debug", "main")
		if err != nil {
			log.Printf("\033[31m[error]\033[0m main:\n%s", out)
			log.Fatalf("Main export failed: %v", err)
		}
		log.Printf("\033[32m[ok]\033[0m main")
		cache["main"] = time.Now()
	}

	workers := max(runtime.NumCPU()-1, 1)
	log.Printf("Building %d PCKs (%d workers)...", len(presets), workers)

	sem := make(chan struct{}, workers)
	var wg sync.WaitGroup
	var mu sync.Mutex
	for _, preset := range presets {
		wg.Go(func() {
			sem <- struct{}{}
			defer func() { <-sem }()

			dir := filepath.Join("client", preset)
			mtime := latestMtime(dir)

			mu.Lock()
			lastBuild, ok := cache[preset]
			mu.Unlock()

			if ok && !mtime.After(lastBuild) {
				log.Printf("\033[36m[cached]\033[0m %s.pck", preset)
				return
			}

			out, err := godotExport(godotBin, "--export-pack", preset)

			mu.Lock()
			if err != nil {
				log.Printf("\033[31m[error]\033[0m %s.pck:\n%s", preset, out)
			} else {
				log.Printf("\033[32m[ok]\033[0m %s.pck", preset)
				cache[preset] = time.Now()
			}
			mu.Unlock()
		})
	}
	wg.Wait()

	cache.save()
	log.Println("Build complete.")
}

func godotExport(godotBin, mode, preset string) ([]byte, error) {
	cmd := exec.Command(godotBin, "--headless", mode, preset, "--path", "client")
	var buf bytes.Buffer
	cmd.Stdout = &buf
	cmd.Stderr = &buf
	err := cmd.Run()
	return buf.Bytes(), err
}

// ignoredExts are file extensions that Godot generates/modifies during export.
// Changes to these should not trigger a rebuild.
var ignoredExts = map[string]bool{
	".import": true,
	".uid":    true,
}

func watch(godotBin string, presets []string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Failed to create watcher: %v", err)
	}
	defer watcher.Close()

	pckPresets := make(map[string]bool)
	for _, p := range presets {
		pckPresets[p] = true
	}

	filepath.WalkDir("client", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			name := d.Name()
			// Skip .godot/ and .godot subdirectories — Godot writes to these during export.
			if name == ".godot" {
				return filepath.SkipDir
			}
			watcher.Add(path)
		}
		return nil
	})

	cache := loadCache()
	timers := make(map[string]*time.Timer)
	var mu sync.Mutex

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}

			if event.Has(fsnotify.Create) {
				if info, err := os.Stat(event.Name); err == nil && info.IsDir() {
					if filepath.Base(event.Name) != ".godot" {
						watcher.Add(event.Name)
					}
				}
			}
			if event.Has(fsnotify.Remove) {
				watcher.Remove(event.Name)
			}

			if !event.Has(fsnotify.Write) && !event.Has(fsnotify.Create) {
				continue
			}

			// Ignore Godot-generated files to prevent rebuild loops.
			if ignoredExts[filepath.Ext(event.Name)] {
				continue
			}

			preset := resolvePreset(event.Name, pckPresets)
			if preset == "" {
				continue
			}

			mu.Lock()
			if t, ok := timers[preset]; ok {
				t.Stop()
			}
			timers[preset] = time.AfterFunc(time.Second, func() {
				rebuildPreset(godotBin, preset, &cache, &mu)
			})
			mu.Unlock()

		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Printf("\033[31m[watch error]\033[0m %v", err)
		}
	}
}

// resolvePreset maps a changed file path to the preset that should be rebuilt.
// Files under client/hh_*/ map to that specific PCK preset.
// Files elsewhere under client/ (e.g. fuse_client/, director/) map to "main".
func resolvePreset(path string, pckPresets map[string]bool) string {
	rel, err := filepath.Rel("client", path)
	if err != nil {
		return ""
	}

	parts := strings.SplitN(rel, string(filepath.Separator), 2)
	if len(parts) == 0 {
		return ""
	}

	dir := parts[0]
	if pckPresets[dir] {
		return dir
	}

	if len(parts) >= 2 || filepath.Ext(path) != "" {
		return "main"
	}

	return ""
}

func rebuildPreset(godotBin, preset string, cache *buildCache, mu *sync.Mutex) {
	if preset == "main" {
		log.Printf("\033[33m[rebuild]\033[0m %s", preset)
		out, err := godotExport(godotBin, "--export-debug", preset)
		if err != nil {
			log.Printf("\033[31m[error]\033[0m %s:\n%s", preset, out)
			return
		}
	} else {
		log.Printf("\033[33m[rebuild]\033[0m %s.pck", preset)
		out, err := godotExport(godotBin, "--export-pack", preset)
		if err != nil {
			log.Printf("\033[31m[error]\033[0m %s.pck:\n%s", preset, out)
			return
		}
	}
	log.Printf("\033[32m[ok]\033[0m %s", preset)

	mu.Lock()
	(*cache)[preset] = time.Now()
	cache.save()
	mu.Unlock()
}

func readPresetNames(path string) []string {
	f, err := os.Open(path)
	if err != nil {
		log.Fatalf("Failed to read presets file: %v", err)
	}
	defer f.Close()

	var names []string
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "name=") {
			name := strings.Trim(line[5:], "\"")
			names = append(names, name)
		}
	}
	return names
}
