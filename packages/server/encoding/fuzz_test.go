package encoding

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"math"
	"strings"
	"testing"
	"unicode/utf8"
)

// readerOnly hides every method but Read, so that the readers take their path for a reader that
// is not an io.ByteReader.
type readerOnly struct{ r io.Reader }

func (o readerOnly) Read(p []byte) (int, error) { return o.r.Read(p) }

// readBoth reads b through an io.ByteReader and through a plain io.Reader, checks that both give
// the same, and returns the value, how many bytes were read and the error.
func readBoth[T comparable](t *testing.T, name string, b []byte, read func(io.Reader) (T, error)) (T, int, error) {
	t.Helper()
	byteReader := bytes.NewReader(b)
	v, err := read(byteReader)
	plain := bytes.NewReader(b)
	v2, err2 := read(readerOnly{plain})
	if v != v2 || fmt.Sprint(err) != fmt.Sprint(err2) || byteReader.Len() != plain.Len() {
		t.Errorf("%s(%q) = %v, %v through an io.ByteReader, but %v, %v through a plain io.Reader", name, b, v, err, v2, err2)
	}
	if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrUnexpectedEOF) && !errors.Is(err, ErrMalformed) {
		t.Errorf("%s(%q) = %v, which is not an error of a read", name, b, err)
	}
	return v, len(b) - byteReader.Len(), err
}

func FuzzReaders(f *testing.F) {
	for _, seed := range []string{
		"", "H", "M", "PY", "XzC", "s\x7f\x7f\x7f\x7f_", "t@@@@`", "p@@@@`", "@", "x\x7f\x7f\x7f\x7f\x7f\x7f",
		"abc\x02", "\x02", "\xc3\xa9\x02", "\xff\x02", "@Bab", "@Cab", "\x7f\x7f", "A", "\x80", "@@F_R@Bab",
	} {
		f.Add([]byte(seed))
	}
	f.Fuzz(func(t *testing.T, b []byte) {
		content := lingoString(b)

		if v, n, err := readBoth(t, "ReadVL64", b, ReadVL64); err == nil {
			client, rest := lingoGetIntFrom(content)
			if v != client || n != len(b)-len(rest) {
				t.Errorf("ReadVL64(%q) = %d after %d bytes, but GetIntFrom reads %d and leaves %d bytes", b, v, n, client, len(rest))
			}
		}

		for width := 1; width <= maxB64Width; width++ {
			v, n, err := readBoth(t, "ReadB64", b, func(r io.Reader) (int, error) { return ReadB64(r, width) })
			if len(b) < width {
				if err == nil {
					t.Errorf("ReadB64(%q, %d) = %d with fewer bytes than its width", b, width, v)
				}
				continue
			}
			if err != nil || n != width {
				t.Errorf("ReadB64(%q, %d) = %v after %d bytes", b, width, err, n)
				continue
			}
			var again bytes.Buffer
			if err := WriteB64(&again, v, width); err != nil {
				t.Errorf("WriteB64(%d, %d): %v", v, width, err)
			}
			for i, c := range again.Bytes() {
				if c != 64|b[i]&63 {
					t.Errorf("ReadB64(%q, %d) = %d, which writes back as %q", b, width, v, again.Bytes())
					break
				}
			}
			switch width {
			case 1:
				if client, _ := lingoGetByteFrom(content); int(client) != v {
					t.Errorf("ReadB64(%q, 1) = %d, but GetByteFrom reads %d", b, v, client)
				}
			case 2:
				if client := lingoMessageID(content); int(client) != v {
					t.Errorf("ReadB64(%q, 2) = %d, but msghandler reads the id %d", b, v, client)
				}
			}
		}

		end := bytes.IndexByte(b, 2)
		s, n, err := readBoth(t, "ReadString", b, ReadString)
		if want := end >= 0 && utf8.Valid(b[:end]); (err == nil) != want {
			t.Errorf("ReadString(%q) = %q, %v", b, s, err)
		} else if err == nil {
			client, rest := lingoGetStrFrom(content)
			if s != string(lingoBytes(client)) || n != len(b)-len(rest) {
				t.Errorf("ReadString(%q) = %q after %d bytes, but GetStrFrom reads %q and leaves %d bytes", b, s, n, lingoBytes(client), len(rest))
			}
		}

		if s, n, err := readBoth(t, "ReadB64String", b, ReadB64String); err == nil {
			if length := lingoMessageID(content); len(s) != int(length) || n != 2+len(s) || !utf8.ValidString(s) {
				t.Errorf("ReadB64String(%q) = %q after %d bytes", b, s, n)
			}
		}

		flag, n, err := readBoth(t, "ReadBool", b, ReadBool)
		if (err == nil) != (len(b) > 0) {
			t.Errorf("ReadBool(%q) = %v", b, err)
		} else if err == nil {
			if client, _ := lingoGetBoolFrom(content); flag != client || n != 1 {
				t.Errorf("ReadBool(%q) = %t after %d bytes, but GetBoolFrom reads %t", b, flag, n, client)
			}
		}

		raw, n, err := readBoth(t, "ReadRaw", b, ReadRaw)
		if (err == nil) != utf8.Valid(b) || (err == nil && (raw != string(b) || n != len(b))) {
			t.Errorf("ReadRaw(%q) = %q, %v after %d bytes", b, raw, err, n)
		}
	})
}

