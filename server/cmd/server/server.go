package main

import "github.com/kronothepenguin/project-reborn/internal/habbo"

func main() {
	s := habbo.NewServer()
	s.RunTCP()
}
