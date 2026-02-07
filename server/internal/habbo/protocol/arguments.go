package protocol

import "io"

type Argument io.WriterTo

type RawString string

func (r RawString) WriteTo(w io.Writer) (int64, error) {
	n, err := WriteRawString(w, string(r))
	return int64(n), err
}

type String string

func (s String) WriteTo(w io.Writer) (int64, error) {
	n, err := WriteString(w, string(s))
	return int64(n), err
}

type Int int

func (i Int) WriteTo(w io.Writer) (int64, error) {
	n, err := WriteInt(w, int(i))
	return int64(n), err
}

type Bool bool

func (b Bool) WriteTo(w io.Writer) (int64, error) {
	n, err := WriteBool(w, bool(b))
	return int64(n), err
}
