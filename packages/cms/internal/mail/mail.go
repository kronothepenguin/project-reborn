// Package mail sends the hotel's mail through the SMTP server in the mail.*
// settings.
package mail

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"mime"
	"net"
	netmail "net/mail"
	"net/smtp"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// sendTimeout bounds a whole conversation with the server, which net/smtp's
// SendMail does not do.
const sendTimeout = 30 * time.Second

// ErrDisabled means mail.host is empty, so no mail goes out.
var ErrDisabled = errors.New("mail: mail.host is not set")

// Send delivers a plain text message to one address. It upgrades to TLS when
// the server offers it, and it authenticates when mail.username is set, which
// net/smtp refuses to do without TLS except on localhost.
func Send(ctx context.Context, to, subject, body string) error {
	host := settings.GetString("mail.host")
	if host == "" {
		return ErrDisabled
	}
	from, err := netmail.ParseAddress(settings.GetString("mail.from"))
	if err != nil {
		return fmt.Errorf("mail: mail.from: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, sendTimeout)
	defer cancel()
	address := net.JoinHostPort(host, strconv.Itoa(settings.GetInt("mail.port")))
	conn, err := (&net.Dialer{}).DialContext(ctx, "tcp", address)
	if err != nil {
		return fmt.Errorf("mail: %w", err)
	}
	defer conn.Close()
	if deadline, ok := ctx.Deadline(); ok {
		if err := conn.SetDeadline(deadline); err != nil {
			return fmt.Errorf("mail: %w", err)
		}
	}

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return fmt.Errorf("mail: %w", err)
	}
	defer client.Close()
	if ok, _ := client.Extension("STARTTLS"); ok {
		if err := client.StartTLS(&tls.Config{ServerName: host}); err != nil {
			return fmt.Errorf("mail: %w", err)
		}
	}
	if username := settings.GetString("mail.username"); username != "" {
		auth := smtp.PlainAuth("", username, settings.GetString("mail.password"), host)
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("mail: %w", err)
		}
	}
	if err := client.Mail(from.Address); err != nil {
		return fmt.Errorf("mail: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("mail: %w", err)
	}
	data, err := client.Data()
	if err != nil {
		return fmt.Errorf("mail: %w", err)
	}
	if _, err := data.Write(message(from, to, subject, body)); err != nil {
		return fmt.Errorf("mail: %w", err)
	}
	if err := data.Close(); err != nil {
		return fmt.Errorf("mail: %w", err)
	}
	if err := client.Quit(); err != nil {
		return fmt.Errorf("mail: %w", err)
	}
	return nil
}

func message(from *netmail.Address, to, subject, body string) []byte {
	recipient := netmail.Address{Address: to}
	return fmt.Appendf(nil, "From: %s\r\nTo: %s\r\nSubject: %s\r\nDate: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n%s",
		from, recipient.String(), mime.QEncoding.Encode("utf-8", subject), time.Now().Format(time.RFC1123Z), body)
}
