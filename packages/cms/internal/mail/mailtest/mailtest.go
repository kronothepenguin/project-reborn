// Package mailtest is a small SMTP server for tests.
package mailtest

import (
	"bufio"
	"encoding/base64"
	"net"
	"strings"
	"sync"
	"testing"
	"time"
)

// Message is what a client delivered.
type Message struct {
	From string
	To   string
	Data string
}

// Server accepts every message and passes it to Messages. Credentials holds the
// last AUTH PLAIN username and password.
type Server struct {
	Host     string
	Port     int
	Messages chan Message

	mu          sync.Mutex
	credentials string
}

func (s *Server) Credentials() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.credentials
}

// Next returns the next message, and fails the test when none arrives.
func (s *Server) Next(t *testing.T) Message {
	t.Helper()
	select {
	case message := <-s.Messages:
		return message
	case <-time.After(5 * time.Second):
		t.Fatal("no mail arrived")
		return Message{}
	}
}

// Start runs a server until the test ends.
func Start(t *testing.T) *Server {
	t.Helper()
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	t.Cleanup(func() { listener.Close() })
	address := listener.Addr().(*net.TCPAddr)
	s := &Server{Host: address.IP.String(), Port: address.Port, Messages: make(chan Message, 16)}
	go func() {
		for {
			conn, err := listener.Accept()
			if err != nil {
				return
			}
			go s.serve(conn)
		}
	}()
	return s
}

func (s *Server) serve(conn net.Conn) {
	defer conn.Close()
	reader := bufio.NewReader(conn)
	reply := func(line string) { conn.Write([]byte(line + "\r\n")) }

	var message Message
	reply("220 mailtest")
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			return
		}
		line = strings.TrimRight(line, "\r\n")
		command := strings.ToUpper(line)
		switch {
		case strings.HasPrefix(command, "EHLO"):
			reply("250-mailtest")
			reply("250 AUTH PLAIN")
		case strings.HasPrefix(command, "AUTH PLAIN"):
			s.recordCredentials(strings.TrimPrefix(line, line[:len("AUTH PLAIN ")]))
			reply("235 ok")
		case strings.HasPrefix(command, "MAIL FROM:"):
			message.From = address(line)
			reply("250 ok")
		case strings.HasPrefix(command, "RCPT TO:"):
			message.To = address(line)
			reply("250 ok")
		case command == "DATA":
			reply("354 go on")
			var data strings.Builder
			for {
				text, err := reader.ReadString('\n')
				if err != nil {
					return
				}
				if text == ".\r\n" {
					break
				}
				data.WriteString(strings.TrimPrefix(text, "."))
			}
			message.Data = data.String()
			s.Messages <- message
			reply("250 ok")
		case command == "QUIT":
			reply("221 bye")
			return
		default:
			reply("250 ok")
		}
	}
}

func (s *Server) recordCredentials(encoded string) {
	decoded, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.credentials = strings.ReplaceAll(strings.TrimPrefix(string(decoded), "\x00"), "\x00", ":")
}

func address(line string) string {
	start, end := strings.IndexByte(line, '<'), strings.IndexByte(line, '>')
	if start < 0 || end < start {
		return ""
	}
	return line[start+1 : end]
}
