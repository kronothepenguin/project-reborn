package habbo

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/kronothepenguin/project-reborn/internal/app/habbo/cms"
	"github.com/kronothepenguin/project-reborn/internal/app/habbo/storage"
	"github.com/kronothepenguin/project-reborn/internal/pkg/dotenv"
	_ "github.com/mattn/go-sqlite3"
)

type HabboApp struct {
	httpServer *http.Server

	storage *storage.Storage
}

func New() *HabboApp {
	dotenv.Load()

	host := dotenv.GetenvString("HABBO_APP_HOST", "localhost")
	port := dotenv.GetenvInt("HABBO_APP_PORT", 31337) // 42071, 50021
	addr := host + ":" + strconv.Itoa(port)

	httpServer := http.Server{
		Addr: addr,
	}

	return &HabboApp{
		httpServer: &httpServer,
	}
}

func (h *HabboApp) Run() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		log.Printf("Starting HTTP server at http://%s\n", h.httpServer.Addr)
		if err := h.httpServer.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalln(err)
		}
	}()

	go func() {
		// Verify installation status
		// Set installation handler if not installed yet (includes housekeeping)
		// Wait for installation to be done
		// Keep housekeeping enabled
		// Set cms handler if enabled
		// Set game server websocket endpoint if enabled

		db, err := sql.Open("sqlite3", "file:habbo.db?_fk=true&_journal=WAL")
		if err != nil {
			cancel()
			log.Fatalln(err)
		}

		// if shouldInstall(db) {
		// 	log.Println("Installation in progress...")
		// 	done := make(chan struct{})
		// 	h.httpServer.Handler = createInstallationHandler(db, done)
		// 	<-done
		// }

		h.storage = storage.New(db)
		h.httpServer.Handler = cms.ServeMux()
	}()

	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

loop:
	for {
		select {
		case <-sigchan:
			break loop

		case <-ctx.Done():
			close(sigchan)
			break loop
		}
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer shutdownCancel()

	if err := h.httpServer.Shutdown(shutdownCtx); err != nil {
		log.Fatalln(err)
	}

	return nil
}
