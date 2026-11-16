package mail

import (
	"context"
	"errors"
	"net"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/mail/mailtest"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func setup(t *testing.T) *store.Queries {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return store.New(db)
}

func configure(t *testing.T, q *store.Queries, values map[string]any) {
	t.Helper()
	for key, value := range values {
		if err := settings.Set(t.Context(), q, 0, key, value); err != nil {
			t.Fatalf("set %s: %v", key, err)
		}
	}
}

func TestSendDeliversAMessage(t *testing.T) {
	q := setup(t)
	server := mailtest.Start(t)
	configure(t, q, map[string]any{"mail.host": server.Host, "mail.port": server.Port, "mail.from": "Hotel <hotel@example.com>"})

	if err := Send(t.Context(), q, "habbo@example.com", "Forgot password", "Hello,\n.dotted line\n"); err != nil {
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

func TestSendAuthenticatesWhenConfigured(t *testing.T) {
	q := setup(t)
	server := mailtest.Start(t)
	configure(t, q, map[string]any{
		"mail.host":     server.Host,
		"mail.port":     server.Port,
		"mail.from":     "hotel@example.com",
		"mail.username": "hotel",
		"mail.password": "smtp-secret",
	})

	if err := Send(t.Context(), q, "habbo@example.com", "Subject", "Hello"); err != nil {
		t.Fatalf("Send: %v", err)
	}
	server.Next(t)
	if got := server.Credentials(); got != "hotel:smtp-secret" {
		t.Errorf("the server got credentials %q", got)
	}
}

func TestSendWithoutAHostIsDisabled(t *testing.T) {
	q := setup(t)
	if err := Send(t.Context(), q, "habbo@example.com", "Subject", "Hello"); !errors.Is(err, ErrDisabled) {
		t.Errorf("Send() = %v, want ErrDisabled", err)
	}
}

func TestSendNeedsAFromAddress(t *testing.T) {
	q := setup(t)
	configure(t, q, map[string]any{"mail.host": "127.0.0.1"})
	if err := Send(t.Context(), q, "habbo@example.com", "Subject", "Hello"); err == nil {
		t.Error("Send() without mail.from = nil, want an error")
	}
}

func TestSendGivesUpOnAServerThatDoesNotAnswer(t *testing.T) {
	q := setup(t)
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	defer listener.Close()
	address := listener.Addr().(*net.TCPAddr)
	configure(t, q, map[string]any{"mail.host": address.IP.String(), "mail.port": address.Port, "mail.from": "hotel@example.com"})

	ctx, cancel := context.WithTimeout(t.Context(), 100*time.Millisecond)
	defer cancel()
	started := time.Now()
	if err := Send(ctx, q, "habbo@example.com", "Subject", "Hello"); err == nil {
		t.Error("Send() to a silent server = nil, want an error")
	}
	if elapsed := time.Since(started); elapsed > 5*time.Second {
		t.Errorf("Send() took %v, want it to stop at the deadline", elapsed)
	}
}
