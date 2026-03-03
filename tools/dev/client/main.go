package main

import (
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/kronothepenguin/project-reborn/internal/pkg/dotenv"
)

func main() {
	dotenv.Load()

	godotBin := dotenv.GetenvString("GODOT_BIN", "godot")

	log.Println("Building Godot client...")

	cmd := exec.Command(godotBin, "--headless", "--export-debug", "main", "--path", "client")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Fatalf("Godot build failed: %v", err)
	}

	log.Println("Build complete. Serving web/client on http://localhost:8080")
	log.Fatal(http.ListenAndServe("localhost:8080", http.FileServer(http.Dir("web/client"))))
}
