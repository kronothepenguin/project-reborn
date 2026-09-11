package main

import "hash/fnv"

const (
	AppBase   = 10000 // app ports:  10000-19999
	AstroBase = 20000 // astro ports: 20000-29999
	Span      = 10000 // same span width for both
)

func hash(s string) int {
	h := fnv.New32a()
	h.Write([]byte(s))
	return int(h.Sum32() % uint32(Span))
}

func AppPort(name string) int {
	return int(AppBase + hash("app:"+name))
}

func AstroPort(name string) int {
	return int(AstroBase + hash("astro:"+name))
}
