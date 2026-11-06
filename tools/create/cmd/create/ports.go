package main

import "hash/fnv"

const (
	AppBase   = 10000 // app ports:   10000-19999
	AstroBase = 20000 // astro ports: 20000-29999
	ViteBase  = 30000 // vite ports:  30000-39999
	Span      = 10000 // same span width for all three
)

func hash(s string) int {
	h := fnv.New32a()
	h.Write([]byte(s))
	return int(h.Sum32() % uint32(Span))
}

func AppPort(name string) int {
	return AppBase + hash("app:"+name)
}

func AstroPort(name string) int {
	return AstroBase + hash("astro:"+name)
}

func VitePort(name string) int {
	return ViteBase + hash("vite:"+name)
}
