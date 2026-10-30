package mail

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/mail/mailtest"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

var testConfig *config.Config

// config.Load reads config.json once per process, so the whole package shares
// one file, created with the defaults before any test runs.
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "mail-test-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(dir)
	if err := os.Chdir(dir); err != nil {
		log.Fatal(err)
	}
	if testConfig, err = config.Load(); err != nil {
		log.Fatal(err)
	}
	m.Run()
}

func setup(t *testing.T) *sql.DB {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if err := settings.Load(t.Context(), testConfig, db); err != nil {
		t.Fatalf("settings.Load: %v", err)
	}
	return db
}

func configure(t *testing.T, db *sql.DB, values map[string]any) {
	t.Helper()
	for key, value := range values {
		if err := settings.Set(t.Context(), db, 0, key, value); err != nil {
			t.Fatalf("set %s: %v", key, err)
		}
	}
}

func TestSendDeliversAMessage(t *testing.T) {
	db := setup(t)
	server := mailtest.Start(t)
	configure(t, db, map[string]any{"mail.host": server.Host, "mail.port": server.Port, "mail.from": "Hotel <hotel@example.com>"})

	if err := Send(t.Context(), "habbo@example.com", "Forgot password", "Hello,\n.dotted line\n"); err != nil {
		t.Fatalf("Send: %v", err)
	}

	message := server.Next(t)
	if message.From != "hotel@example.com" || message.To != "habbo@example.com" {
		t.Errorf("envelope = %q to %q", message.From, message.To)
	}
	for _, want := range []string{
		`From: "Hotel" <hotel@example.com>`,
		"To: <habbo@example.com>",
		"Subject: Forgot password",
		"Content-Type: text/plain; charset=utf-8",
		"\r\n\r\nHello,\r\n.dotted line\r\n",
	} {
		if !strings.Contains(message.Data, want) {
			t.Errorf("the message does not contain %q:\n%s", want, message.Data)
		}
	}
}

func TestSendEncodesASubjectWithAccents(t *testing.T) {
	db := setup(t)
	server := mailtest.Start(t)
	configure(t, db, map[string]any{"mail.host": server.Host, "mail.port": server.Port, "mail.from": "hotel@example.com"})

	if err := Send(t.Context(), "habbo@example.com", "Hôtel", "Hello"); err != nil {
		t.Fatalf("Send: %v", err)
	}
	if message := server.Next(t); !strings.Contains(message.Data, "Subject: =?utf-8?q?H=C3=B4tel?=") {
		t.Errorf("the subject is not encoded:\n%s", message.Data)
	}
}

func TestSendAuthenticatesWhenConfigured(t *testing.T) {
	db := setup(t)
	server := mailtest.Start(t)
	configure(t, db, map[string]any{
		"mail.host":     server.Host,
		"mail.port":     server.Port,
		"mail.from":     "hotel@example.com",
		"mail.username": "hotel",
		"mail.password": "smtp-secret",
	})

	if err := Send(t.Context(), "habbo@example.com", "Subject", "Hello"); err != nil {
		t.Fatalf("Send: %v", err)
	}
	server.Next(t)
	if got := server.Credentials(); got != "hotel:smtp-secret" {
		t.Errorf("the server got credentials %q", got)
	}
}

func TestSendWithoutAHostIsDisabled(t *testing.T) {
	setup(t)
	if err := Send(t.Context(), "habbo@example.com", "Subject", "Hello"); !errors.Is(err, ErrDisabled) {
		t.Errorf("Send() = %v, want ErrDisabled", err)
	}
}

func TestSendNeedsAFromAddress(t *testing.T) {
	db := setup(t)
	configure(t, db, map[string]any{"mail.host": "127.0.0.1"})
	if err := Send(t.Context(), "habbo@example.com", "Subject", "Hello"); err == nil {
		t.Error("Send() without mail.from = nil, want an error")
	}
}

func TestSendRefusesACarriageReturnInTheRecipient(t *testing.T) {
	db := setup(t)
	server := mailtest.Start(t)
	configure(t, db, map[string]any{"mail.host": server.Host, "mail.port": server.Port, "mail.from": "hotel@example.com"})

	if err := Send(t.Context(), "habbo@example.com\r\nBcc: other@example.com", "Subject", "Hello"); err == nil {
		t.Error("Send() with a header in the recipient = nil, want an error")
	}
}

func TestSendGivesUpOnAServerThatDoesNotAnswer(t *testing.T) {
	db := setup(t)
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	defer listener.Close()
	address := listener.Addr().(*net.TCPAddr)
	configure(t, db, map[string]any{"mail.host": address.IP.String(), "mail.port": address.Port, "mail.from": "hotel@example.com"})

	ctx, cancel := context.WithTimeout(t.Context(), 100*time.Millisecond)
	defer cancel()
	started := time.Now()
	if err := Send(ctx, "habbo@example.com", "Subject", "Hello"); err == nil {
		t.Error("Send() to a silent server = nil, want an error")
	}
	if elapsed := time.Since(started); elapsed > 5*time.Second {
		t.Errorf("Send() took %v, want it to stop at the deadline", elapsed)
	}
}
