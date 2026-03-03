package main

import (
	"bufio"
	"bytes"
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

func main() {
	dotenv.Load()

	godotBin := dotenv.GetenvString("GODOT_BIN", "godot")
	presets := readPresetNames("client/export_presets.cfg")

	exportAll(godotBin, presets)

	go watch(godotBin, presets)

	log.Println("Serving web/client on http://localhost:8080")
	log.Fatal(http.ListenAndServe("localhost:8080", http.FileServer(http.Dir("web/client"))))
}

func exportAll(godotBin string, presets []string) {
	log.Println("Building main project...")
	out, err := godotExport(godotBin, "--export-debug", "main")
	if err != nil {
		log.Printf("\033[31m[error]\033[0m main:\n%s", out)
		log.Fatalf("Main export failed: %v", err)
	}
	log.Printf("\033[32m[ok]\033[0m main")

	pckPresets := presets[1:]
	workers := max(runtime.NumCPU()-1, 1)
	log.Printf("Building %d PCKs (%d workers)...", len(pckPresets), workers)
	log.Println(pckPresets)

	sem := make(chan struct{}, workers)
	var wg sync.WaitGroup
	for _, preset := range pckPresets {
		wg.Go(func() {
			sem <- struct{}{}

			out, err := godotExport(godotBin, "--export-pack", preset)
			if err != nil {
				log.Printf("\033[31m[error]\033[0m %s.pck:\n%s", preset, out)
				return
			}
			log.Printf("\033[32m[ok]\033[0m %s.pck", preset)

			<-sem
		})
	}
	wg.Wait()
	close(sem)
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

func watch(godotBin string, presets []string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Failed to create watcher: %v", err)
	}
	defer watcher.Close()

	pckPresets := make(map[string]bool)
	for _, p := range presets[1:] {
		pckPresets[p] = true
	}

	filepath.WalkDir("client", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			watcher.Add(path)
		}
		return nil
	})

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
					watcher.Add(event.Name)
				}
			}
			if event.Has(fsnotify.Remove) {
				watcher.Remove(event.Name)
			}

			if !event.Has(fsnotify.Write) && !event.Has(fsnotify.Create) {
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
			timers[preset] = time.AfterFunc(500*time.Millisecond, func() {
				rebuildPreset(godotBin, preset)
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

func rebuildPreset(godotBin, preset string) {
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
