package encoding

import (
	"bytes"
	"errors"
	"io"
	"math"
	"strings"
	"testing"
)

// The bytes in these tables were worked out with the ports of the client's scripts in
// lingo_test.go, and each test checks them against the ports as well as the encoding.

func TestVL64(t *testing.T) {
	for _, c := range []struct {
		v    int32
		wire string
	}{
		{0, "H"},
		{1, "I"},
		{3, "K"},
		{-1, "M"},
		{4, "PA"},
		{100, "PY"},
		{-100, "TY"},
		{1000, "XzC"},
		{67108863, "k\x7f\x7f\x7f\x7f"},
		{67108864, "p@@@@A"},
		{math.MaxInt32, "s\x7f\x7f\x7f\x7f_"},
		{-math.MaxInt32, "w\x7f\x7f\x7f\x7f_"},
		{math.MinInt32, "t@@@@`"},
	} {
		if client := string(lingoSendNewInteger(c.v)); client != c.wire {
			t.Errorf("the client's sendNew writes %d as %q, want %q", c.v, client, c.wire)
		}
		if v, rest := lingoGetIntFrom(lingoString([]byte(c.wire))); v != c.v || len(rest) != 0 {
			t.Errorf("the client's GetIntFrom reads %q as %d and leaves %q, want %d", c.wire, v, lingoBytes(rest), c.v)
		}
		var b bytes.Buffer
		if err := WriteVL64(&b, c.v); err != nil || b.String() != c.wire {
			t.Errorf("WriteVL64(%d) wrote %q, %v, want %q", c.v, b.String(), err, c.wire)
		}
		r := strings.NewReader(c.wire + "H")
		if v, err := ReadVL64(r); err != nil || v != c.v || r.Len() != 1 {
			t.Errorf("ReadVL64(%q) = %d, %v and left %d bytes, want %d and 1 byte", c.wire+"H", v, err, r.Len(), c.v)
		}
	}
}

func TestReadVL64ReadsAsGetIntFrom(t *testing.T) {
	for _, wire := range []string{"P@", "X@@", "\xc8", "\xd8@@"} {
		client, _ := lingoGetIntFrom(lingoString([]byte(wire)))
		if v, err := ReadVL64(strings.NewReader(wire)); err != nil || v != client {
			t.Errorf("ReadVL64(%q) = %d, %v, want %d as GetIntFrom reads it", wire, v, err, client)
		}
	}
}

func TestReadVL64RefusesMalformedValues(t *testing.T) {
	for _, c := range []struct {
		name, wire string
		want       error
	}{
		{"nothing", "", io.EOF},
		{"a count of 0", "@", ErrMalformed},
		{"a count of 7", "x\x7f\x7f\x7f\x7f\x7f\x7f", ErrMalformed},
		{"fewer characters than its count", "XzC"[:2], io.ErrUnexpectedEOF},
		{"2 to the 31", "p@@@@`", ErrMalformed},
		{"2 to the 32, less one", "s\x7f\x7f\x7f\x7f\x7f", ErrMalformed},
		{"minus 2 to the 32, less one", "w\x7f\x7f\x7f\x7f\x7f", ErrMalformed},
	} {
		if v, err := ReadVL64(strings.NewReader(c.wire)); !errors.Is(err, c.want) {
			t.Errorf("%s: ReadVL64(%q) = %d, %v, want %v", c.name, c.wire, v, err, c.want)
		}
	}
}

func TestB64(t *testing.T) {
	for _, c := range []struct {
		v, width int
		wire     string
	}{
		{0, 2, "@@"},
		{206, 2, "CN"},
		{2002, 2, "_R"},
		{4095, 2, "\x7f\x7f"},
		{2, 3, "@@B"},
		{6, 3, "@@F"},
		{262143, 3, "\x7f\x7f\x7f"},
		{0, 1, "@"},
		{63, 1, "\x7f"},
	} {
		var b bytes.Buffer
		if err := WriteB64(&b, c.v, c.width); err != nil || b.String() != c.wire {
			t.Errorf("WriteB64(%d, %d) wrote %q, %v, want %q", c.v, c.width, b.String(), err, c.wire)
		}
		r := strings.NewReader(c.wire + "@")
		if v, err := ReadB64(r, c.width); err != nil || v != c.v || r.Len() != 1 {
			t.Errorf("ReadB64(%q, %d) = %d, %v and left %d bytes, want %d and 1 byte", c.wire+"@", c.width, v, err, r.Len(), c.v)
		}
	}
}

