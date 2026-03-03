package main

import (
	"bytes"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/kronothepenguin/project-reborn/internal/pkg/dotenv"
)

// watchDirs are the directories whose changes should trigger a rebuild.
var watchDirs = []string{
	"client/figurepreview",
	"client/director",
	"client/hh_human",
}

func init() {
	// Also watch all hh_human_* directories.
	dirs, _ := filepath.Glob("client/hh_human_*")
	watchDirs = append(watchDirs, dirs...)
}

func main() {
	dotenv.Load()

	godotBin := dotenv.GetenvString("GODOT_BIN", "godot")

	build(godotBin)

	go watch(godotBin)

	log.Println("Serving web/figurepreview on http://localhost:8081")
	log.Fatal(http.ListenAndServe("localhost:8081", http.FileServer(http.Dir("web/figurepreview"))))
}

func build(godotBin string) {
	log.Println("Building figurepreview...")
	cmd := exec.Command(godotBin, "--headless", "--export-debug", "figurepreview", "--path", "client")
	var buf bytes.Buffer
	cmd.Stdout = &buf
	cmd.Stderr = &buf
	if err := cmd.Run(); err != nil {
		log.Printf("\033[31m[error]\033[0m figurepreview:\n%s", buf.Bytes())
		log.Fatalf("figurepreview export failed: %v", err)
	}
	log.Printf("\033[32m[ok]\033[0m figurepreview")
}

var ignoredExts = map[string]bool{
	".import": true,
	".uid":    true,
}

func watch(godotBin string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Failed to create watcher: %v", err)
	}
	defer watcher.Close()

	for _, dir := range watchDirs {
		filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if d.IsDir() {
				if d.Name() == ".godot" {
					return filepath.SkipDir
				}
				watcher.Add(path)
			}
			return nil
		})
	}

	var mu sync.Mutex
	var timer *time.Timer

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

			if ignoredExts[filepath.Ext(event.Name)] {
				continue
			}

			// Only rebuild for changes in watched dirs.
			relevant := false
			for _, dir := range watchDirs {
				if strings.HasPrefix(event.Name, dir) {
					relevant = true
					break
				}
			}
			if !relevant {
				continue
			}

			mu.Lock()
			if timer != nil {
				timer.Stop()
			}
			timer = time.AfterFunc(time.Second, func() {
				log.Printf("\033[33m[rebuild]\033[0m figurepreview")
				build(godotBin)
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
