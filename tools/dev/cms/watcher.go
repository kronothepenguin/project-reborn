package main

import (
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/fsnotify/fsnotify"
	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func watch(dir string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalln(err)
	}
	defer watcher.Close()

	filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			watcher.Add(path)
		}

		return nil
	})

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}

			if event.Has(fsnotify.Remove) {
				info, err := os.Stat(event.Name)
				if err == nil && info.IsDir() {
					watcher.Remove(event.Name)
				}
			}

			if event.Has(fsnotify.Create) {
				info, err := os.Stat(event.Name)
				if err == nil && info.IsDir() {
					watcher.Add(event.Name)
				}
			}

			if (event.Has(fsnotify.Write) || event.Has(fsnotify.Create)) && strings.HasSuffix(event.Name, ".html") {
				log.Println("\033[32m[reload]\033[0m", event.Name)
				if err := tmpl.ReloadFS(os.DirFS(dir)); err != nil {
					log.Println("\033[31m", err, "\033[0m")
				}
				broadcast(event.Name)
			}

		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("\033[31m", err, "\033[0m")
		}
	}
}