func TestB64MatchesTheClientForEveryValue(t *testing.T) {
	var b bytes.Buffer
	for v := range 1 << 6 {
		b.Reset()
		if err := WriteB64(&b, v, 1); err != nil {
			t.Fatalf("WriteB64(%d, 1): %v", v, err)
		}
		if client, rest := lingoGetByteFrom(lingoString(b.Bytes())); int(client) != v || len(rest) != 0 {
			t.Fatalf("the client's GetByteFrom reads %q as %d, want %d", b.Bytes(), client, v)
		}
		if got, err := ReadB64(&b, 1); err != nil || got != v {
			t.Fatalf("ReadB64 read %d back as %d, %v", v, got, err)
		}
	}
	for v := range 1 << 12 {
		b.Reset()
		if err := WriteB64(&b, v, 2); err != nil {
			t.Fatalf("WriteB64(%d, 2): %v", v, err)
		}
		if client := lingoShort(int32(v)); !bytes.Equal(b.Bytes(), client) {
			t.Fatalf("WriteB64(%d, 2) wrote %q, but the client's sendNew writes the #short %q", v, b.Bytes(), client)
		}
		if client := lingoMessageID(lingoString(b.Bytes())); int(client) != v {
			t.Fatalf("the client's msghandler reads the id %q as %d, want %d", b.Bytes(), client, v)
		}
		if got, err := ReadB64(&b, 2); err != nil || got != v {
			t.Fatalf("ReadB64 read %d back as %d, %v", v, got, err)
		}
	}
	for v := range 1 << 18 {
		b.Reset()
		if err := WriteB64(&b, v, 3); err != nil {
			t.Fatalf("WriteB64(%d, 3): %v", v, err)
		}
		if client := lingoLength(int32(v)); !bytes.Equal(b.Bytes(), client) {
			t.Fatalf("WriteB64(%d, 3) wrote %q, but the client's send writes the length %q", v, b.Bytes(), client)
		}
		if got, err := ReadB64(&b, 3); err != nil || got != v {
			t.Fatalf("ReadB64 read %d back as %d, %v", v, got, err)
		}
	}
}

func TestWriteB64RefusesWhatItsCharactersCannotHold(t *testing.T) {
	for _, c := range []struct{ v, width int }{{-1, 2}, {4096, 2}, {262144, 3}, {64, 1}} {
		var b bytes.Buffer
		if err := WriteB64(&b, c.v, c.width); !errors.Is(err, ErrUnencodable) || b.Len() != 0 {
			t.Errorf("WriteB64(%d, %d) wrote %q, %v, want nothing and ErrUnencodable", c.v, c.width, b.String(), err)
		}
	}
	for _, width := range []int{0, 4} {
		if err := WriteB64(io.Discard, 0, width); err == nil {
			t.Errorf("WriteB64(0, %d) accepted the width", width)
		}
		r := strings.NewReader("@@@@")
		if _, err := ReadB64(r, width); err == nil || r.Len() != 4 {
			t.Errorf("ReadB64 with width %d = %v and read %d bytes, want an error and no read", width, err, 4-r.Len())
		}
	}
}

func TestReadB64RefusesAShortValue(t *testing.T) {
	for _, c := range []struct {
		wire string
		want error
	}{{"", io.EOF}, {"@", io.ErrUnexpectedEOF}, {"@@", io.ErrUnexpectedEOF}} {
		if _, err := ReadB64(strings.NewReader(c.wire), 3); !errors.Is(err, c.want) {
			t.Errorf("ReadB64(%q, 3) = %v, want %v", c.wire, err, c.want)
		}
	}
}

