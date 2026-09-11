package protocol

import (
	"fmt"
	"math/big"
)

var p *big.Int
var g *big.Int

func P() *big.Int {
	if p == nil {
		p = new(big.Int)
		_, err := fmt.Sscanf("A8EA077D4943CC98E53C21F5F7C7A0DB8BCE7506F8361A7C1690392F2B090C96EE8BC67BAA0DCB7183F16401F5CB838E3B6EE86B9EF2E5D0F3C49D4DC4EDC2B9", "%X", p)
		if err != nil {
			panic(err)
		}
	}
	return p
}

func G() *big.Int {
	if g == nil {
		g = new(big.Int)
		_, err := fmt.Sscanf("5", "%X", g)
		if err != nil {
			panic(err)
		}
	}
	return g
}

func salt(k []byte) []byte {
	s := []byte("mWxFRJnGJ5T9Si0OMVvEBBm8laihXkN8GmH6fuv7ldZhLyGRRKCcGzziPYBaJom")
	m := make([]byte, len(k))
	for i := range k {
		m[i] = k[i] ^ s[i%len(s)]
	}
	return m
}

type customRC4 struct {
	s []byte
	q int
	j int
	i int
}

func newCustomRC4(key []byte) *customRC4 {
	rc4 := customRC4{
		s: make([]byte, 256),
	}
	k := salt(key)
	rc4.ksa(k)

	rc4.q = 0
	rc4.j = 0
	rc4.i = 0

	premix := []byte("NV6VVFPoC7FLDlzDUri3qcOAg9cRoFOmsYR9ffDGy5P8HfF6eekX40SFSVfJ1mDb3lcpYRqdg28sp61eHkPukKbqTu1JsVEKiRavi04YtSzUsLXaYSa5BEGwg5G2OF")
	for range 52 {
		rc4.prga(premix)
	}

	return &rc4
}

func (rc4 *customRC4) ksa(key []byte) {
	for i := range 256 {
		rc4.s[i] = byte(i)
	}

	rc4.j = 0
	for rc4.q = 0; rc4.q < 256; rc4.q++ {
		rc4.j = (rc4.j + int(rc4.s[rc4.q]) + int(key[rc4.q%len(key)])) % 256
		rc4.s[rc4.q], rc4.s[rc4.j] = rc4.s[rc4.j], rc4.s[rc4.q]
	}
}

func (rc4 *customRC4) prga(data []byte) []byte {
	result := make([]byte, len(data))
	for a := range data {
		rc4.q = (rc4.q + 1) % 256
		rc4.j = (rc4.j + int(rc4.s[rc4.q])) % 256
		rc4.s[rc4.q], rc4.s[rc4.j] = rc4.s[rc4.j], rc4.s[rc4.q]

		ti := (17 * (rc4.q + 19)) % 256
		tj := (rc4.j + int(rc4.s[ti])) % 256
		rc4.s[ti], rc4.s[tj] = rc4.s[tj], rc4.s[ti]

		if rc4.q == 46 || rc4.q == 67 || rc4.q == 192 {
			t2i := (297 * (ti + 67)) % 256
			t2j := (tj + int(rc4.s[t2i])) % 256
			rc4.s[t2i], rc4.s[t2j] = rc4.s[t2j], rc4.s[t2i]
		}

		t := (int(rc4.s[rc4.q]) + int(rc4.s[rc4.j])) % 256
		d := rc4.s[t]
		result[a] = data[a] ^ d
	}
	return result
}

type Crypto struct {
	encoder *customRC4
	decoder *customRC4
}

func NewCrypto() *Crypto {
	return &Crypto{}
}

func (c *Crypto) Init(key *big.Int) {
	t := key.Text(16)
	k := []byte(t)
	c.encoder = newCustomRC4(k)
	c.decoder = newCustomRC4(k)
}

func (c *Crypto) Encode(data []byte) []byte {
	return c.encoder.prga(data)
}

func (c *Crypto) Decode(data []byte) []byte {
	result := c.decoder.prga(data)
	seed := []byte("xllVGKnnQcW8aX4WefdKrBWTqiW5EwT")
	c.decoder.prga(seed)
	return result
}
