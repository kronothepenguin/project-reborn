package r26

import (
	"errors"
	"io"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
)

// The bytes come from packages/server/knowledge/r26/hh_entry_init.md, which computed them with literal ports of the
// client's send, sendNew, GetIntFrom and GetStrFrom.
func TestReadPacketReadsTheClientsCommands(t *testing.T) {
	for _, c := range []struct {
		name, in string
		id       int
		body     string
	}{
		{"INIT_CRYPTO", "@@BCN", 206, ""},
		{"GENERATEKEY with the key ab", "@@F_R@Bab", 2002, "@Bab"},
		{"VERSIONCHECK with the version 1 and two empty strings", "@@GRRI@@@@", 1170, "I@@@@"},
		{"UNIQUEID with the machine id abc", "@@GLm@Cabc", 813, "@Cabc"},
		{"GET_SESSION_PARAMETERS", "@@B\\Y", 1817, ""},
		{"SSO with the ticket abc", "@@GCL@Cabc", 204, "@Cabc"},
		{"PONG", "@@BCD", 196, ""},
		{"TEST_LATENCY with the id 1", "@@CD{I", 315, "I"},
	} {
		r := strings.NewReader(c.in)
		id, body, err := readPacket(r)
		if err != nil || id != c.id || string(body) != c.body || r.Len() != 0 {
			t.Errorf("%s: readPacket(%q) = %d, %q, %v, leaving %d bytes; want %d, %q", c.name, c.in, id, body, err, r.Len(), c.id, c.body)
		}
	}
}

func TestReadPacketReadsOnePacketAtATime(t *testing.T) {
	r := strings.NewReader("@@BCN@@F_R@Bab")
	for _, want := range []struct {
		id   int
		body string
	}{{206, ""}, {2002, "@Bab"}} {
		id, body, err := readPacket(r)
		if err != nil || id != want.id || string(body) != want.body {
			t.Fatalf("readPacket = %d, %q, %v; want %d, %q", id, body, err, want.id, want.body)
		}
	}
	if _, _, err := readPacket(r); !errors.Is(err, io.EOF) {
		t.Errorf("readPacket at the end = %v, want io.EOF", err)
	}
}

// The length counts the 2 characters of the id, so the client never sends one below 2.
func TestReadPacketRefusesALengthTooShortForTheId(t *testing.T) {
	for _, in := range []string{"@@@", "@@A", "@@@BCN"} {
		if _, _, err := readPacket(strings.NewReader(in)); !errors.Is(err, encoding.ErrMalformed) {
			t.Errorf("readPacket(%q) = %v, want encoding.ErrMalformed", in, err)
		}
	}
}

func TestReadPacketCutShort(t *testing.T) {
	for in, want := range map[string]error{
		"":        io.EOF,
		"@":       io.ErrUnexpectedEOF,
		"@@B":     io.ErrUnexpectedEOF,
		"@@BC":    io.ErrUnexpectedEOF,
		"@@F_R@B": io.ErrUnexpectedEOF,
	} {
		if _, _, err := readPacket(strings.NewReader(in)); !errors.Is(err, want) {
			t.Errorf("readPacket(%q) = %v, want %v", in, err, want)
		}
	}
}

func TestEncodePacketFramesTheServersMessages(t *testing.T) {
	for _, c := range []struct {
		name       string
		id         int
		body, want string
	}{
		{"HELLO", 0, "", "@@\x01"},
		{"CRYPTOPARAMETERS with the int 0", 277, "H", "DUH\x01"},
		{"ENDOFCRYPTOPARAMS", 278, "", "DV\x01"},
		{"SESSION_PARAMETERS with the pairs 5 dd-mm-yyyy and 9 0", 257, "JQAdd-mm-yyyy\x02QBH", "DAJQAdd-mm-yyyy\x02QBH\x01"},
		{"LOGIN_OK", 3, "", "@C\x01"},
		{"PING", 50, "", "@r\x01"},
		{"the answer to TEST_LATENCY 1", 354, "I", "EbI\x01"},
	} {
		if got, err := encodePacket(c.id, []byte(c.body)); err != nil || string(got) != c.want {
			t.Errorf("%s: encodePacket = %q, %v; want %q", c.name, got, err, c.want)
		}
	}
}

// The client ends a message at its first character 1, so a body holding one would end early.
func TestEncodePacketRefusesABodyThatHoldsTheCharacter1(t *testing.T) {
	if got, err := encodePacket(33, []byte("a\x01b")); !errors.Is(err, encoding.ErrUnencodable) || got != nil {
		t.Errorf("encodePacket = %q, %v; want encoding.ErrUnencodable and nothing", got, err)
	}
}

func TestEncodePacketRefusesAnIdBeyondTwoB64Characters(t *testing.T) {
	for _, id := range []int{-1, 4096} {
		if got, err := encodePacket(id, nil); !errors.Is(err, encoding.ErrUnencodable) || got != nil {
			t.Errorf("encodePacket(%d) = %q, %v; want encoding.ErrUnencodable and nothing", id, got, err)
		}
	}
}