func TestBool(t *testing.T) {
	for v, wire := range map[bool]string{true: "A", false: "@"} {
		var b bytes.Buffer
		if err := WriteBool(&b, v); err != nil || b.String() != wire {
			t.Errorf("WriteBool(%t) wrote %q, %v, want %q", v, b.String(), err, wire)
		}
		if client := string(lingoSendNewBoolean(lingoBool(v))); client != wire {
			t.Errorf("the client's sendNew writes %t as %q, want %q", v, client, wire)
		}
	}
	for c := range 256 {
		wire := []byte{byte(c)}
		client, _ := lingoGetBoolFrom(lingoString(wire))
		if v, err := ReadBool(bytes.NewReader(wire)); err != nil || v != client {
			t.Errorf("ReadBool(%q) = %t, %v, want %t as GetBoolFrom reads it", wire, v, err, client)
		}
	}
	if _, err := ReadBool(strings.NewReader("")); !errors.Is(err, io.EOF) {
		t.Errorf("ReadBool of nothing = %v, want io.EOF", err)
	}
}

func TestString(t *testing.T) {
	for _, c := range []struct{ s, wire string }{
		{"abc", "abc\x02"},
		{"", "\x02"},
		{"é", "\xc3\xa9\x02"},
		{"日本", "\xe6\x97\xa5\xe6\x9c\xac\x02"},
		{"Ελλάδα €", "\xce\x95\xce\xbb\xce\xbb\xce\xac\xce\xb4\xce\xb1 \xe2\x82\xac\x02"},
	} {
		var b bytes.Buffer
		if err := WriteString(&b, c.s); err != nil || b.String() != c.wire {
			t.Errorf("WriteString(%q) wrote %q, %v, want %q", c.s, b.String(), err, c.wire)
		}
		client, rest := lingoGetStrFrom(lingoDecodeUTF8(lingoString([]byte(c.wire))))
		if got := string(client); got != c.s || len(rest) != 0 {
			t.Errorf("the client's decodeUTF8 and GetStrFrom read %q as %q and leave %q, want %q", c.wire, got, lingoBytes(rest), c.s)
		}
		r := strings.NewReader(c.wire + "H")
		if s, err := ReadString(r); err != nil || s != c.s || r.Len() != 1 {
			t.Errorf("ReadString(%q) = %q, %v and left %d bytes, want %q and 1 byte", c.wire+"H", s, err, r.Len(), c.s)
		}
	}
}

func TestStringErrors(t *testing.T) {
	for _, s := range []string{"a\x02b", "\xff"} {
		var b bytes.Buffer
		if err := WriteString(&b, s); !errors.Is(err, ErrUnencodable) || b.Len() != 0 {
			t.Errorf("WriteString(%q) wrote %q, %v, want nothing and ErrUnencodable", s, b.String(), err)
		}
	}
	for _, c := range []struct {
		wire string
		want error
	}{{"", io.EOF}, {"abc", io.ErrUnexpectedEOF}, {"\xff\x02", ErrMalformed}} {
		if s, err := ReadString(strings.NewReader(c.wire)); !errors.Is(err, c.want) {
			t.Errorf("ReadString(%q) = %q, %v, want %v", c.wire, s, err, c.want)
		}
	}
}

func TestB64String(t *testing.T) {
	long := strings.Repeat("a", 4095)
	for _, c := range []struct{ s, wire string }{
		{"ab", "@Bab"},
		{"", "@@"},
		{"é", "@B\xc3\xa9"},
		{"日本", "@F\xe6\x97\xa5\xe6\x9c\xac"},
		{long, "\x7f\x7f" + long},
	} {
		if client := string(lingoSendNewString([]rune(c.s))); client != c.wire {
			t.Errorf("the client's sendNew writes %q as %q, want %q", c.s, client, c.wire)
		}
		var b bytes.Buffer
		if err := WriteB64String(&b, c.s); err != nil || b.String() != c.wire {
			t.Errorf("WriteB64String(%q) wrote %q, %v, want %q", c.s, b.String(), err, c.wire)
		}
		r := strings.NewReader(c.wire + "H")
		if s, err := ReadB64String(r); err != nil || s != c.s || r.Len() != 1 {
			t.Errorf("ReadB64String(%q) = %q, %v and left %d bytes, want %q and 1 byte", c.wire+"H", s, err, r.Len(), c.s)
		}
	}
}