func FuzzVL64(f *testing.F) {
	for _, v := range []int32{0, 1, -1, 3, 4, 100, -100, 1000, 67108863, 67108864, math.MaxInt32, -math.MaxInt32, math.MinInt32} {
		f.Add(v)
	}
	f.Fuzz(func(t *testing.T, v int32) {
		var b bytes.Buffer
		if err := WriteVL64(&b, v); err != nil {
			t.Fatalf("WriteVL64(%d): %v", v, err)
		}
		if client := lingoSendNewInteger(v); !bytes.Equal(b.Bytes(), client) {
			t.Errorf("WriteVL64(%d) wrote %q, but the client's sendNew writes %q", v, b.Bytes(), client)
		}
		if client, rest := lingoGetIntFrom(lingoString(b.Bytes())); client != v || len(rest) != 0 {
			t.Errorf("the client's GetIntFrom reads %q as %d, want %d", b.Bytes(), client, v)
		}
		if got, err := ReadVL64(&b); err != nil || got != v || b.Len() != 0 {
			t.Errorf("ReadVL64 read %d back as %d, %v", v, got, err)
		}
	})
}

// readableByTheClient reports whether the client's decodeUTF8 gives back the characters of s. It
// reads sequences of 1 to 3 bytes, and it misreads those that start with the byte 0xE0, which
// U+0800 to U+0FFF begin with.
func readableByTheClient(s string) bool {
	for _, r := range s {
		if (r >= 0x800 && r <= 0xfff) || r > 0xffff {
			return false
		}
	}
	return true
}

func FuzzText(f *testing.F) {
	for _, seed := range []string{"", "abc", "é", "日本", "a\x02b", "\xff", "😀", "ࠀ", strings.Repeat("a", 4095), strings.Repeat("a", 4096)} {
		f.Add(seed)
	}
	f.Fuzz(func(t *testing.T, s string) {
		valid := utf8.ValidString(s)

		var b bytes.Buffer
		err := WriteString(&b, s)
		switch {
		case !valid || strings.IndexByte(s, 2) >= 0:
			if !errors.Is(err, ErrUnencodable) || b.Len() != 0 {
				t.Errorf("WriteString(%q) wrote %q, %v, want nothing and ErrUnencodable", s, b.Bytes(), err)
			}
		case err != nil:
			t.Errorf("WriteString(%q): %v", s, err)
		default:
			if readableByTheClient(s) {
				client, rest := lingoGetStrFrom(lingoDecodeUTF8(lingoString(b.Bytes())))
				if string(client) != s || len(rest) != 0 {
					t.Errorf("the client reads %q, which WriteString wrote for %q, as %q", b.Bytes(), s, string(client))
				}
			}
			if got, err := ReadString(&b); err != nil || got != s || b.Len() != 0 {
				t.Errorf("ReadString read %q back as %q, %v", s, got, err)
			}
		}

		b.Reset()
		err = WriteB64String(&b, s)
		switch {
		case !valid || len(s) > 4095:
			if !errors.Is(err, ErrUnencodable) || b.Len() != 0 {
				t.Errorf("WriteB64String(%q) wrote %q, %v, want nothing and ErrUnencodable", s, b.Bytes(), err)
			}
		case err != nil:
			t.Errorf("WriteB64String(%q): %v", s, err)
		default:
			if !strings.ContainsFunc(s, func(r rune) bool { return r > 0xffff }) {
				if client := lingoSendNewString([]rune(s)); !bytes.Equal(b.Bytes(), client) {
					t.Errorf("WriteB64String(%q) wrote %q, but the client's sendNew writes %q", s, b.Bytes(), client)
				}
			}
			if got, err := ReadB64String(&b); err != nil || got != s || b.Len() != 0 {
				t.Errorf("ReadB64String read %q back as %q, %v", s, got, err)
			}
		}

		b.Reset()
		err = WriteRaw(&b, s)
		if !valid {
			if !errors.Is(err, ErrUnencodable) || b.Len() != 0 {
				t.Errorf("WriteRaw(%q) wrote %q, %v, want nothing and ErrUnencodable", s, b.Bytes(), err)
			}
			return
		}
		if got, err := ReadRaw(&b); err != nil || got != s {
			t.Errorf("ReadRaw read %q back as %q, %v", s, got, err)
		}
	})
}