func TestB64StringErrors(t *testing.T) {
	for _, s := range []string{strings.Repeat("a", 4096), "\xff"} {
		var b bytes.Buffer
		if err := WriteB64String(&b, s); !errors.Is(err, ErrUnencodable) || b.Len() != 0 {
			t.Errorf("WriteB64String of %d bytes wrote %d bytes, %v, want nothing and ErrUnencodable", len(s), b.Len(), err)
		}
	}
	for _, c := range []struct {
		wire string
		want error
	}{{"", io.EOF}, {"@", io.ErrUnexpectedEOF}, {"@Cab", io.ErrUnexpectedEOF}, {"@A\xff", ErrMalformed}} {
		if s, err := ReadB64String(strings.NewReader(c.wire)); !errors.Is(err, c.want) {
			t.Errorf("ReadB64String(%q) = %q, %v, want %v", c.wire, s, err, c.want)
		}
	}
}

func TestRaw(t *testing.T) {
	for _, s := range []string{"", "a\tb\rc", "é \x02"} {
		var b bytes.Buffer
		if err := WriteRaw(&b, s); err != nil || b.String() != s {
			t.Errorf("WriteRaw(%q) wrote %q, %v", s, b.String(), err)
		}
		if got, err := ReadRaw(strings.NewReader(s)); err != nil || got != s {
			t.Errorf("ReadRaw(%q) = %q, %v", s, got, err)
		}
	}
	if err := WriteRaw(io.Discard, "\xff"); !errors.Is(err, ErrUnencodable) {
		t.Errorf("WriteRaw of text that is not UTF-8 = %v, want ErrUnencodable", err)
	}
	if _, err := ReadRaw(strings.NewReader("\xff")); !errors.Is(err, ErrMalformed) {
		t.Errorf("ReadRaw of text that is not UTF-8 = %v, want ErrMalformed", err)
	}
}

func TestACommandReadValueByValue(t *testing.T) {
	// GENERATEKEY (2002) with [#string: "ab"], as the client's send frames it.
	r := strings.NewReader("@@F_R@Bab")
	length, err := ReadB64(r, 3)
	if err != nil || length != 6 {
		t.Fatalf("length = %d, %v, want 6", length, err)
	}
	id, err := ReadB64(r, 2)
	if err != nil || id != 2002 {
		t.Fatalf("id = %d, %v, want 2002", id, err)
	}
	key, err := ReadB64String(r)
	if err != nil || key != "ab" || r.Len() != 0 {
		t.Fatalf("key = %q, %v with %d bytes left, want %q and nothing left", key, err, r.Len(), "ab")
	}
}

func TestAMessageReadByTheClient(t *testing.T) {
	var b bytes.Buffer
	for _, err := range []error{
		WriteB64(&b, 277, 2),
		WriteVL64(&b, -100),
		WriteString(&b, "é"),
		WriteBool(&b, true),
		WriteB64(&b, 7, 1),
		WriteRaw(&b, "x\ry"),
	} {
		if err != nil {
			t.Fatal(err)
		}
	}
	content := lingoDecodeUTF8(lingoString(b.Bytes()))
	if id := lingoMessageID(content); id != 277 {
		t.Errorf("the client reads the id %d, want 277", id)
	}
	n, content := lingoGetIntFrom(content[2:])
	s, content := lingoGetStrFrom(content)
	flag, content := lingoGetBoolFrom(content)
	small, content := lingoGetByteFrom(content)
	if n != -100 || string(s) != "é" || !flag || small != 7 || string(content) != "x\ry" {
		t.Errorf("the client reads %d, %q, %t, %d and the rest %q", n, string(s), flag, small, string(content))
	}
}
